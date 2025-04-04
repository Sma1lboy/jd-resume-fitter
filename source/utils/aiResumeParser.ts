import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

import { generateObject } from 'ai';
import { z } from 'zod';
import { debugLogger } from './debugLogger';
import { OpenAISettings, UserProfile } from '@/types';

// Define the schema for the UserProfile using Zod
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
  experience: z
    .array(
      z.object({
        company: z.string().describe('Company name'),
        title: z.string().describe('Job title'),
        date: z
          .string()
          .describe('Employment period (e.g., "Jan 2020 - Present")'),
        description: z
          .array(z.string())
          .describe('List of responsibilities and achievements'),
      })
    )
    .describe('Work experience'),
  education: z
    .array(
      z.object({
        institution: z.string().describe('Educational institution name'),
        degree: z.string().describe('Degree or certification'),
        date: z.string().describe('Period of study (e.g., "2015 - 2019")'),
      })
    )
    .describe('Educational background'),
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
  debugLogger.info('Starting AI-based resume parsing using AI SDK...');
  debugLogger.info(`Resume text length: ${resumeText.length} characters`);

  // Validate settings
  if (!settings.apiKey || settings.apiKey.trim() === '') {
    throw new Error('API key is required for resume parsing');
  }

  // Use the model from settings
  const modelName = settings.model || 'gpt-4';

  // Use generateObject from the AI SDK to parse the resume
  debugLogger.info('Calling AI SDK for resume parsing...');

  const provider = createOpenAICompatible({
    name: 'hahaProivder',
    baseURL: settings.endpoint,
    apiKey: settings.apiKey,
  });

  const { object: parsedProfile } = await generateObject({
    model: provider(modelName),
    schema: userProfileSchema,
    prompt: `Parse the following resume text into a structured profile:\n\n${resumeText}`,
    temperature: 0.1, // Low temperature for more deterministic results
    system: `
You are an expert resume parser. Your task is to extract structured information from a resume text.
Analyze the provided resume text and extract all relevant information including:
1. Basic information (name, title, contact details)
2. Skills
3. Work experience
4. Education
5. Other relevant sections (certifications, languages, etc.)

If a field is not found in the resume, use an empty string or array as appropriate.
Be thorough and extract as much information as possible from the text.
`,
  });

  debugLogger.info('Successfully parsed resume with AI SDK');
  return parsedProfile as UserProfile;
}
