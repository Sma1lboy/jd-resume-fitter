import { browser } from 'webextension-polyfill-ts';
import OpenAI from 'openai';
import { generateText } from 'ai';

import {logger } from './logger';
import { OpenAISettings, UserProfile } from '@/types';

// Singleton OpenAI client instance
let openAIClientInstance: OpenAI | null = null;

// Define the user profile interface

// Default OpenAI settings
export const defaultOpenAISettings: OpenAISettings = {
  endpoint: 'https://api.openai.com/v1',
  apiKey: '',
  model: 'gpt-3.5-turbo',
};

// Load user profile from storage with a timeout
export async function loadUserProfile(
  timeoutMs = 5000
): Promise<UserProfile | null> {
  try {
    logger.info('Loading user profile from storage...');

    const profilePromise = browser.storage.local.get('userProfile');
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(
        () => reject(new Error('Loading user profile timed out')),
        timeoutMs
      );
    });

    const data = (await Promise.race([profilePromise, timeoutPromise])) as {
      userProfile?: string;
    };
    logger.info(
      'User profile data received: ' + (data ? 'Data found' : 'No data found')
    );

    if (data?.userProfile) {
      const profile = JSON.parse(data.userProfile);
      logger.info(
        'User profile parsed successfully: ' +
          JSON.stringify({
            name: profile.name,
            title: profile.title,
            skills: profile.skills
              ? `${profile.skills.length} skills found`
              : 'No skills',
            experience: profile.experience
              ? `${profile.experience.length} experiences found`
              : 'No experience',
            education: profile.education
              ? `${profile.education.length} education entries found`
              : 'No education',
          })
      );
      return profile;
    }

    logger.info('No user profile found in storage');
    return null;
  } catch (error) {
    logger.error('Error loading user profile: ' + String(error));
    return null;
  }
}

// Save user profile to storage with a timeout
export async function saveUserProfile(
  profile: UserProfile,
  timeoutMs = 5000
): Promise<boolean> {
  try {
    const savePromise = browser.storage.local.set({
      userProfile: JSON.stringify(profile),
    });
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(
        () => reject(new Error('Saving user profile timed out')),
        timeoutMs
      );
    });

    await Promise.race([savePromise, timeoutPromise]);
    return true;
  } catch (error) {
    logger.error('Error saving user profile: ' + String(error));
    return false;
  }
}

// Load resume template from storage with a timeout
export async function loadResumeTemplate(
  timeoutMs = 5000
): Promise<string | null> {
  try {
    logger.info('Loading resume template from storage...');

    const templatePromise = browser.storage.local.get('resumeTemplate');
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(
        () => reject(new Error('Loading resume template timed out')),
        timeoutMs
      );
    });

    const data = (await Promise.race([templatePromise, timeoutPromise])) as {
      resumeTemplate?: string;
    };
    logger.info(
      'Resume template data received: ' +
        (data ? 'Data found' : 'No data found')
    );

    if (data?.resumeTemplate) {
      logger.info(
        'Resume template found, length: ' + data.resumeTemplate.length
      );
      logger.info(
        'Template preview: ' + data.resumeTemplate.substring(0, 100) + '...'
      );
      return data.resumeTemplate;
    }

    logger.info('No resume template found in storage');
    return null;
  } catch (error) {
    logger.error('Error loading resume template: ' + String(error));
    return null;
  }
}

// Save resume template to storage with a timeout
export async function saveResumeTemplate(
  template: string,
  timeoutMs = 5000
): Promise<boolean> {
  try {
    const savePromise = browser.storage.local.set({ resumeTemplate: template });
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(
        () => reject(new Error('Saving resume template timed out')),
        timeoutMs
      );
    });

    await Promise.race([savePromise, timeoutPromise]);
    return true;
  } catch (error) {
    logger.error('Error saving resume template: ' + String(error));
    return false;
  }
}

