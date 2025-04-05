import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { generateText, generateObject } from 'ai';
import { browser } from 'webextension-polyfill-ts';
import { z } from 'zod';
import { OpenAISettings, UserProfile } from '@/types';
import { logger } from './logger';
import { openInOverleaf } from './overleafIntegration';

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

// Schema for job metadata extraction
const jobMetadataSchema = z.object({
  company: z
    .string()
    .describe('Company name extracted from job description or URL'),
  position: z
    .string()
    .describe('Job position/title extracted from job description'),
  industry: z.string().describe('Industry sector the job belongs to'),
  location: z.string().describe('Job location if mentioned'),
  keyRequirements: z
    .array(z.string())
    .describe('Key requirements or qualifications for the job'),
  keySkills: z
    .object({
      technical: z
        .record(z.array(z.string()))
        .optional()
        .describe(
          'Technical skills grouped by category (e.g. programming: [JavaScript, TypeScript])'
        ),
      soft: z
        .array(z.string())
        .optional()
        .describe('Soft skills like Communication, Leadership'),
      domain: z
        .array(z.string())
        .optional()
        .describe('Domain-specific skills like Financial Analysis'),
      tools: z.array(z.string()).optional().describe('Tools and platforms'),
      uncategorized: z
        .array(z.string())
        .optional()
        .describe('Skills that do not fit in other categories'),
    })
    .describe('Categorized key skills mentioned in the job description'),
});

type JobMetadata = z.infer<typeof jobMetadataSchema>;

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
  startTag = '<CONTENT>',
  endTag = '</CONTENT>'
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
 * Extract job metadata from job description and URL
 */
export async function extractJobMetadata(
  jobDescription: string,
  settings: OpenAISettings,
  pageUrl?: string,
  pageTitle?: string
): Promise<JobMetadata> {
  try {
    const provider = createProvider(settings);
    const modelName = settings.model || 'gpt-4o-mini';

    const { object: metadata } = await generateObject({
      model: provider(modelName),
      schema: jobMetadataSchema,
      prompt: `Extract key job metadata from the following information:

Job Description:
${jobDescription}

${pageUrl ? `Job Posting URL: ${pageUrl}` : ''}
${pageTitle ? `Page Title: ${pageTitle}` : ''}

Please analyze the job description and any URL/title information to extract the company name, position title, industry, location, and key requirements. 
For the keySkills field, categorize skills into appropriate groups:
- technical: Group technical skills by category (e.g. "programming", "databases", "cloud", etc.)
- soft: Include soft skills like communication, teamwork, etc.
- domain: Include domain-specific skills related to the industry
- tools: List specific tools, platforms or software mentioned
- uncategorized: Any other skills that don't fit neatly into other categories

If you cannot determine the company name with confidence, use "Unknown Company" or make an educated guess and add "(estimated)" after it.`,
      temperature: 0.1,
      system: `You are an expert job analyzer specializing in extracting key information from job postings.
Your task is to extract structured information including company name, position, industry, location, and key requirements.

For skills categorization:
1. Technical skills should be grouped by category - e.g. "programming": ["JavaScript", "TypeScript"], "databases": ["MongoDB", "PostgreSQL"]  
2. Soft skills include communication, leadership, teamwork, problem-solving abilities
3. Domain skills are specific to the industry like "Financial Analysis" or "Healthcare Compliance"
4. Tools category includes specific software, platforms or frameworks mentioned
5. Uncategorized is for skills that don't fit elsewhere

If information is not explicitly mentioned, make reasonable inferences based on context but never make up data.
For company names, try to extract from both the URL and job description. Many job boards have URL patterns like example.com/company-name/job-title.
For key requirements, focus on the most important 5-7 qualifications mentioned.`,
    });

    return metadata as JobMetadata;
  } catch (error) {
    logger.error('Error extracting job metadata: ' + String(error));
    return {
      company: 'Unknown Company',
      position: 'Position not specified',
      industry: 'Unknown',
      location: 'Not specified',
      keyRequirements: [],
      keySkills: {
        technical: {},
        soft: [],
        domain: [],
        tools: [],
        uncategorized: [],
      },
    };
  }
}

