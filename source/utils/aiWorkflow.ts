import { browser } from 'webextension-polyfill-ts';
import OpenAI from 'openai';
import { debugLogger } from './debugLogger';

// Singleton OpenAI client instance
let openAIClientInstance: OpenAI | null = null;

// Define the user profile interface
export interface UserProfile {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  github?: string;
  website?: string;
  summary: string;
  skills: string[];
  experience: {
    company: string;
    title: string;
    date: string;
    description: string[];
  }[];
  education: {
    institution: string;
    degree: string;
    date: string;
  }[];
  certifications?: {
    name: string;
    issuer: string;
    date: string;
  }[];
  languages?: {
    language: string;
    proficiency: string;
  }[];
}

// Define the OpenAI settings interface
export interface OpenAISettings {
  endpoint: string;
  apiKey: string;
  model: string;
}

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
    debugLogger.info('Loading user profile from storage...');

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
    debugLogger.info(
      'User profile data received: ' + (data ? 'Data found' : 'No data found')
    );

    if (data?.userProfile) {
      const profile = JSON.parse(data.userProfile);
      debugLogger.info(
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

    debugLogger.info('No user profile found in storage');
    return null;
  } catch (error) {
    debugLogger.error('Error loading user profile: ' + String(error));
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
    debugLogger.error('Error saving user profile: ' + String(error));
    return false;
  }
}

// Load resume template from storage with a timeout
export async function loadResumeTemplate(
  timeoutMs = 5000
): Promise<string | null> {
  try {
    debugLogger.info('Loading resume template from storage...');

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
    debugLogger.info(
      'Resume template data received: ' +
        (data ? 'Data found' : 'No data found')
    );

    if (data?.resumeTemplate) {
      debugLogger.info(
        'Resume template found, length: ' + data.resumeTemplate.length
      );
      debugLogger.info(
        'Template preview: ' + data.resumeTemplate.substring(0, 100) + '...'
      );
      return data.resumeTemplate;
    }

    debugLogger.info('No resume template found in storage');
    return null;
  } catch (error) {
    debugLogger.error('Error loading resume template: ' + String(error));
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
    debugLogger.error('Error saving resume template: ' + String(error));
    return false;
  }
}