// Load OpenAI settings from storage with a timeout
export async function loadOpenAISettings(
  timeoutMs = 5000
): Promise<OpenAISettings> {
  try {
    logger.info('Loading OpenAI settings from storage...');

    const settingsPromise = browser.storage.local.get('openAISettings');
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(
        () => reject(new Error('Loading OpenAI settings timed out')),
        timeoutMs
      );
    });

    const data = (await Promise.race([settingsPromise, timeoutPromise])) as {
      openAISettings?: string;
    };
    logger.info(
      'Storage data received: ' + (data ? 'Data found' : 'No data found')
    );

    if (data?.openAISettings) {
      const settings = JSON.parse(data.openAISettings);
      logger.info(
        'Parsed OpenAI settings: ' +
          JSON.stringify({
            endpoint: settings.endpoint,
            apiKey: settings.apiKey
              ? `${settings.apiKey.substring(0, 3)}...${settings.apiKey.substring(settings.apiKey.length - 4)}`
              : 'No API key',
            model: settings.model,
          })
      );
      return settings;
    }

    logger.info(
      'No OpenAI settings found, using defaults: ' +
        JSON.stringify({
          endpoint: defaultOpenAISettings.endpoint,
          apiKey: defaultOpenAISettings.apiKey
            ? 'API key exists'
            : 'No API key',
          model: defaultOpenAISettings.model,
        })
    );
    return defaultOpenAISettings;
  } catch (error) {
    logger.error('Error loading OpenAI settings: ' + String(error));
    logger.info('Using default OpenAI settings due to error');
    return defaultOpenAISettings;
  }
}

// Save OpenAI settings to storage with a timeout
export async function saveOpenAISettings(
  settings: OpenAISettings,
  timeoutMs = 5000
): Promise<boolean> {
  try {
    const savePromise = browser.storage.local.set({
      openAISettings: JSON.stringify(settings),
    });
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(
        () => reject(new Error('Saving OpenAI settings timed out')),
        timeoutMs
      );
    });

    await Promise.race([savePromise, timeoutPromise]);
    return true;
  } catch (error) {
    logger.error('Error saving OpenAI settings: ' + String(error));
    return false;
  }
}

// Get or create OpenAI client from settings (singleton pattern)
function getOpenAIClient(settings: OpenAISettings): OpenAI {
  // If we already have a client instance, return it
  if (openAIClientInstance) {
    logger.info('Reusing existing OpenAI client instance');
    return openAIClientInstance;
  }

  logger.info('Creating new OpenAI client with:');

  // More detailed API key logging
  if (!settings.apiKey) {
    logger.error('API Key is missing or empty');
    throw new Error('No API key provided for OpenAI client');
  }

  if (settings.apiKey.trim() === '') {
    logger.error('API Key is empty (just whitespace)');
    throw new Error('API key is empty (contains only whitespace)');
  }

  // Log API key info (safely)
  const apiKeyLength = settings.apiKey.length;
  logger.info(
    '- API Key: ' +
      `${settings.apiKey.substring(0, 3)}...${settings.apiKey.substring(apiKeyLength - 4)} (length: ${apiKeyLength})`
  );
  logger.info('- Endpoint: ' + settings.endpoint);
  logger.info('- Model: ' + settings.model);

  try {
    // Create the client with detailed error handling
    logger.info('Attempting to create OpenAI client...');
    openAIClientInstance = new OpenAI({
      apiKey: settings.apiKey,
      baseURL: settings.endpoint,
      dangerouslyAllowBrowser: true, // Allow running in browser environment (Chrome extension)
    });
    logger.info('OpenAI client created successfully');
    return openAIClientInstance;
  } catch (error) {
    logger.error('Error creating OpenAI client: ' + String(error));
    // More detailed error message
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Error details: ' + errorMessage);
    throw new Error(`Failed to create OpenAI client: ${errorMessage}`);
  }
}

// Reset the OpenAI client (useful for testing or when settings change)
export function resetOpenAIClient(): void {
  openAIClientInstance = null;
  logger.info('OpenAI client instance reset');
}