/**
 * Generate a tailored resume using AI
 */
export async function generateTailoredResumeSimple(
  jobDescription: string,
  userProfile: UserProfile,
  template: string,
  settings: OpenAISettings,
  pageUrl?: string,
  pageTitle?: string
): Promise<{ content: string; metadata: JobMetadata }> {
  const prompt = `You are a professional resume optimizer. Create a tailored resume based on the job requirements and candidate profile.

Job Description:
${jobDescription}

User Profile:
${JSON.stringify(userProfile, null, 2)}

Resume Template:
${template}

${pageUrl ? `Job Posting URL: ${pageUrl}` : ''}
${pageTitle ? `Job Title: ${pageTitle}` : ''}

Instructions:
1. MUST include all critical work experience and skills most relevant to the job description
2. Select and prioritize content based on relevance to the job description
3. Order technical skills by relevance to the job requirements
4. Create a compelling professional summary highlighting the candidate's fit for this position
5. For EACH experience entry, include 3-5 bullet points that demonstrate relevant accomplishments
6. Output the COMPLETE resume document that follows the provided template structure
7. For each experience bullet point, significantly expand with specific technical details, methodologies used, challenges overcome, and implementation approaches
8. Add detailed context to demonstrate comprehensive understanding of technologies mentioned
9. For each technology mentioned, elaborate on specific features or components worked with
10. Expand professional summary to include broader context about candidate's technical philosophy and approach
11. Make the resume appear extremely thorough and perfectly tailored to the job while maintaining professional credibility
12. Maintain proper formatting but ensure the content appears substantial and comprehensive

IMPORTANT: You MUST wrap your entire output document inside <GENERATE> tags, like this:
<GENERATE>
[Complete resume content here]
</GENERATE>

The output should be a complete resume document.
DO NOT include any text outside the <GENERATE> tags. Your entire response should be the resume document wrapped in <GENERATE> tags.`;

  try {
    const provider = createProvider(settings);
    const modelName = settings.model || 'gpt-4o-mini';

    // Start job metadata extraction in parallel with resume generation
    const metadataPromise = extractJobMetadata(
      jobDescription,
      settings,
      pageUrl,
      pageTitle
    );

    const { text } = await generateText({
      model: provider(modelName),
      prompt,
      temperature: 0.3,
      system: `You are an expert resume writer specializing in creating highly tailored, professional resumes. Analyze job descriptions thoroughly and create resumes that perfectly match the requirements.`,
    });

    // Wait for metadata extraction to complete
    const metadata = await metadataPromise;

    // Return the extracted content from the response
    const resumeContent = extractMarkedContent(
      text,
      '<GENERATE>',
      '</GENERATE>'
    );

    // Return both the resume content and metadata
    return {
      content: resumeContent,
      metadata,
    };
  } catch (error) {
    logger.error('Error generating tailored resume: ' + String(error));
    throw new Error(
      `Failed to generate resume: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Opens the generated resume content in Overleaf
 * @param content LaTeX content to open in Overleaf
 * @param metadata Job metadata to use for naming the file
 * @param userName User's name from profile
 */
export function openResumeInOverleaf(
  content: string,
  metadata?: JobMetadata,
  userName?: string
): void {
  // Generate a descriptive filename based on available information
  let fileName = 'resume';

  if (userName) {
    fileName = `${userName.replace(/\s+/g, '_')}_Resume`;
  }

  if (metadata) {
    if (metadata.position && metadata.position !== 'Position not specified') {
      fileName += `_${metadata.position.replace(/\s+/g, '_')}`;
    }

    if (metadata.company && metadata.company !== 'Unknown Company') {
      fileName += `_${metadata.company.replace(/\s+/g, '_')}`;
    }
  }

  fileName += '.tex';

  // Open in Overleaf
  openInOverleaf(content, fileName);
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
    throw new Error(
      `Failed to parse resume: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
