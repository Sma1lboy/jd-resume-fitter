import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

import { generateObject } from 'ai';
import { z } from 'zod';
import { OpenAISettings, UserProfile } from '@/types';

// Define the schema for the UserProfile using Zod - Weights removed from schema
const userProfileSchema = z.object({
  name: z.string().describe('Full name of the person'),
  title: z.string().describe('Professional title or role'),
  email: z.string().describe('Email address'),
  phone: z.string().describe('Phone number'),
  location: z.string().describe('Location or address'),
  linkedin: z.string().optional().describe('LinkedIn profile URL'),
  github: z.string().optional().describe('GitHub profile URL'),
  website: z.string().optional().describe('Personal website URL'),
  summary: z.string().describe('Professional summary or objective'),
  skills: z.array(z.string()).describe('List of skills'),
  courses: z
    .array(z.string())
    .optional()
    .describe('List of relevant courses taken'),
  experience: z
    .array(
      z.object({
        company: z.string().describe('Company name'),
        title: z.string().describe('Job title'),
        date: z
          .string()
          .describe('Employment period (e.g., "Jan 2020 - Present")'),
        description: z // Description text only
          .array(z.string())
          .describe('List of responsibilities and achievements (text only)'),
      })
    )
    .describe('Work experience'),
  education: z
    .array(
      z.object({
        institution: z.string().describe('Educational institution name'),
        degree: z.string().describe('Degree or certification'),
        date: z.string().describe('Period of study (e.g., "2015 - 2019")'),
        relevantCourses: z
          .string()
          .optional()
          .describe('Relevant courses taken'),
      })
    )
    .describe('Educational background'),
  projects: z
    .array(
      z.object({
        name: z.string().describe('Project name'),
        description: z // Description text only
          .array(z.string())
          .describe('List of project details and achievements (text only)'),
        technologies: z.string().optional().describe('Technologies used'),
        dateRange: z
          .string()
          .optional()
          .describe('Project duration (e.g., "Jan 2023 - Jun 2023")'),
      })
    )
    .optional()
    .describe('Personal or academic projects'),
  certifications: z
    .array(
      z.object({
        name: z.string().describe('Certification name'),
        issuer: z.string().describe('Certification issuer'),
        date: z.string().describe('Date of certification'),
      })
    )
    .optional()
    .describe('Professional certifications'),
  languages: z
    .array(
      z.object({
        language: z.string().describe('Language name'),
        proficiency: z
          .string()
          .describe('Proficiency level (e.g., "Fluent", "Intermediate")'),
      })
    )
    .optional()
    .describe('Language proficiency'),
});

/**
 * Parse resume text using AI to extract structured profile information
 * @param resumeText The text content of the resume to parse
 * @param settings OpenAI settings (API key, model, etc.)
 * @returns Parsed UserProfile object
 */
export async function parseResumeWithAI(
  resumeText: string,
  settings: OpenAISettings
): Promise<UserProfile> {
  // Validate settings
  if (!settings.apiKey || settings.apiKey.trim() === '') {
    throw new Error('API key is required for resume parsing');
  }

  // Use the model from settings
  const modelName = settings.model || 'gpt-4';

  // Use generateObject from the AI SDK to parse the resume

  const provider = createOpenAICompatible({
    name: 'hahaProivder',
    baseURL: settings.endpoint,
    apiKey: settings.apiKey,
  });

  const { object: parsedProfile } = await generateObject({
    model: provider(modelName),
    schema: userProfileSchema, // Use schema WITHOUT weights
    prompt: `Parse the following resume text into a structured profile:\n\n${resumeText}`,
    temperature: 0.1,
    // System prompt updated to NOT mention weights
    system: `
You are an expert resume parser. Your task is to extract structured information from a resume text according to the provided schema.
Analyze the provided resume text and extract all relevant information including:
1. Basic information (name, title, contact details, links)
2. Professional Summary
3. Skills (as an array of strings)
4. Courses (as an optional array of strings)
5. Work Experience (as an array of objects, each containing company, title, date, and description array of strings)
6. Education (as an array of objects, each containing institution, degree, date, and optional relevantCourses string)
7. Projects (as an optional array of objects, each containing name, description array of strings, optional technologies, optional dateRange)
8. Certifications (as an optional array of objects with name, issuer, date)
9. Languages (as an optional array of objects with language, proficiency)

If a field is not found, omit it or use an empty array/string as appropriate based on the schema requirements (required vs optional). Do NOT infer or include any kind of importance weighting.
`,
  });

  // Construct final profile, adding default weight = 1
  const finalProfile: UserProfile = {
    name: parsedProfile.name ?? '',
    title: parsedProfile.title ?? '',
    email: parsedProfile.email ?? '',
    phone: parsedProfile.phone ?? '',
    location: parsedProfile.location ?? '',
    summary: parsedProfile.summary ?? '',
    skills: parsedProfile.skills ?? [],
    courses: parsedProfile.courses ?? [],
    experience: (parsedProfile.experience ?? []).map(exp => ({
      company: exp.company ?? '',
      title: exp.title ?? '',
      date: exp.date ?? '',
      // Map description strings to objects with default weight 1
      description: (exp.description ?? []).map(text => ({
        text: text ?? '',
        weight: 1,
      })),
      weight: 1, // Add default weight 1 to experience item
    })),
    education: (parsedProfile.education ?? []).map(edu => ({
      institution: edu.institution ?? '',
      degree: edu.degree ?? '',
      date: edu.date ?? '',
      relevantCourses: edu.relevantCourses,
    })),
    linkedin: parsedProfile.linkedin,
    github: parsedProfile.github,
    website: parsedProfile.website,
    projects: (parsedProfile.projects ?? []).map(proj => ({
      name: proj.name ?? '',
      // Map description strings to objects with default weight 1
      description: (proj.description ?? []).map(text => ({
        text: text ?? '',
        weight: 1,
      })),
      technologies: proj.technologies,
      dateRange: proj.dateRange,
      weight: 1, // Add default weight 1 to project item
    })),
    certifications: (parsedProfile.certifications ?? []).map(cert => ({
      name: cert.name ?? '',
      issuer: cert.issuer ?? '',
      date: cert.date ?? '',
    })),
    languages: (parsedProfile.languages ?? []).map(lang => ({
      language: lang.language ?? '',
      proficiency: lang.proficiency ?? '',
    })),
  };

  return finalProfile;
}
