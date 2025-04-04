import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { generateText, generateObject } from 'ai';
import { z } from 'zod';
import { OpenAISettings, UserProfile } from '@/types';
import { logger } from './logger';

// Schema for UserProfile validation
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
 * Create OpenAI provider from settings
 */
function createProvider(settings: OpenAISettings) {
  if (!settings.apiKey || settings.apiKey.trim() === '') {
    throw new Error('API key is required for AI operations');
  }

  return createOpenAICompatible({
    name: 'openaiProvider',
    baseURL: settings.endpoint || 'https://api.openai.com/v1',
    apiKey: settings.apiKey,
  });
}

/**
 * Extract content from a response that contains marker tags
 */
export function extractMarkedContent(
  text: string, 
  startTag: string = '<CONTENT>', 
  endTag: string = '</CONTENT>'
): string {
  if (!text.includes(startTag) || !text.includes(endTag)) {
    return text;
  }

  const startIndex = text.indexOf(startTag) + startTag.length;
  const endIndex = text.indexOf(endTag);
  
  if (startIndex >= 0 && endIndex > startIndex) {
    return text.substring(startIndex, endIndex).trim();
  }
  
  return text;
}

/**
 * Generate a tailored resume using AI
 */
export async function generateTailoredResumeSimple(
  jobDescription: string,
  userProfile: UserProfile,
  template: string,
  settings: OpenAISettings
): Promise<string> {
  const prompt = `Create a tailored resume for the following job description using the provided user profile and template.
  
Job Description:
${jobDescription}

User Profile:
${JSON.stringify(userProfile, null, 2)}

Resume Template:
${template}

Your task is to analyze the job description, identify key requirements and skills needed, and create a resume 
that highlights the most relevant aspects of the user's profile for this specific position.

IMPORTANT: You MUST wrap your entire output document inside <CONTENT> tags, like this:
<CONTENT>
[Resume content here]
</CONTENT>`;

  try {
    const provider = createProvider(settings);
    const modelName = settings.model || 'gpt-4o-mini';

    const { text } = await generateText({
      model: provider(modelName),
      prompt,
      temperature: 0.3,
      system: `You are an expert resume writer. Analyze the job description and create a tailored resume.`,
    });

    return extractMarkedContent(text);
  } catch (error) {
    logger.error('Error generating tailored resume: ' + String(error));
    throw new Error(`Failed to generate resume: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Parse resume text using AI to extract structured profile information
 */
export async function parseResumeWithAISimple(
  resumeText: string,
  settings: OpenAISettings
): Promise<UserProfile> {
  try {
    const provider = createProvider(settings);
    const modelName = settings.model || 'gpt-4o-mini';

    const { object: parsedProfile } = await generateObject({
      model: provider(modelName),
      schema: userProfileSchema,
      prompt: `Parse the following resume text into a structured profile:\n\n${resumeText}`,
      temperature: 0.1,
      system: `
You are an expert resume parser. Extract structured information from the resume text including:
1. Basic information (name, title, contact details)
2. Skills
3. Work experience
4. Education
5. Other relevant sections (certifications, languages, etc.)

If a field is not found, use an empty string or array as appropriate.
`,
    });

    return parsedProfile as UserProfile;
  } catch (error) {
    logger.error('Error parsing resume with AI: ' + String(error));
    throw new Error(`Failed to parse resume: ${error instanceof Error ? error.message : String(error)}`);
  }
} 