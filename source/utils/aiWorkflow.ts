import { browser } from 'webextension-polyfill-ts';
import OpenAI from 'openai';

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

// Load user profile from storage
export async function loadUserProfile(): Promise<UserProfile | null> {
  try {
    console.log('Loading user profile from storage...');
    const data = await browser.storage.local.get('userProfile');
    console.log(
      'User profile data received:',
      data ? 'Data found' : 'No data found'
    );

    if (data.userProfile) {
      const profile = JSON.parse(data.userProfile);
      console.log('User profile parsed successfully:', {
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
      });
      return profile;
    }

    console.log('No user profile found in storage');
    return null;
  } catch (error) {
    console.error('Error loading user profile:', error);
    return null;
  }
}

// Save user profile to storage
export async function saveUserProfile(profile: UserProfile): Promise<boolean> {
  try {
    await browser.storage.local.set({
      userProfile: JSON.stringify(profile),
    });
    return true;
  } catch (error) {
    console.error('Error saving user profile:', error);
    return false;
  }
}

// Load resume template from storage
export async function loadResumeTemplate(): Promise<string | null> {
  try {
    console.log('Loading resume template from storage...');
    const data = await browser.storage.local.get('resumeTemplate');
    console.log(
      'Resume template data received:',
      data ? 'Data found' : 'No data found'
    );

    if (data.resumeTemplate) {
      console.log('Resume template found, length:', data.resumeTemplate.length);
      // Log a preview of the template
      console.log(
        'Template preview:',
        data.resumeTemplate.substring(0, 100) + '...'
      );
      return data.resumeTemplate;
    }

    console.log('No resume template found in storage');
    return null;
  } catch (error) {
    console.error('Error loading resume template:', error);
    return null;
  }
}

// Save resume template to storage
export async function saveResumeTemplate(template: string): Promise<boolean> {
  try {
    await browser.storage.local.set({
      resumeTemplate: template,
    });
    return true;
  } catch (error) {
    console.error('Error saving resume template:', error);
    return false;
  }
}

// Load OpenAI settings from storage
export async function loadOpenAISettings(): Promise<OpenAISettings> {
  try {
    console.log('Loading OpenAI settings from storage...');
    const data = await browser.storage.local.get('openAISettings');
    console.log(
      'Storage data received:',
      data ? 'Data found' : 'No data found'
    );

    if (data.openAISettings) {
      const settings = JSON.parse(data.openAISettings);
      console.log('Parsed OpenAI settings:', {
        endpoint: settings.endpoint,
        apiKey: settings.apiKey
          ? `${settings.apiKey.substring(0, 3)}...${settings.apiKey.substring(settings.apiKey.length - 4)}`
          : 'No API key',
        model: settings.model,
      });
      return settings;
    }

    console.log('No OpenAI settings found, using defaults:', {
      endpoint: defaultOpenAISettings.endpoint,
      apiKey: defaultOpenAISettings.apiKey ? 'API key exists' : 'No API key',
      model: defaultOpenAISettings.model,
    });
    return defaultOpenAISettings;
  } catch (error) {
    console.error('Error loading OpenAI settings:', error);
    console.log('Using default OpenAI settings due to error');
    return defaultOpenAISettings;
  }
}

// Save OpenAI settings to storage
export async function saveOpenAISettings(
  settings: OpenAISettings
): Promise<boolean> {
  try {
    await browser.storage.local.set({
      openAISettings: JSON.stringify(settings),
    });
    return true;
  } catch (error) {
    console.error('Error saving OpenAI settings:', error);
    return false;
  }
}