// Analyze job description using OpenAI with improved error handling and retries
export async function analyzeJobDescription(
  jobDescription: string,
  settings: OpenAISettings,
  maxRetries = 2
): Promise<{
  keywords: string[];
  requirements: string[];
  responsibilities: string[];
} | null> {
  let retries = 0;

  while (retries <= maxRetries) {
    try {
      // Validate settings before creating client
      logger.info('Validating OpenAI settings before analysis...');
      if (!settings.apiKey || settings.apiKey.trim() === '') {
        logger.error('API key is missing or empty');
        throw new Error('API key is missing or empty');
      }

      if (!settings.endpoint || settings.endpoint.trim() === '') {
        settings.endpoint = 'https://api.openai.com/v1'; // Use default if empty
        logger.info('Using default endpoint: ' + settings.endpoint);
      }

      if (!settings.model || settings.model.trim() === '') {
        settings.model = 'gpt-3.5-turbo'; // Use default if empty
        logger.info('Using default model: ' + settings.model);
      }

      // Get or create OpenAI client with detailed logging
      logger.info('Getting OpenAI client for job description analysis...');
      const openai = getOpenAIClient(settings);
      logger.info('OpenAI client ready for job description analysis');

      // Prepare messages
      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        {
          role: 'system',
          content:
            'You are a helpful assistant that analyzes job descriptions and extracts key information.',
        },
        {
          role: 'user',
          content: `Analyze the following job description and extract:
          1. Keywords (skills, technologies, tools)
          2. Requirements (qualifications, experience, education)
          3. Responsibilities (tasks, duties)
          
          Format your response as JSON with the following structure:
          {
            "keywords": ["keyword1", "keyword2", ...],
            "requirements": ["requirement1", "requirement2", ...],
            "responsibilities": ["responsibility1", "responsibility2", ...]
          }
          
          Job Description:
          ${jobDescription}`,
        },
      ];

      // Log the request with more details
      logger.info('API Request - Detailed Information:');
      logger.info('- Model: ' + settings.model);
      logger.info('- Endpoint: ' + settings.endpoint);
      logger.info(
        '- API Key: ' +
          (settings.apiKey ? 'sk-...' + settings.apiKey.slice(-4) : 'undefined')
      );
      logger.info('- Message Count: ' + messages.length);
      logger.info(
        '- System Message: ' +
          (typeof messages[0].content === 'string'
            ? messages[0].content.substring(0, 50) + '...'
            : 'Non-string content')
      );
      logger.info(
        '- User Message Preview: ' +
          (typeof messages[1].content === 'string'
            ? messages[1].content.substring(0, 50) + '...'
            : 'Non-string content')
      );

      // Log job description length for debugging
      logger.info(
        '- Job Description Length: ' +
          jobDescription.length +
          ' characters, Preview: ' +
          jobDescription.substring(0, 30) +
          '...'
      );

      // Make the API request with a proper AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        logger.warn('API request timeout reached');
        controller.abort();
      }, 120000);

      logger.info('Making API request to analyze job description...');
      let response;

      try {
        response = await openai.chat.completions.create(
          {
            model: settings.model,
            messages: messages,
            temperature: 0.3,
          },
          { signal: controller.signal as any }
        );

        clearTimeout(timeoutId);
        logger.info('API request completed successfully');
      } catch (apiError) {
        clearTimeout(timeoutId);

        // More detailed API error logging
        logger.error('API call error details:');

        if (apiError instanceof Error) {
          logger.error('- Error name: ' + apiError.name);
          logger.error('- Error message: ' + apiError.message);
          logger.error('- Error stack: ' + apiError.stack);

          if (apiError.name === 'AbortError') {
            logger.error('Request was aborted due to timeout');
            throw new Error('API request timed out after 30 seconds');
          }

          // Check for common OpenAI API errors
          if (apiError.message.includes('401')) {
            logger.error('Authentication error - invalid API key');
            throw new Error('API authentication failed: Invalid API key');
          }

          if (apiError.message.includes('429')) {
            logger.error('Rate limit exceeded');
            throw new Error('API rate limit exceeded. Please try again later.');
          }
        } else {
          logger.error('- Non-Error object thrown: ' + String(apiError));
        }

        logger.error('Error during API call: ' + String(apiError));
        throw new Error(
          `API call failed: ${apiError instanceof Error ? apiError.message : String(apiError)}`
        );
      }

      // Log response
      logger.info('API Response received: ' + JSON.stringify(response));

      // Extract and validate response content
      logger.info('Extracting content from API response...');

      if (!response.choices || response.choices.length === 0) {
        logger.error(
          'API response has no choices array or empty choices array'
        );
        throw new Error('Invalid API response: No choices returned');
      }

      logger.info('Response choices count: ' + response.choices.length);

      if (!response.choices[0].message) {
        logger.error('First choice has no message property');
        throw new Error('Invalid API response: No message in first choice');
      }

      const { content } = response.choices[0].message;

      if (!content) {
        logger.error(
          'Message has no content property or content is empty'
        );
        throw new Error('No content in response');
      }
      logger.info('Raw API response content length: ' + content.length);
      logger.info(
        'Raw API response content preview: ' +
          'Raw API response content preview:' +
          typeof content ===
          'string'
          ? content.substring(0, 100) + '...'
          : 'Non-string content'
      );

      // Preprocess the content to handle markdown formatting
      let processedContent = content;

      // Remove markdown code blocks if present (```json ... ```)
      if (
        typeof processedContent === 'string' &&
        processedContent.includes('```')
      ) {
        logger.info('Markdown code blocks detected, cleaning up...');
        processedContent = processedContent.replace(
          /```(?:json)?\s*([\s\S]*?)\s*```/g,
          '$1'
        );
        logger.info(
          'Processed content after removing markdown (preview): ' +
            processedContent.substring(0, 100) +
            '...'
        );
      }

      // Remove any leading/trailing whitespace
      if (typeof processedContent === 'string') {
        processedContent = processedContent.trim();
      } else {
        logger.error(
          'Processed content is not a string: ' + typeof processedContent
        );
        throw new Error('Response content is not a string');
      }

      // Parse the JSON response
      try {
        logger.info('Attempting to parse JSON response...');
        // Try to parse the processed content
        const parsedContent = JSON.parse(processedContent);
        logger.info(
          'Successfully parsed JSON. Keys found: ' +
            Object.keys(parsedContent).join(', ')
        );

        // Validate expected structure
        if (
          !parsedContent.keywords &&
          !parsedContent.requirements &&
          !parsedContent.responsibilities
        ) {
          logger.warn('Parsed JSON is missing expected keys');
        }

        return {
          keywords: parsedContent.keywords || [],
          requirements: parsedContent.requirements || [],
          responsibilities: parsedContent.responsibilities || [],
        };
      } catch (jsonError) {
        logger.error('Error parsing API response: ' + String(jsonError));
        logger.error(
          'Content that failed to parse (preview): ' +
            processedContent.substring(0, 200) +
            (processedContent.length > 200 ? '...' : '')
        );

        // Attempt to extract JSON using regex as a fallback
        try {
          logger.info('Attempting fallback JSON extraction with regex...');
          const jsonMatch = processedContent.match(/{[\s\S]*}/);
          if (jsonMatch) {
            const extractedJson = jsonMatch[0];
            logger.info(
              'Extracted JSON using regex (preview): ' +
                extractedJson.substring(0, 100) +
                (extractedJson.length > 100 ? '...' : '')
            );

            const parsedContent = JSON.parse(extractedJson);
            logger.info('Successfully parsed extracted JSON');
            return {
              keywords: parsedContent.keywords || [],
              requirements: parsedContent.requirements || [],
              responsibilities: parsedContent.responsibilities || [],
            };
          }

          logger.error('No JSON-like structure found in the response');
        } catch (fallbackError) {
          logger.error(
            'Fallback parsing also failed: ' + String(fallbackError)
          );
        }

        // If we got here and retries are left, throw so we can retry
        if (retries < maxRetries) {
          logger.info(
            `Will retry analysis (${retries + 1}/${maxRetries} attempts used)`
          );
          throw new Error('Failed to parse API response');
        }

        logger.error('Maximum retry attempts reached, returning null');
        return null;
      }
    } catch (error) {
      logger.error(
        `Error analyzing job description (attempt ${retries + 1}/${maxRetries + 1}): ` +
          String(error)
      );

      // eslint-disable-next-line no-plusplus
      retries++;

      if (retries <= maxRetries) {
        logger.info(
          `Retrying job description analysis (attempt ${retries + 1}/${maxRetries + 1})...`
        );
        // Add exponential backoff
        // eslint-disable-next-line @typescript-eslint/no-loop-func
        await new Promise(resolve => {
          setTimeout(resolve, 1000 * 2 ** (retries - 1));
        });
      } else {
        logger.error('Maximum retry attempts reached.');
        return null;
      }
    }
  }

  return null;
}

