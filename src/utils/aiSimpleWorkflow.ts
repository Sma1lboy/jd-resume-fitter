import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { generateText, generateObject } from 'ai';
import { browser } from 'webextension-polyfill-ts';
import {
  OpenAISettings,
  UserProfile,
  userProfileSchema,
  jobMetadataSchema,
  JobMetadata,
} from '@/types';
import { logger } from './logger';
import { openInOverleaf } from './overleafIntegration';

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
- technical: Group technical skills by category (e.g. programming: [JavaScript, TypeScript])
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
1. MUST include all critical work experience, projects, and skills most relevant to the job description. Consider the optional 'weight' field provided on experience/project items AND on individual description points to prioritize content (higher weight means more preferred by the user).
2. Select and prioritize content based on relevance to the job description, including relevant projects. Use the 'weight' field on items and description points as a guide for user preference.
3. Order technical skills by relevance to the job requirements
4. Create a compelling professional summary highlighting the candidate's fit for this position
5. For EACH experience entry and relevant project entry, include 3-5 bullet points that demonstrate relevant accomplishments. Pay close attention to the weight of individual description points.
6. Output the COMPLETE resume document that follows the provided template structure
7. For each experience bullet point, significantly expand with specific technical details, methodologies used, challenges overcome, and implementation approaches
8. Add detailed context to demonstrate comprehensive understanding of technologies mentioned
9. For each technology mentioned, elaborate on specific features or components worked with
10. Expand professional summary to include broader context about candidate's technical philosophy and approach
11. Make the resume appear extremely thorough and perfectly tailored to the job while maintaining professional credibility
12. Maintain proper formatting but ensure the content appears substantial and comprehensive
13. Keep the resume concise and aim to fit it within a single page. Prioritize the most impactful information relevant to the job.

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

    // The schema now perfectly matches UserProfile, so generateObject should return a compatible type.
    const { object: parsedProfile } = await generateObject({
      model: provider(modelName),
      schema: userProfileSchema, // Use the aligned schema
      prompt: `Parse the following resume text into a structured profile:\n\n${resumeText}`,
      temperature: 0.1,
      // Update system prompt to reflect all fields including nested weights
      system: `
You are an expert resume parser. Extract structured information from the resume text including:
1. Basic information (name, title, contact details, links)
2. Professional Summary
3. Skills
4. Work Experience (including company, title, date, description points with optional weight, and overall item weight if indicated)
5. Education (including institution, degree, date, and relevant courses if listed)
6. Projects (including name, description points with optional weight, technologies, date range, and overall item weight if indicated)
7. Courses (List of relevant courses taken, separate from education entries)
8. Certifications (name, issuer, date)
9. Languages (language, proficiency)

For description points in experience and projects, extract the text and infer a weight if priority is indicated (e.g., 'Key achievement:', 'Most significant contribution:'). Try to infer an overall weight for experience/project items too if emphasis is placed.
If a field is not found, omit it or use an empty array/string as appropriate per the schema.
`,
    });

    // Now the generated object should conform to UserProfile,
    // but we add defaults for required fields just in case the AI misses them despite the schema.
    const finalProfile: UserProfile = {
      name: parsedProfile.name ?? '',
      title: parsedProfile.title ?? '',
      email: parsedProfile.email ?? '',
      phone: parsedProfile.phone ?? '',
      location: parsedProfile.location ?? '',
      summary: parsedProfile.summary ?? '',
      skills: parsedProfile.skills ?? [],
      courses: parsedProfile.courses ?? [], // Ensure courses array exists
      experience: (parsedProfile.experience ?? []).map(exp => ({
        company: exp.company ?? '',
        title: exp.title ?? '',
        date: exp.date ?? '',
        description: (exp.description ?? []).map(d => ({
          text: d.text ?? '',
          weight: d.weight,
        })),
        weight: exp.weight,
      })),
      education: (parsedProfile.education ?? []).map(edu => ({
        institution: edu.institution ?? '',
        degree: edu.degree ?? '',
        date: edu.date ?? '',
        relevantCourses: edu.relevantCourses,
      })),
      // Optional fields are assigned directly
      linkedin: parsedProfile.linkedin,
      github: parsedProfile.github,
      website: parsedProfile.website,
      projects: (parsedProfile.projects ?? []).map(proj => ({
        name: proj.name ?? '',
        description: (proj.description ?? []).map(d => ({
          text: d.text ?? '',
          weight: d.weight,
        })),
        technologies: proj.technologies,
        dateRange: proj.dateRange,
        weight: proj.weight,
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
  } catch (error) {
    logger.error('Error parsing resume with AI: ' + String(error));
    throw new Error(
      `Failed to parse resume: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
