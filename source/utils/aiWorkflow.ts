import { browser } from 'webextension-polyfill-ts';

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
    const data = await browser.storage.local.get('userProfile');
    if (data.userProfile) {
      return JSON.parse(data.userProfile);
    }
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
    const data = await browser.storage.local.get('resumeTemplate');
    if (data.resumeTemplate) {
      return data.resumeTemplate;
    }
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
    const data = await browser.storage.local.get('openAISettings');
    if (data.openAISettings) {
      return JSON.parse(data.openAISettings);
    }
    return defaultOpenAISettings;
  } catch (error) {
    console.error('Error loading OpenAI settings:', error);
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
    const response = await fetch(`${settings.endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${settings.apiKey}`,
      },
      body: JSON.stringify({
        model: settings.model,
        messages: [
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
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const { content } = data.choices[0].message;

    // Parse the JSON response
    try {
      const parsedContent = JSON.parse(content);
      return {
        keywords: parsedContent.keywords || [],
        requirements: parsedContent.requirements || [],
        responsibilities: parsedContent.responsibilities || [],
      };
    } catch (error) {
      console.error('Error parsing API response:', error);
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
  settings: OpenAISettings
): Promise<string | null> {
  try {
    // First analyze the job description
    const analysis = await analyzeJobDescription(jobDescription, settings);

    if (!analysis) {
      throw new Error('Failed to analyze job description');
    }

    // Generate the resume
    const response = await fetch(`${settings.endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${settings.apiKey}`,
      },
      body: JSON.stringify({
        model: settings.model,
        messages: [
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
            Keywords: ${analysis.keywords.join(', ')}
            Requirements: ${analysis.requirements.join(', ')}
            Responsibilities: ${analysis.responsibilities.join(', ')}
            
            User Profile:
            ${JSON.stringify(profile, null, 2)}
            
            Resume Template:
            ${template}
            
            Generate a complete resume that matches the template format and highlights the most relevant skills and experiences for this job.`,
          },
        ],
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const { content } = data.choices[0].message;
    return content;
  } catch (error) {
    console.error('Error generating tailored resume:', error);
    return null;
  }
}

// Main workflow function
export async function runResumeWorkflow(
  jobDescription: string
): Promise<string | null> {
  try {
    // Load all necessary data
    const [profile, template, settings] = await Promise.all([
      loadUserProfile(),
      loadResumeTemplate(),
      loadOpenAISettings(),
    ]);

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

    // Generate the tailored resume
    return await generateTailoredResume(
      jobDescription,
      profile,
      template,
      settings
    );
  } catch (error) {
    console.error('Error running resume workflow:', error);
    return null;
  }
}