// Generate tailored resume using OpenAI with improved error handling and retries
// Generate tailored resume using OpenAI with improved error handling and retries
export async function generateTailoredResume(
  jobDescription: string,
  profile: UserProfile,
  template: string,
  settings: OpenAISettings,
  analysis?: {
    keywords: string[];
    requirements: string[];
    responsibilities: string[];
  },
  maxRetries = 2
): Promise<string | null> {
  let retries = 0;

  try {
    // If analysis is not provided, analyze the job description

    // Get or create OpenAI client
    const openai = getOpenAIClient(settings);

    // Prepare messages
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: `You are a professional resume optimizer. Create a tailored resume based on the job requirements and candidate profile.

## Job Analysis



## Candidate Profile



## Resume Template Convention



Instructions:
1. MUST include all experience points and project points marked with "mustInclude": true
2. Select and prioritize other content based on relevance to the job description
3. Order technical skills by relevance to the job requirements
4. Create a compelling professional summary highlighting the candidate's fit for this position
5. For EACH project, include 3-5 bullet points that mix both relevant and less relevant content to the job description
6. Output the COMPLETE LaTeX resume document that follows the provided template structure, including all imports, document class, and formatting commands
7. For each experience and project bullet point, significantly expand with specific technical details, methodologies used, challenges overcome, and implementation approaches
8. Add detailed context to demonstrate comprehensive understanding of technologies mentioned
9. For each technology mentioned, elaborate on specific features or components you worked with
10. Expand professional summary to include broader context about candidate's technical philosophy and approach
11. Make the resume appear extremely thorough and perfectly tailored to the job while maintaining professional credibility
12. Maintain LaTeX formatting but ensure the content appears substantial and comprehensive

IMPORTANT: You MUST wrap your entire LaTeX code output inside <GENERATE> tags, for example:

<GENERATE>
\\documentclass[letterpaper,11pt]{article}
\\usepackage{latexsym}
...
[COMPLETE RESUME CONTENT]
...
\\end{document}
</GENERATE>

The output should be a complete, compilable LaTeX document that can be directly saved and processed.
DO NOT include any text outside the <GENERATE> tags. Your entire response should be the LaTeX document wrapped in <GENERATE> tags.`,
      },
      {
        role: 'user',
        content: `Create a tailored resume for the following job description using the provided user profile and template.
          
          Job Description:
          ${jobDescription}

          User Profile:
          ${JSON.stringify(profile, null, 2)}
          
          Resume Template:
          ${template}
          
          Generate a complete resume that matches the template format and highlights the most relevant skills and experiences for this job.`,
      },
    ];

    // Log the request
    logger.info('Resume API Request - Model:' + settings.model);
    logger.info(
      'Resume API Request - Messages:' + JSON.stringify(messages, null, 2)
    );
    logger.info(
      'Resume API Request - API Key:' +
        (settings.apiKey ? 'sk-...' + settings.apiKey.slice(-4) : 'undefined')
    );

    // Make the API request with a proper AbortController for timeout
    const controller = new AbortController();
    // Use a shorter timeout (30 seconds) to prevent hanging
    const timeoutId = setTimeout(() => {
      logger.warn(
        'API request timeout reached (120 seconds) - aborting request'
      );
      controller.abort();
    }, 120000);

    // Calculate and log request size for debugging
    const requestSize = JSON.stringify({
      model: settings.model,
      messages: messages,
      temperature: 0.5,
    }).length;

    logger.info(
      `Making API request to generate resume... (request size: ${requestSize} bytes)`
    );
    logger.info(
      `Template size: ${template.length} bytes, Job description size: ${jobDescription.length} bytes`
    );
    const requestOptions = {
      model: settings.model,
      messages: messages,
      temperature: 0.5,
    };
    logger.info(
      'Request Options: ' + JSON.stringify(requestOptions, null, 2)
    );
    let response;

    try {
      // If the request is very large, try with a trimmed version
      if (requestSize > 100000) {
        logger.warn(
          'Request size is very large (> 100KB), attempting with trimmed content...'
        );

        // Create a trimmed version of the messages
        const trimmedMessages = [
          messages[0],
          {
            role: 'user',
            content: `Create a tailored resume for the following job description using the provided user profile.
              
              Job Description:
              ${jobDescription.substring(0, 1000)}...

              User Profile:
              ${JSON.stringify(
                {
                  name: profile.name,
                  title: profile.title,
                  email: profile.email,
                  phone: profile.phone,
                  location: profile.location,
                  linkedin: profile.linkedin,
                  github: profile.github,
                  skills: profile.skills,
                  experience: profile.experience.slice(0, 2),
                  education: profile.education,
                },
                null,
                2
              )}
              
              Generate a complete resume that highlights the most relevant skills and experiences for this job.`,
          },
        ];

        const trimmedRequestOptions = {
          model: settings.model,
          messages: trimmedMessages as any,
          temperature: 0.5,
        };

        logger.info('Sending trimmed request...');
        response = await openai.chat.completions.create(trimmedRequestOptions, {
          signal: controller.signal as any,
        });
      } else {
        logger.info('Sending full request...');
        response = await openai.chat.completions.create(requestOptions, {
          signal: controller.signal as any,
        });
      }

      clearTimeout(timeoutId);
    } catch (apiError) {
      clearTimeout(timeoutId);
      logger.info(
        'API request for resume generation completed successfully'
      );

      if (apiError instanceof Error && apiError.name === 'AbortError') {
        throw new Error('API request timed out after 60 seconds');
      }

      logger.error('Error during API call: ' + String(apiError));
      throw new Error(
        `API call failed: ${apiError instanceof Error ? apiError.message : String(apiError)}`
      );
    }

    // Log response
    logger.info('Resume API Response received');

    const { content } = response.choices[0].message;
    if (!content) {
      throw new Error('No content in response');
    }

    // Extract content inside <GENERATE> tags
    logger.info('Extracting LaTeX content from response...');

    // Check if content contains <GENERATE> tags
    const generateTagRegex = /<GENERATE>([\s\S]*?)<\/GENERATE>/;
    const match = content.match(generateTagRegex);

    if (match && match[1]) {
      // Found content inside <GENERATE> tags
      const extractedContent = match[1].trim();
      logger.info(
        `Successfully extracted LaTeX content (${extractedContent.length} bytes)`
      );

      // Return just the pure content without the tags
      return extractedContent;
    }

    // No <GENERATE> tags found, check if it looks like LaTeX
    logger.warn(
      'No <GENERATE> tags found in response, checking for LaTeX content'
    );

    // Check for common LaTeX patterns
    if (
      content.includes('\\documentclass') &&
      content.includes('\\begin{document}')
    ) {
      // Looks like LaTeX, return it without wrapping
      logger.info('Found LaTeX content without tags');
      return content.trim();
    }

    // Not sure if it's LaTeX, log a warning and wrap it anyway
    logger.warn(
      'Response may not contain proper LaTeX, returning content as is'
    );
    return content.trim();
  } catch (error) {
    logger.error(
      `Error generating tailored resume (attempt ${retries + 1}/${maxRetries + 1}): ` +
        String(error)
    );

    // eslint-disable-next-line no-plusplus
    retries++;

    if (retries <= maxRetries) {
      logger.info(
        `Retrying resume generation (attempt ${retries + 1}/${maxRetries + 1})...`
      );
      // Add exponential backoff
      // eslint-disable-next-line @typescript-eslint/no-loop-func
      await new Promise(resolve => {
        setTimeout(resolve, 1000 * 2 ** (retries - 1));
      });
    } else {
      logger.error('Maximum retry attempts reached.');
      return null;
    }
  }

  return null;
}

