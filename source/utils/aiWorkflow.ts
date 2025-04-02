import { browser } from 'webextension-polyfill-ts';

// Define types for our workflow
export interface UserProfile {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  website: string;
  summary: string;
  skills: string[];
  experience: {
    company: string;
    title: string;
    location: string;
    startDate: string;
    endDate: string;
    highlights: string[];
  }[];
  education: {
    institution: string;
    degree: string;
    startDate: string;
    endDate: string;
    gpa: string;
  }[];
  certifications: {
    name: string;
    issuer: string;
    date: string;
  }[];
  languages: {
    language: string;
    proficiency: string;
  }[];
}

export interface ResumeTemplate {
  content: string;
}

// interface WorkflowInput {
//   jobDescription: string;
//   userProfile: UserProfile;
//   resumeTemplate: ResumeTemplate;
// }

interface WorkflowOutput {
  resumeContent: string;
}

// Load user profile from storage
export async function loadUserProfile(): Promise<UserProfile> {
  try {
    const data = await browser.storage.local.get('userProfile');
    if (data.userProfile) {
      return JSON.parse(data.userProfile);
    }

    // If no profile exists, load the default one from templates
    const response = await fetch(
      browser.runtime.getURL('templates/user_profile.json')
    );
    const defaultProfile = await response.json();

    // Save the default profile to storage
    await browser.storage.local.set({
      userProfile: JSON.stringify(defaultProfile),
    });

    return defaultProfile;
  } catch (error) {
    console.error('Error loading user profile:', error);
    throw error;
  }
}

// Load resume template from storage
export async function loadResumeTemplate(): Promise<ResumeTemplate> {
  try {
    const data = await browser.storage.local.get('resumeTemplate');
    if (data.resumeTemplate) {
      return { content: data.resumeTemplate };
    }

    // If no template exists, load the default one from templates
    const response = await fetch(
      browser.runtime.getURL('templates/resume_template.tex')
    );
    const defaultTemplate = await response.text();

    // Save the default template to storage
    await browser.storage.local.set({ resumeTemplate: defaultTemplate });

    return { content: defaultTemplate };
  } catch (error) {
    console.error('Error loading resume template:', error);
    throw error;
  }
}

// Job Analysis: Analyze the job description to extract key requirements and skills
async function analyzeJobDescription(jobDescription: string): Promise<string> {
  try {
    // In a real implementation, you would use an AI API
    // For now, we'll simulate the response with a simple keyword extraction
    const keywords = [
      'javascript',
      'typescript',
      'react',
      'node',
      'web',
      'frontend',
      'backend',
      'fullstack',
      'developer',
      'engineer',
      'software',
      'programming',
      'coding',
      'api',
      'database',
      'sql',
      'nosql',
      'cloud',
      'aws',
      'azure',
      'gcp',
      'devops',
      'ci/cd',
      'testing',
      'agile',
      'scrum',
      'git',
      'github',
    ];

    // Extract keywords from job description
    const foundKeywords = keywords.filter(keyword =>
      jobDescription.toLowerCase().includes(keyword.toLowerCase())
    );

    // Create a simple analysis
    const analysis = `
    Job Analysis:
    - Required Skills: ${foundKeywords.join(', ')}
    - Experience: ${jobDescription.includes('years') ? '3+ years in development' : 'Not specified'}
    - Education: ${jobDescription.includes('degree') ? "Bachelor's degree preferred" : 'Not specified'}
    - Soft Skills: Communication, teamwork, problem-solving
    - Additional Requirements: ${jobDescription.includes('cloud') ? 'Experience with cloud platforms' : 'None specified'}
    `;

    return analysis;
  } catch (error) {
    console.error('Error analyzing job description:', error);
    throw error;
  }
}

// Generate LaTeX Resume: Create a tailored resume based on the job analysis and user profile
async function generateLatexResume(
  jobAnalysis: string,
  userProfile: UserProfile,
  resumeTemplate: ResumeTemplate
): Promise<string> {
  try {
    // Extract skills from job analysis
    const requiredSkillsMatch = jobAnalysis.match(/Required Skills: (.*)/);
    const requiredSkills = requiredSkillsMatch
      ? requiredSkillsMatch[1].split(', ')
      : [];

    // Filter user skills to highlight matching ones
    const highlightedSkills = userProfile.skills.filter(skill =>
      requiredSkills.some(req =>
        skill.toLowerCase().includes(req.toLowerCase())
      )
    );

    // If no skills match, use all skills
    const skillsToUse =
      highlightedSkills.length > 0 ? highlightedSkills : userProfile.skills;

    // Create skills section
    const skillsSection = skillsToUse.join(', ');

    // Create experience section
    const experienceSection = userProfile.experience
      .map(
        exp =>
          `\\cventry{${exp.startDate} -- ${exp.endDate}}{${exp.title}}{${exp.company}}{${exp.location}}{}{${exp.highlights.join('. ')}}`
      )
      .join('\n');

    // Create education section
    const educationSection = userProfile.education
      .map(
        edu =>
          `\\cventry{${edu.startDate} -- ${edu.endDate}}{${edu.degree}}{${edu.institution}}{}{}{GPA: ${edu.gpa}}`
      )
      .join('\n');

    // Create certifications section
    const certificationsSection = userProfile.certifications
      .map(cert => `\\cvitem{${cert.date}}{${cert.name} (${cert.issuer})}`)
      .join('\n');

    // Create languages section
    const languagesSection = userProfile.languages
      .map(
        lang => `\\cvitemwithcomment{${lang.language}}{${lang.proficiency}}{}`
      )
      .join('\n');

    // Replace placeholders in template
    const resume = resumeTemplate.content
      .replace(/{{name}}/g, userProfile.name)
      .replace(/{{title}}/g, userProfile.title)
      .replace(/{{location}}/g, userProfile.location)
      .replace(/{{phone}}/g, userProfile.phone)
      .replace(/{{email}}/g, userProfile.email)
      .replace(/{{linkedin}}/g, userProfile.linkedin)
      .replace(/{{github}}/g, userProfile.github)
      .replace(/{{website}}/g, userProfile.website)
      .replace(/{{summary}}/g, userProfile.summary)
      .replace(/{{skills}}/g, skillsSection)
      .replace(/{{experience}}/g, experienceSection)
      .replace(/{{education}}/g, educationSection)
      .replace(/{{certifications}}/g, certificationsSection)
      .replace(/{{languages}}/g, languagesSection);

    return resume;
  } catch (error) {
    console.error('Error generating LaTeX resume:', error);
    throw error;
  }
}

// Main workflow function
export async function runResumeWorkflow(
  jobDescription: string
): Promise<WorkflowOutput> {
  try {
    // Step 1: Load user profile and resume template
    const userProfile = await loadUserProfile();
    const resumeTemplate = await loadResumeTemplate();

    // Step 2: Analyze job description
    console.log('Analyzing job description...');
    const jobAnalysis = await analyzeJobDescription(jobDescription);
    console.log('Job analysis complete.');

    // Step 3: Generate LaTeX resume
    console.log('Generating tailored resume...');
    const latexResponse = await generateLatexResume(
      jobAnalysis,
      userProfile,
      resumeTemplate
    );
    console.log('Resume generation complete.');

    return { resumeContent: latexResponse };
  } catch (error) {
    console.error('Error in resume workflow:', error);
    throw error;
  }
}
