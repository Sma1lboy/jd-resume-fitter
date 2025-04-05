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
  courses: string[];
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
    relevantCourses?: string;
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

export interface UserProfileForm {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  website: string;
  summary: string;
  skills: string;
  courses: string;
  experience: string;
  education: string;
  certifications: string;
  languages: string;
}
