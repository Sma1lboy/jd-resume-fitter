import { UserProfile, UserProfileForm } from '@/types';

/**
 * Converts a UserProfile object to a UserProfileForm object
 * (converts arrays and objects to strings for form fields)
 */
export function profileToForm(userProfile: UserProfile): UserProfileForm {
  // Create a base object with all required fields
  return {
    name: userProfile.name || '',
    title: userProfile.title || '',
    email: userProfile.email || '',
    phone: userProfile.phone || '',
    location: userProfile.location || '',
    linkedin: userProfile.linkedin || '',
    github: userProfile.github || '',
    website: userProfile.website || '',
    summary: userProfile.summary || '',
    skills: Array.isArray(userProfile.skills)
      ? userProfile.skills.join(', ')
      : '',
    courses: Array.isArray(userProfile.courses)
      ? userProfile.courses.join(', ')
      : '',
    experience: Array.isArray(userProfile.experience)
      ? JSON.stringify(userProfile.experience, null, 2)
      : '',
    education: Array.isArray(userProfile.education)
      ? JSON.stringify(userProfile.education, null, 2)
      : '',
    certifications: Array.isArray(userProfile.certifications)
      ? JSON.stringify(userProfile.certifications, null, 2)
      : '',
    languages: Array.isArray(userProfile.languages)
      ? JSON.stringify(userProfile.languages, null, 2)
      : '',
  };
}

/**
 * Converts a UserProfileForm object to a UserProfile object
 * (converts strings back to arrays and objects for storage)
 */
export function formToProfile(profileForm: UserProfileForm): UserProfile {
  return {
    name: profileForm.name,
    title: profileForm.title,
    email: profileForm.email,
    phone: profileForm.phone,
    location: profileForm.location,
    linkedin: profileForm.linkedin,
    github: profileForm.github,
    website: profileForm.website,
    summary: profileForm.summary,
    skills: profileForm.skills
      .split(',')
      .map(skill => skill.trim())
      .filter(Boolean),
    courses: profileForm.courses
      ? profileForm.courses
          .split(',')
          .map(course => course.trim())
          .filter(Boolean)
      : [],
    experience: profileForm.experience
      ? JSON.parse(profileForm.experience)
      : [],
    education: profileForm.education ? JSON.parse(profileForm.education) : [],
    certifications: profileForm.certifications
      ? JSON.parse(profileForm.certifications)
      : [],
    languages: profileForm.languages ? JSON.parse(profileForm.languages) : [],
  };
}

/**
 * Safely parses a JSON string, returning a default value if parsing fails
 */
export function safeJsonParse<T>(jsonString: string, defaultValue: T): T {
  try {
    return jsonString ? JSON.parse(jsonString) : defaultValue;
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return defaultValue;
  }
}

/**
 * Safely stringifies an object to JSON, returning a default string if stringification fails
 */
export function safeJsonStringify(obj: any, defaultValue = '[]'): string {
  try {
    return JSON.stringify(obj, null, 2);
  } catch (error) {
    console.error('Error stringifying object:', error);
    return defaultValue;
  }
}