// Load OpenAI settings from storage with a timeout
export async function loadOpenAISettings(
  timeoutMs = 5000
): Promise<OpenAISettings> {
  try {
    debugLogger.info('Loading OpenAI settings from storage...');

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
    debugLogger.info(
      'Storage data received: ' + (data ? 'Data found' : 'No data found')
    );

    if (data?.openAISettings) {
      const settings = JSON.parse(data.openAISettings);
      debugLogger.info(
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

    debugLogger.info(
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
    debugLogger.error('Error loading OpenAI settings: ' + String(error));
    debugLogger.info('Using default OpenAI settings due to error');
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
    debugLogger.error('Error saving OpenAI settings: ' + String(error));
    return false;
  }
}

// Get or create OpenAI client from settings (singleton pattern)
function getOpenAIClient(settings: OpenAISettings): OpenAI {
  // If we already have a client instance, return it
  if (openAIClientInstance) {
    debugLogger.info('Reusing existing OpenAI client instance');
    return openAIClientInstance;
  }

  debugLogger.info('Creating new OpenAI client with:');

  // More detailed API key logging
  if (!settings.apiKey) {
    debugLogger.error('API Key is missing or empty');
    throw new Error('No API key provided for OpenAI client');
  }

  if (settings.apiKey.trim() === '') {
    debugLogger.error('API Key is empty (just whitespace)');
    throw new Error('API key is empty (contains only whitespace)');
  }

  // Log API key info (safely)
  const apiKeyLength = settings.apiKey.length;
  debugLogger.info(
    '- API Key: ' +
      `${settings.apiKey.substring(0, 3)}...${settings.apiKey.substring(apiKeyLength - 4)} (length: ${apiKeyLength})`
  );
  debugLogger.info('- Endpoint: ' + settings.endpoint);
  debugLogger.info('- Model: ' + settings.model);

  try {
    // Create the client with detailed error handling
    debugLogger.info('Attempting to create OpenAI client...');
    openAIClientInstance = new OpenAI({
      apiKey: settings.apiKey,
      baseURL: settings.endpoint,
      dangerouslyAllowBrowser: true, // Allow running in browser environment (Chrome extension)
    });
    debugLogger.info('OpenAI client created successfully');
    return openAIClientInstance;
  } catch (error) {
    debugLogger.error('Error creating OpenAI client: ' + String(error));
    // More detailed error message
    const errorMessage = error instanceof Error ? error.message : String(error);
    debugLogger.error('Error details: ' + errorMessage);
    throw new Error(`Failed to create OpenAI client: ${errorMessage}`);
  }
}

// Reset the OpenAI client (useful for testing or when settings change)
export function resetOpenAIClient(): void {
  openAIClientInstance = null;
  debugLogger.info('OpenAI client instance reset');
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
      debugLogger.info('Validating OpenAI settings before analysis...');
      if (!settings.apiKey || settings.apiKey.trim() === '') {
        debugLogger.error('API key is missing or empty');
        throw new Error('API key is missing or empty');
      }

      if (!settings.endpoint || settings.endpoint.trim() === '') {
        settings.endpoint = 'https://api.openai.com/v1'; // Use default if empty
        debugLogger.info('Using default endpoint: ' + settings.endpoint);
      }

      if (!settings.model || settings.model.trim() === '') {
        settings.model = 'gpt-3.5-turbo'; // Use default if empty
        debugLogger.info('Using default model: ' + settings.model);
      }

      // Get or create OpenAI client with detailed logging
      debugLogger.info('Getting OpenAI client for job description analysis...');
      const openai = getOpenAIClient(settings);
      debugLogger.info('OpenAI client ready for job description analysis');

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
      debugLogger.info('API Request - Detailed Information:');
      debugLogger.info('- Model: ' + settings.model);
      debugLogger.info('- Endpoint: ' + settings.endpoint);
      debugLogger.info(
        '- API Key: ' +
          (settings.apiKey ? 'sk-...' + settings.apiKey.slice(-4) : 'undefined')
      );
      debugLogger.info('- Message Count: ' + messages.length);
      debugLogger.info(
        '- System Message: ' +
          (typeof messages[0].content === 'string'
            ? messages[0].content.substring(0, 50) + '...'
            : 'Non-string content')
      );
      debugLogger.info(
        '- User Message Preview: ' +
          (typeof messages[1].content === 'string'
            ? messages[1].content.substring(0, 50) + '...'
            : 'Non-string content')
      );

      // Log job description length for debugging
      debugLogger.info(
        '- Job Description Length: ' +
          jobDescription.length +
          ' characters, Preview: ' +
          jobDescription.substring(0, 30) +
          '...'
      );

      // Make the API request with a proper AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        debugLogger.warn('API request timeout reached (30 seconds)');
        controller.abort();
      }, 30000);

      debugLogger.info('Making API request to analyze job description...');
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
        debugLogger.info('API request completed successfully');
      } catch (apiError) {
        clearTimeout(timeoutId);

        // More detailed API error logging
        debugLogger.error('API call error details:');

        if (apiError instanceof Error) {
          debugLogger.error('- Error name: ' + apiError.name);
          debugLogger.error('- Error message: ' + apiError.message);
          debugLogger.error('- Error stack: ' + apiError.stack);

          if (apiError.name === 'AbortError') {
            debugLogger.error('Request was aborted due to timeout');
            throw new Error('API request timed out after 30 seconds');
          }

          // Check for common OpenAI API errors
          if (apiError.message.includes('401')) {
            debugLogger.error('Authentication error - invalid API key');
            throw new Error('API authentication failed: Invalid API key');
          }

          if (apiError.message.includes('429')) {
            debugLogger.error('Rate limit exceeded');
            throw new Error('API rate limit exceeded. Please try again later.');
          }
        } else {
          debugLogger.error('- Non-Error object thrown: ' + String(apiError));
        }

        debugLogger.error('Error during API call: ' + String(apiError));
        throw new Error(
          `API call failed: ${apiError instanceof Error ? apiError.message : String(apiError)}`
        );
      }

      // Log response
      debugLogger.info('API Response received');

      // Extract and validate response content
      debugLogger.info('Extracting content from API response...');

      if (!response.choices || response.choices.length === 0) {
        debugLogger.error(
          'API response has no choices array or empty choices array'
        );
        throw new Error('Invalid API response: No choices returned');
      }

      debugLogger.info('Response choices count: ' + response.choices.length);

      if (!response.choices[0].message) {
        debugLogger.error('First choice has no message property');
        throw new Error('Invalid API response: No message in first choice');
      }

      const { content } = response.choices[0].message;

      if (!content) {
        debugLogger.error(
          'Message has no content property or content is empty'
        );
        throw new Error('No content in response');
      }
      debugLogger.info('Raw API response content length: ' + content.length);
      debugLogger.info(
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
        debugLogger.info('Markdown code blocks detected, cleaning up...');
        processedContent = processedContent.replace(
          /```(?:json)?\s*([\s\S]*?)\s*```/g,
          '$1'
        );
        debugLogger.info(
          'Processed content after removing markdown (preview): ' +
            processedContent.substring(0, 100) +
            '...'
        );
      }

      // Remove any leading/trailing whitespace
      if (typeof processedContent === 'string') {
        processedContent = processedContent.trim();
      } else {
        debugLogger.error(
          'Processed content is not a string: ' + typeof processedContent
        );
        throw new Error('Response content is not a string');
      }

      // Parse the JSON response
      try {
        debugLogger.info('Attempting to parse JSON response...');
        // Try to parse the processed content
        const parsedContent = JSON.parse(processedContent);
        debugLogger.info(
          'Successfully parsed JSON. Keys found: ' +
            Object.keys(parsedContent).join(', ')
        );

        // Validate expected structure
        if (
          !parsedContent.keywords &&
          !parsedContent.requirements &&
          !parsedContent.responsibilities
        ) {
          debugLogger.warn('Parsed JSON is missing expected keys');
        }

        return {
          keywords: parsedContent.keywords || [],
          requirements: parsedContent.requirements || [],
          responsibilities: parsedContent.responsibilities || [],
        };
      } catch (jsonError) {
        debugLogger.error('Error parsing API response: ' + String(jsonError));
        debugLogger.error(
          'Content that failed to parse (preview): ' +
            processedContent.substring(0, 200) +
            (processedContent.length > 200 ? '...' : '')
        );

        // Attempt to extract JSON using regex as a fallback
        try {
          debugLogger.info('Attempting fallback JSON extraction with regex...');
          const jsonMatch = processedContent.match(/{[\s\S]*}/);
          if (jsonMatch) {
            const extractedJson = jsonMatch[0];
            debugLogger.info(
              'Extracted JSON using regex (preview): ' +
                extractedJson.substring(0, 100) +
                (extractedJson.length > 100 ? '...' : '')
            );

            const parsedContent = JSON.parse(extractedJson);
            debugLogger.info('Successfully parsed extracted JSON');
            return {
              keywords: parsedContent.keywords || [],
              requirements: parsedContent.requirements || [],
              responsibilities: parsedContent.responsibilities || [],
            };
          }

          debugLogger.error('No JSON-like structure found in the response');
        } catch (fallbackError) {
          debugLogger.error(
            'Fallback parsing also failed: ' + String(fallbackError)
          );
        }

        // If we got here and retries are left, throw so we can retry
        if (retries < maxRetries) {
          debugLogger.info(
            `Will retry analysis (${retries + 1}/${maxRetries} attempts used)`
          );
          throw new Error('Failed to parse API response');
        }

        debugLogger.error('Maximum retry attempts reached, returning null');
        return null;
      }
    } catch (error) {
      debugLogger.error(
        `Error analyzing job description (attempt ${retries + 1}/${maxRetries + 1}): ` +
          String(error)
      );

      // eslint-disable-next-line no-plusplus
      retries++;

      if (retries <= maxRetries) {
        debugLogger.info(
          `Retrying job description analysis (attempt ${retries + 1}/${maxRetries + 1})...`
        );
        // Add exponential backoff
        // eslint-disable-next-line @typescript-eslint/no-loop-func
        await new Promise(resolve => {
          setTimeout(resolve, 1000 * 2 ** (retries - 1));
        });
      } else {
        debugLogger.error('Maximum retry attempts reached.');
        return null;
      }
    }
  }

  return null;
}

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

  while (retries <= maxRetries) {
    try {
      // If analysis is not provided, analyze the job description
      let jobAnalysis = analysis;
      if (!jobAnalysis) {
        jobAnalysis = await analyzeJobDescription(jobDescription, settings);

        if (!jobAnalysis) {
          throw new Error('Failed to analyze job description');
        }
      }

      // Get or create OpenAI client
      const openai = getOpenAIClient(settings);

      // Prepare messages
      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        {
          role: 'system',
          content:
            'You are a professional resume writer that creates tailored resumes based on job descriptions and user profiles.',
        },
        {
          role: 'user',
          content: `Create a tailored resume for the following job description using the provided user profile and template.
          
          Job Description:
          ${jobDescription}
          
          Job Analysis:
          Keywords: ${jobAnalysis.keywords.join(', ')}
          Requirements: ${jobAnalysis.requirements.join(', ')}
          Responsibilities: ${jobAnalysis.responsibilities.join(', ')}
          
          User Profile:
          ${JSON.stringify(profile, null, 2)}
          
          Resume Template:
          ${template}
          
          Generate a complete resume that matches the template format and highlights the most relevant skills and experiences for this job.`,
        },
      ];

      // Log the request
      debugLogger.info('Resume API Request - Model:' + settings.model);
      debugLogger.info(
        'Resume API Request - Messages:' + JSON.stringify(messages, null, 2)
      );
      debugLogger.info(
        'Resume API Request - API Key:' +
          (settings.apiKey ? 'sk-...' + settings.apiKey.slice(-4) : 'undefined')
      );

      // Make the API request with a proper AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      debugLogger.info('Making API request to generate resume...');
      const requestOptions = {
        model: settings.model,
        messages: messages,
        temperature: 0.5,
      };
      debugLogger.info(
        'Request Options: ' + JSON.stringify(requestOptions, null, 2)
      );
      let response;

      try {
        response = await openai.chat.completions.create(requestOptions);

        clearTimeout(timeoutId);
      } catch (apiError) {
        clearTimeout(timeoutId);

        if (apiError instanceof Error && apiError.name === 'AbortError') {
          throw new Error('API request timed out after 60 seconds');
        }

        debugLogger.error('Error during API call: ' + String(apiError));
        throw new Error(
          `API call failed: ${apiError instanceof Error ? apiError.message : String(apiError)}`
        );
      }

      // Log response
      debugLogger.info('Resume API Response received');

      const { content } = response.choices[0].message;
      if (!content) {
        throw new Error('No content in response');
      }

      return content;
    } catch (error) {
      debugLogger.error(
        `Error generating tailored resume (attempt ${retries + 1}/${maxRetries + 1}): ` +
          String(error)
      );

      // eslint-disable-next-line no-plusplus
      retries++;

      if (retries <= maxRetries) {
        debugLogger.info(
          `Retrying resume generation (attempt ${retries + 1}/${maxRetries + 1})...`
        );
        // Add exponential backoff
        // eslint-disable-next-line @typescript-eslint/no-loop-func
        await new Promise(resolve => {
          setTimeout(resolve, 1000 * 2 ** (retries - 1));
        });
      } else {
        debugLogger.error('Maximum retry attempts reached.');
        return null;
      }
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
    debugLogger.info(
      'Running resume workflow with job description: ' +
        jobDescription.substring(0, 100) +
        '...'
    );

    const reportProgress = async (phase: string, percentage: number) => {
      debugLogger.info(`Progress: ${phase} - ${percentage}%`);
      await callbacks?.onProgress?.(phase, percentage);
    };

    await reportProgress('Initializing', 5);

    // Load user profile
    debugLogger.info('Loading user profile...');
    const profile = await loadUserProfile();
    debugLogger.info(
      'Loaded profile: ' + (profile ? 'Profile found' : 'No profile found')
    );

    await reportProgress('Loading data', 10);

    // Load template
    debugLogger.info('Loading resume template...');
    const template = await loadResumeTemplate();
    debugLogger.info(
      'Loaded template: ' + (template ? 'Template found' : 'No template found')
    );

    await reportProgress('Loading settings', 15);

    // Load settings
    debugLogger.info('Loading OpenAI settings...');
    const settings = await loadOpenAISettings();
    debugLogger.info(
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

    await reportProgress('Starting analysis', 20);

    // Call the analysis start callback
    await callbacks?.onAnalysisStart?.();

    // Analyze the job description first
    await reportProgress('Analyzing job', 25);
    const analysis = await analyzeJobDescription(jobDescription, settings);

    if (!analysis) {
      const error = new Error('Failed to analyze job description');
      await callbacks?.onError?.(error);
      throw error;
    }

    await reportProgress('Analysis complete', 50);

    // Call the analysis complete callback
    await callbacks?.onAnalysisComplete?.();

    // Call the generation start callback
    await callbacks?.onGenerationStart?.();

    await reportProgress('Starting generation', 60);

    // Generate the tailored resume
    const result = await generateTailoredResume(
      jobDescription,
      profile,
      template,
      settings,
      analysis
    );

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
    debugLogger.error('Error running resume workflow: ' + String(error));
    await callbacks?.onError?.(
      error instanceof Error ? error : new Error(String(error))
    );
    return null;
  }
}