// Create OpenAI client from settings
function createOpenAIClient(settings: OpenAISettings): OpenAI {
  console.log('Creating OpenAI client with:');
  console.log(
    '- API Key:',
    settings.apiKey
      ? `${settings.apiKey.substring(0, 3)}...${settings.apiKey.substring(settings.apiKey.length - 4)}`
      : 'No API key'
  );
  console.log('- Endpoint:', settings.endpoint);

  if (!settings.apiKey) {
    throw new Error('No API key provided for OpenAI client');
  }

  try {
    const client = new OpenAI({
      apiKey: settings.apiKey,
      baseURL: settings.endpoint,
    });
    console.log('OpenAI client created successfully');
    return client;
  } catch (error) {
    console.error('Error creating OpenAI client:', error);
    throw new Error(
      `Failed to create OpenAI client: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

// Analyze job description using OpenAI
export async function analyzeJobDescription(
  jobDescription: string,
  settings: OpenAISettings
): Promise<{
  keywords: string[];
  requirements: string[];
  responsibilities: string[];
} | null> {
  try {
    // Create OpenAI client
    const openai = createOpenAIClient(settings);

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

    // Log the request
    console.log('API Request - Model:', settings.model);
    console.log('API Request - Messages:', JSON.stringify(messages, null, 2));
    console.log(
      'API Request - API Key:',
      settings.apiKey ? 'sk-...' + settings.apiKey.slice(-4) : 'undefined'
    );

    // Make the API request with timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(
        () => reject(new Error('API request timed out after 30 seconds')),
        30000
      );
    });

    console.log('Making API request to analyze job description...');
    let apiPromise;
    try {
      apiPromise = openai.chat.completions.create({
        model: settings.model,
        messages: messages,
        temperature: 0.3,
      });
    } catch (apiError) {
      console.error('Error creating API request:', apiError);
      throw new Error(
        `Failed to create API request: ${apiError instanceof Error ? apiError.message : String(apiError)}`
      );
    }

    // Race between the API call and the timeout
    console.log('Waiting for API response or timeout...');
    let response;
    try {
      response = (await Promise.race([
        apiPromise,
        timeoutPromise,
      ])) as OpenAI.Chat.ChatCompletion;
    } catch (raceError) {
      console.error('Error during API call race:', raceError);
      throw new Error(
        `API call failed: ${raceError instanceof Error ? raceError.message : String(raceError)}`
      );
    }

    // Log response
    console.log('API Response:', JSON.stringify(response, null, 2));

    const { content } = response.choices[0].message;
    if (!content) {
      throw new Error('No content in response');
    }

    console.log('Raw API response content:', content);

    // Preprocess the content to handle markdown formatting
    let processedContent = content;

    // Remove markdown code blocks if present (```json ... ```)
    if (processedContent.includes('```')) {
      processedContent = processedContent.replace(
        /```(?:json)?\s*([\s\S]*?)\s*```/g,
        '$1'
      );
      console.log(
        'Processed content after removing markdown:',
        processedContent
      );
    }

    // Remove any leading/trailing whitespace
    processedContent = processedContent.trim();

    // Parse the JSON response
    try {
      // Try to parse the processed content
      const parsedContent = JSON.parse(processedContent);
      console.log('Successfully parsed JSON:', parsedContent);

      return {
        keywords: parsedContent.keywords || [],
        requirements: parsedContent.requirements || [],
        responsibilities: parsedContent.responsibilities || [],
      };
    } catch (error) {
      console.error('Error parsing API response:', error);
      console.error('Content that failed to parse:', processedContent);

      // Attempt to extract JSON using regex as a fallback
      try {
        const jsonMatch = processedContent.match(/{[\s\S]*}/);
        if (jsonMatch) {
          const extractedJson = jsonMatch[0];
          console.log('Extracted JSON using regex:', extractedJson);

          const parsedContent = JSON.parse(extractedJson);
          return {
            keywords: parsedContent.keywords || [],
            requirements: parsedContent.requirements || [],
            responsibilities: parsedContent.responsibilities || [],
          };
        }
      } catch (fallbackError) {
        console.error('Fallback parsing also failed:', fallbackError);
      }

      return null;
    }
  } catch (error) {
    console.error('Error analyzing job description:', error);
    return null;
  }
}