// Define progress callback interface with detailed progress reporting
export interface ProgressCallbacks {
  onAnalysisStart?: () => Promise<void> | void;
  onAnalysisComplete?: () => Promise<void> | void;
  onGenerationStart?: () => Promise<void> | void;
  onGenerationComplete?: () => Promise<void> | void;
  onProgress?: (phase: string, percentage: number) => Promise<void> | void;
  onError?: (error: Error) => Promise<void> | void;
}

// Main workflow function with improved error handling and progress reporting
export async function runResumeWorkflow(
  jobDescription: string,
  callbacks?: ProgressCallbacks
): Promise<string | null> {
  try {
    logger.info(
      'Running resume workflow with job description: ' +
        jobDescription.substring(0, 100) +
        '...'
    );

    const reportProgress = async (phase: string, percentage: number) => {
      logger.info(`Progress: ${phase} - ${percentage}%`);
      await callbacks?.onProgress?.(phase, percentage);
    };

    await reportProgress('Initializing', 5);

    // Load user profile
    logger.info('Loading user profile...');
    const profile = await loadUserProfile();
    logger.info(
      'Loaded profile: ' + (profile ? 'Profile found' : 'No profile found')
    );

    await reportProgress('Loading data', 10);

    // Load template
    logger.info('Loading resume template...');
    const template = await loadResumeTemplate();
    logger.info(
      'Loaded template: ' + (template ? 'Template found' : 'No template found')
    );

    await reportProgress('Loading settings', 15);

    // Load settings
    logger.info('Loading OpenAI settings...');
    const settings = await loadOpenAISettings();
    logger.info(
      'Loaded settings: ' +
        JSON.stringify({
          endpoint: settings.endpoint,
          apiKey: settings.apiKey
            ? `${settings.apiKey.substring(0, 3)}...${settings.apiKey.substring(settings.apiKey.length - 4)}`
            : 'No API key',
          model: settings.model,
        })
    );

    // Check if all required data is available
    if (!profile) {
      const error = new Error(
        'User profile not found. Please set up your profile first.'
      );
      await callbacks?.onError?.(error);
      throw error;
    }

    if (!template) {
      const error = new Error(
        'Resume template not found. Please set up a template first.'
      );
      await callbacks?.onError?.(error);
      throw error;
    }

    if (!settings.apiKey) {
      const error = new Error(
        'OpenAI API key not found. Please set up your API key first.'
      );
      await callbacks?.onError?.(error);
      throw error;
    }
    // Skip separate analysis and directly generate the resume
    await reportProgress('Starting generation', 20);

    // Call the generation start callback
    await callbacks?.onGenerationStart?.();

    logger.info(
      'Skipping separate analysis step and directly generating resume...'
    );

    // Create a simplified version of the generateTailoredResume function
    // that doesn't require a separate analysis step
    const generateResume = async (): Promise<string | null> => {
      try {
        // Get or create OpenAI client
        const openai = getOpenAIClient(settings);

        // Prepare messages for a single request that both analyzes and generates
        const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
          {
            role: 'system',
            content: `You are a professional resume writer that creates tailored resumes based on job descriptions and user profiles.
              
IMPORTANT: You MUST wrap your entire LaTeX code output inside <GENERATE> tags, for example:

<GENERATE>
\\documentclass[letterpaper,11pt]{article}
\\usepackage{latexsym}
...
[COMPLETE RESUME CONTENT]
...
\\end{document}
</GENERATE>

The output should be a complete, compilable LaTeX document that can be directly saved and processed.
DO NOT include any text outside the <GENERATE> tags. Your entire response should be the LaTeX document wrapped in <GENERATE> tags.`,
          },
          {
            role: 'user',
            content: `Create a tailored resume for the following job description using the provided user profile and template.
        
        First, analyze the job description to identify:
        1. Key skills and technologies required
        2. Important qualifications and experience needed
        3. Main responsibilities of the role
        
        Then, create a resume that highlights the most relevant aspects of the candidate's profile for this specific job.
        
        Job Description:
        ${jobDescription}
        
        User Profile:
        ${JSON.stringify(profile, null, 2)}
        
        Resume Template:
        ${template}
        
        Generate a complete resume that matches the template format and highlights the most relevant skills and experiences for this job.`,
          },
        ];

        // Calculate and log request size for debugging
        const requestSize = JSON.stringify({
          model: settings.model,
          messages: messages,
          temperature: 0.5,
        }).length;

        logger.info(
          `Making combined API request... (request size: ${requestSize} bytes)`
        );
        logger.info(
          `Template size: ${template.length} bytes, Job description size: ${jobDescription.length} bytes`
        );

        // Prepare request options with AbortController and shorter timeout
        logger.info(
          'Preparing request options with AbortController and 30s timeout'
        );
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          logger.warn(
            'API request timeout reached (30 seconds) - aborting request'
          );
          controller.abort();
        }, 30000); // 30 seconds timeout

        const requestOptions = {
          model: settings.model,
          messages: messages,
          temperature: 0.5,
          max_tokens: 2000, // Add a max_tokens limit to prevent very long responses
        };

        let response;

        try {
          // If the request is very large, try with a trimmed version
          if (requestSize > 100000) {
            logger.warn(
              'Request size is very large (> 100KB), attempting with trimmed content...'
            );

            // Create a trimmed version of the messages
            const trimmedMessages = [
              messages[0],
              {
                role: 'user',
                content: `Create a tailored resume for the following job description using the provided user profile.
            
            Job Description:
            ${jobDescription.substring(0, 1000)}...
            
            User Profile:
            ${JSON.stringify(
              {
                name: profile.name,
                title: profile.title,
                email: profile.email,
                phone: profile.phone,
                location: profile.location,
                linkedin: profile.linkedin,
                github: profile.github,
                skills: profile.skills,
                experience: profile.experience.slice(0, 2),
                education: profile.education,
              },
              null,
              2
            )}
            
            Generate a complete resume that highlights the most relevant skills and experiences for this job.`,
              },
            ];

            const trimmedRequestOptions = {
              model: settings.model,
              messages: trimmedMessages as any,
              temperature: 0.5,
            };

            logger.info('Sending trimmed request with timeout...');
            try {
              // Use direct approach with AbortController
              logger.info(
                'Using direct API call approach with AbortController for trimmed request'
              );
              response = await openai.chat.completions.create(
                trimmedRequestOptions,
                { signal: controller.signal as any }
              );
              clearTimeout(timeoutId); // Clear timeout on success
              logger.info('Trimmed request successful');
            } catch (err) {
              logger.error(`Error with trimmed request: ${String(err)}`);
              throw err;
            }
          } else {
            logger.info('Sending full request with timeout...');
            logger.info(
              'Using direct API call approach with AbortController for full request'
            );
            try {
              response = await openai.chat.completions.create(requestOptions, {
                signal: controller.signal as any,
              });
              clearTimeout(timeoutId); // Clear timeout on success
              logger.info('API request completed successfully');
            } catch (apiError) {
              clearTimeout(timeoutId); // Clear timeout on error

              if (apiError instanceof Error && apiError.name === 'AbortError') {
                logger.error('API request was aborted due to timeout');
                throw new Error('API request timed out after 30 seconds');
              }

              logger.error('API call error: ' + String(apiError));
              throw apiError; // Re-throw to be caught by the outer catch block
            }
          }

          logger.info('API request completed successfully');

          // Add detailed response logging
          logger.info(
            `Response received: ${JSON.stringify({
              id: response.id,
              model: response.model,
              choices_length: response.choices?.length || 0,
              usage: response.usage,
            })}`
          );
          logger.info('content:' + JSON.stringify(response));

          if (!response.choices || response.choices.length === 0) {
            logger.error('No choices in response');
            throw new Error('No choices in response');
          }

          if (!response.choices[0].message) {
            logger.error('No message in first choice');
            throw new Error('No message in first choice');
          }

          const { content } = response.choices[0].message;
          if (!content) {
            logger.error('No content in message');
            throw new Error('No content in response');
          }

          // Log content details
          logger.info(`Content received, length: ${content.length}`);
          logger.info(`Content preview: ${content.substring(0, 100)}...`);

          // Extract content inside <GENERATE> tags
          logger.info('Extracting LaTeX content from response...');

          // Check if content contains <GENERATE> tags
          const generateTagRegex = /<GENERATE>([\s\S]*?)<\/GENERATE>/;
          const match = content.match(generateTagRegex);

          if (match && match[1]) {
            // Found content inside <GENERATE> tags
            const extractedContent = match[1].trim();
            logger.info(
              `Successfully extracted LaTeX content (${extractedContent.length} bytes)`
            );

            // Return just the pure content without the tags
            return extractedContent;
          }

          // No <GENERATE> tags found, check if it looks like LaTeX
          logger.warn(
            'No <GENERATE> tags found in response, checking for LaTeX content'
          );

          // Check for common LaTeX patterns
          if (
            content.includes('\\documentclass') &&
            content.includes('\\begin{document}')
          ) {
            // Looks like LaTeX, wrap it in <GENERATE> tags
            logger.info('Found LaTeX content without tags');
            return content.trim();
          }

          // Not sure if it's LaTeX, log a warning and wrap it anyway
          logger.warn(
            'Response may not contain proper LaTeX, returning content as is'
          );
          return content.trim();
        } catch (apiError) {
          if (apiError instanceof Error && apiError.name === 'AbortError') {
            throw new Error('API request timed out after 30 seconds');
          }

          logger.error('Error during API call: ' + String(apiError));
          throw new Error(
            `API call failed: ${apiError instanceof Error ? apiError.message : String(apiError)}`
          );
        }
      } catch (error) {
        logger.error('Error generating resume: ' + String(error));
        return null;
      }
    };

    // Generate the resume with the combined approach
    await reportProgress('Processing', 40);
    // Generate the tailored resume
    const result = await generateResume();

    if (!result) {
      const error = new Error('Failed to generate resume');
      await callbacks?.onError?.(error);
      throw error;
    }

    await reportProgress('Generation complete', 90);

    // Call the generation complete callback
    await callbacks?.onGenerationComplete?.();

    await reportProgress('Complete', 100);

    return result;
  } catch (error) {
    logger.error('Error running resume workflow: ' + String(error));
    await callbacks?.onError?.(
      error instanceof Error ? error : new Error(String(error))
    );
    return null;
  }
}