// Generate tailored resume using OpenAI
export async function generateTailoredResume(
  jobDescription: string,
  profile: UserProfile,
  template: string,
  settings: OpenAISettings,
  analysis?: {
    keywords: string[];
    requirements: string[];
    responsibilities: string[];
  }
): Promise<string | null> {
  try {
    // If analysis is not provided, analyze the job description
    let jobAnalysis = analysis;
    if (!jobAnalysis) {
      jobAnalysis = await analyzeJobDescription(jobDescription, settings);

      if (!jobAnalysis) {
        throw new Error('Failed to analyze job description');
      }
    }

    // Create OpenAI client
    const openai = createOpenAIClient(settings);

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
    console.log('Resume API Request - Model:', settings.model);
    console.log(
      'Resume API Request - Messages:',
      JSON.stringify(messages, null, 2)
    );
    console.log(
      'Resume API Request - API Key:',
      settings.apiKey ? 'sk-...' + settings.apiKey.slice(-4) : 'undefined'
    );

    // Make the API request with timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(
        () => reject(new Error('API request timed out after 60 seconds')),
        60000
      );
    });

    console.log('Making API request to generate resume...');
    let apiPromise;
    try {
      apiPromise = openai.chat.completions.create({
        model: settings.model,
        messages: messages,
        temperature: 0.5,
      });
    } catch (apiError) {
      console.error('Error creating resume API request:', apiError);
      throw new Error(
        `Failed to create resume API request: ${apiError instanceof Error ? apiError.message : String(apiError)}`
      );
    }

    // Race between the API call and the timeout
    console.log('Waiting for resume API response or timeout...');
    let response;
    try {
      response = (await Promise.race([
        apiPromise,
        timeoutPromise,
      ])) as OpenAI.Chat.ChatCompletion;
    } catch (raceError) {
      console.error('Error during resume API call race:', raceError);
      throw new Error(
        `Resume API call failed: ${raceError instanceof Error ? raceError.message : String(raceError)}`
      );
    }

    // Log response
    console.log('Resume API Response:', JSON.stringify(response, null, 2));

    const { content } = response.choices[0].message;
    if (!content) {
      throw new Error('No content in response');
    }

    return content;
  } catch (error) {
    console.error('Error generating tailored resume:', error);
    return null;
  }
}

// Define progress callback interface
export interface ProgressCallbacks {
  onAnalysisStart?: () => void;
  onAnalysisComplete?: () => void;
  onGenerationStart?: () => void;
  onGenerationComplete?: () => void;
}

// Main workflow function
export async function runResumeWorkflow(
  jobDescription: string,
  callbacks?: ProgressCallbacks
): Promise<string | null> {
  try {
    console.log(
      'Running resume workflow with job description:',
      jobDescription.substring(0, 100) + '...' // Log just the beginning to avoid huge logs
    );

    // Load user profile
    console.log('Loading user profile...');
    const profile = await loadUserProfile();
    console.log(
      'Loaded profile:',
      profile ? 'Profile found' : 'No profile found'
    );

    // Load template
    console.log('Loading resume template...');
    const template = await loadResumeTemplate();
    console.log(
      'Loaded template:',
      template ? 'Template found' : 'No template found'
    );

    // Load settings
    console.log('Loading OpenAI settings...');
    const settings = await loadOpenAISettings();
    console.log('Loaded settings:', {
      endpoint: settings.endpoint,
      apiKey: settings.apiKey
        ? `${settings.apiKey.substring(0, 3)}...${settings.apiKey.substring(settings.apiKey.length - 4)}`
        : 'No API key',
      model: settings.model,
    });

    // Check if all required data is available
    if (!profile) {
      throw new Error(
        'User profile not found. Please set up your profile first.'
      );
    }

    if (!template) {
      throw new Error(
        'Resume template not found. Please set up a template first.'
      );
    }

    if (!settings.apiKey) {
      throw new Error(
        'OpenAI API key not found. Please set up your API key first.'
      );
    }

    // Call the analysis start callback
    callbacks?.onAnalysisStart?.();

    // Analyze the job description first
    const analysis = await analyzeJobDescription(jobDescription, settings);

    if (!analysis) {
      throw new Error('Failed to analyze job description');
    }

    // Call the analysis complete callback
    callbacks?.onAnalysisComplete?.();

    // Call the generation start callback
    callbacks?.onGenerationStart?.();

    // Generate the tailored resume
    const result = await generateTailoredResume(
      jobDescription,
      profile,
      template,
      settings,
      analysis
    );

    // Call the generation complete callback
    callbacks?.onGenerationComplete?.();

    return result;
  } catch (error) {
    console.error('Error running resume workflow:', error);
    return null;
  }
}
