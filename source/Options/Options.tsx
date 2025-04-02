import * as React from 'react';
import { browser } from 'webextension-polyfill-ts';
import * as Tabs from '@radix-ui/react-tabs';
import * as Label from '@radix-ui/react-label';
import { UserProfile } from '../utils/aiWorkflow';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/textarea';

// Define the form profile type (strings for form fields)
interface UserProfileForm {
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
  experience: string;
  education: string;
  certifications: string;
  languages: string;
}

// We'll use the UserProfile interface from aiWorkflow.ts

const Options: React.FC = () => {
  // Tab state for switching between manual input and JSON import
  const [inputMethod, setInputMethod] = React.useState<string>('manual');

  // JSON import state
  const [jsonInput, setJsonInput] = React.useState<string>('');
  const [jsonError, setJsonError] = React.useState<string>('');

  const [profile, setProfile] = React.useState<UserProfileForm>({
    name: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    website: '',
    summary: '',
    skills: '',
    experience: '',
    education: '',
    certifications: '',
    languages: '',
  });

  // State for editing individual entries
  const [newSkill, setNewSkill] = React.useState<string>('');
  const [newExperienceItem, setNewExperienceItem] = React.useState({
    company: '',
    title: '',
    date: '',
    description: '',
  });
  const [newEducationItem, setNewEducationItem] = React.useState({
    institution: '',
    degree: '',
    date: '',
  });

  const [status, setStatus] = React.useState<string>('');

  // Load profile on component mount
  React.useEffect(() => {
    loadProfile();
  }, []);

  // Load user profile from storage
  const loadProfile = async (): Promise<void> => {
    try {
      const data = await browser.storage.local.get('userProfile');
      if (data.userProfile) {
        const userProfile = JSON.parse(data.userProfile) as UserProfile;

        // Convert arrays to strings for form fields
        const formattedProfile = {
          ...userProfile,
          skills: Array.isArray(userProfile.skills)
            ? userProfile.skills.join(', ')
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

        setProfile(formattedProfile as UserProfileForm);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setStatus('Error loading profile');
    }
  };

  // Save profile to storage
  const saveProfile = async (): Promise<void> => {
    try {
      // Convert strings back to arrays/objects for storage
      const storageProfile: UserProfile = {
        name: profile.name,
        title: profile.title,
        email: profile.email,
        phone: profile.phone,
        location: profile.location,
        linkedin: profile.linkedin,
        github: profile.github,
        website: profile.website,
        summary: profile.summary,
        skills: profile.skills.split(',').map(skill => skill.trim()),
        experience: profile.experience ? JSON.parse(profile.experience) : [],
        education: profile.education ? JSON.parse(profile.education) : [],
        certifications: profile.certifications
          ? JSON.parse(profile.certifications)
          : [],
        languages: profile.languages ? JSON.parse(profile.languages) : [],
      };

      await browser.storage.local.set({
        userProfile: JSON.stringify(storageProfile),
      });

      setStatus('Profile saved successfully!');
      setTimeout(() => setStatus(''), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setStatus(
        `Error saving profile: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  };

  // Handle profile field changes
  const handleProfileChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle JSON input changes
  const handleJsonInputChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ): void => {
    setJsonInput(e.target.value);
    setJsonError('');
  };

  // Import profile from JSON
  const importProfileFromJson = (): void => {
    try {
      if (!jsonInput.trim()) {
        setJsonError('Please enter JSON data');
        return;
      }

      // Parse the JSON input
      const jsonData = JSON.parse(jsonInput);

      // Check if it's the format with personalInfo or direct UserProfile format
      const isCustomFormat = jsonData.personalInfo && jsonData.workExperience;

      // Convert to UserProfileForm format for the form
      let newProfile: UserProfileForm;

      if (isCustomFormat) {
        // Convert from custom format to UserProfileForm
        newProfile = {
          name: jsonData.personalInfo.name || '',
          title: '', // Not directly in the custom format
          email: jsonData.personalInfo.email || '',
          phone: jsonData.personalInfo.phone || '',
          location: jsonData.education?.[0]?.location || '',
          linkedin: jsonData.personalInfo.linkedin || '',
          github: jsonData.personalInfo.github || '',
          website: '',
          summary: '', // Not directly in the custom format

          // Convert skills arrays to comma-separated string
          skills: [
            ...(jsonData.technicalSkills?.languages || []),
            ...(jsonData.technicalSkills?.frameworksAndTools || []),
          ].join(', '),

          // Convert work experience to JSON string
          experience: JSON.stringify(
            (jsonData.workExperience || []).map(exp => ({
              company: exp.company,
              title: exp.title,
              date: exp.dateRange,
              description: exp.experiencePoints
                .filter(point => point.mustInclude)
                .map(point => point.description),
            })),
            null,
            2
          ),

          // Convert education to JSON string
          education: JSON.stringify(
            (jsonData.education || []).map(edu => ({
              institution: edu.institution,
              degree: edu.degree,
              date: edu.dateRange,
            })),
            null,
            2
          ),

          // Convert projects to certifications
          certifications: JSON.stringify(
            (jsonData.projects || []).map(proj => ({
              name: proj.name,
              issuer: proj.technologies || 'N/A',
              date: proj.dateRange || 'N/A',
            })),
            null,
            2
          ),

          // Languages field is empty as it's not directly in the custom format
          languages: JSON.stringify([], null, 2),
        };
      } else {
        // Assume it's already in UserProfile format
        newProfile = {
          name: jsonData.name || '',
          title: jsonData.title || '',
          email: jsonData.email || '',
          phone: jsonData.phone || '',
          location: jsonData.location || '',
          linkedin: jsonData.linkedin || '',
          github: jsonData.github || '',
          website: jsonData.website || '',
          summary: jsonData.summary || '',
          skills: Array.isArray(jsonData.skills)
            ? jsonData.skills.join(', ')
            : '',
          experience: JSON.stringify(jsonData.experience || [], null, 2),
          education: JSON.stringify(jsonData.education || [], null, 2),
          certifications: JSON.stringify(
            jsonData.certifications || [],
            null,
            2
          ),
          languages: JSON.stringify(jsonData.languages || [], null, 2),
        };
      }

      setProfile(newProfile);
      setStatus('Profile imported successfully!');
      setTimeout(() => setStatus(''), 3000);

      // Switch to manual input tab to show the imported data
      setInputMethod('manual');
    } catch (error) {
      console.error('Error importing profile from JSON:', error);
      setJsonError(
        `Invalid JSON format: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 font-sans">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Resume Generator Settings
      </h1>

      {status && (
        <div className="bg-green-500 text-white p-3 mb-6 rounded text-center">
          {status}
        </div>
      )}

      <div className="border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <Tabs.Root
          value={inputMethod}
          onValueChange={setInputMethod}
          className="w-full"
        >
          <Tabs.List className="flex bg-gray-100 border-b border-gray-200">
            <Tabs.Trigger
              value="manual"
              className="px-4 py-3 font-medium data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-200"
            >
              Manual Input
            </Tabs.Trigger>
            <Tabs.Trigger
              value="json"
              className="px-4 py-3 font-medium data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-200"
            >
              JSON Import
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="manual" className="bg-white p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              User Profile
            </h2>
            <form
              onSubmit={e => {
                e.preventDefault();
                saveProfile();
              }}
              className="space-y-6"
            >
              {/* Personal Information Section */}
              <div className="space-y-4">
                <Input
                  label="Full Name"
                  type="text"
                  id="name"
                  name="name"
                  value={profile.name}
                  onChange={handleProfileChange}
                />

                <Input
                  label="Professional Title"
                  type="text"
                  id="title"
                  name="title"
                  value={profile.title}
                  onChange={handleProfileChange}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Email"
                    type="email"
                    id="email"
                    name="email"
                    value={profile.email}
                    onChange={handleProfileChange}
                  />

                  <Input
                    label="Phone"
                    type="text"
                    id="phone"
                    name="phone"
                    value={profile.phone}
                    onChange={handleProfileChange}
                  />
                </div>

                <Input
                  label="Location"
                  type="text"
                  id="location"
                  name="location"
                  value={profile.location}
                  onChange={handleProfileChange}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="LinkedIn"
                    type="text"
                    id="linkedin"
                    name="linkedin"
                    value={profile.linkedin}
                    onChange={handleProfileChange}
                  />

                  <Input
                    label="GitHub"
                    type="text"
                    id="github"
                    name="github"
                    value={profile.github}
                    onChange={handleProfileChange}
                  />
                </div>

                <Input
                  label="Website"
                  type="text"
                  id="website"
                  name="website"
                  value={profile.website}
                  onChange={handleProfileChange}
                />

                <Textarea
                  label="Professional Summary"
                  id="summary"
                  name="summary"
                  rows={3}
                  value={profile.summary}
                  onChange={handleProfileChange}
                  placeholder="Write a brief summary of your professional background and career objectives..."
                />
              </div>

              {/* Skills Section */}
              <div className="pt-4 border-t border-gray-200">
                <Label.Root
                  htmlFor="skills"
                  className="mb-2 block font-medium text-gray-700"
                >
                  Skills
                </Label.Root>
                <div className="flex flex-wrap gap-2 mb-3">
                  {profile.skills
                    .split(',')
                    .filter(s => s.trim())
                    .map((skill, index) => (
                      <div
                        key={index}
                        className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full flex items-center"
                      >
                        <span className="mr-2">{skill.trim()}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const skills = profile.skills
                              .split(',')
                              .filter(s => s.trim());
                            skills.splice(index, 1);
                            setProfile({
                              ...profile,
                              skills: skills.join(', '),
                            });
                          }}
                          className="text-blue-400 hover:text-red-500 transition-colors"
                          aria-label={`Remove ${skill.trim()} skill`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M18 6L6 18M6 6l12 12"></path>
                          </svg>
                        </button>
                      </div>
                    ))}
                </div>
                <div className="flex">
                  <Input
                    type="text"
                    id="newSkill"
                    value={newSkill}
                    onChange={e => setNewSkill(e.target.value)}
                    placeholder="Add a skill"
                    className="mr-2"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newSkill.trim()) {
                        const skills = profile.skills
                          ? profile.skills.split(',').filter(s => s.trim())
                          : [];
                        skills.push(newSkill.trim());
                        setProfile({
                          ...profile,
                          skills: skills.join(', '),
                        });
                        setNewSkill('');
                      }
                    }}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded shadow-sm transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Experience Section with Improved UI */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-lg font-semibold mb-3 text-gray-700">
                  Work Experience
                </h3>

                {/* Experience List */}
                {profile.experience &&
                  JSON.parse(profile.experience || '[]').map((exp, index) => (
                    <div
                      key={`exp-${index}`}
                      className="mb-4 p-4 border border-gray-200 rounded-md shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold text-blue-600">
                            {exp.title}
                          </h4>
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">{exp.company}</span> •{' '}
                            {exp.date}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const experiences = JSON.parse(
                              profile.experience || '[]'
                            );
                            experiences.splice(index, 1);
                            setProfile({
                              ...profile,
                              experience: JSON.stringify(experiences, null, 2),
                            });
                          }}
                          className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1 rounded-full"
                          aria-label="Remove experience"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M18 6L6 18M6 6l12 12"></path>
                          </svg>
                        </button>
                      </div>
                      <ul className="list-disc pl-5 space-y-1">
                        {exp.description &&
                          exp.description.map((desc, i) => (
                            <li
                              key={`desc-${index}-${i}`}
                              className="text-sm text-gray-600"
                            >
                              {desc}
                            </li>
                          ))}
                      </ul>
                    </div>
                  ))}

                {/* Add New Experience Form */}
                <div className="bg-gray-50 p-4 border border-gray-200 rounded-md">
                  <h4 className="font-medium text-gray-700 mb-3">
                    Add New Experience
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <Input
                      label="Company Name"
                      type="text"
                      value={newExperienceItem.company}
                      onChange={e =>
                        setNewExperienceItem({
                          ...newExperienceItem,
                          company: e.target.value,
                        })
                      }
                      placeholder="e.g., Acme Corporation"
                    />
                    <Input
                      label="Job Title"
                      type="text"
                      value={newExperienceItem.title}
                      onChange={e =>
                        setNewExperienceItem({
                          ...newExperienceItem,
                          title: e.target.value,
                        })
                      }
                      placeholder="e.g., Senior Developer"
                    />
                  </div>

                  <Input
                    label="Duration"
                    type="text"
                    value={newExperienceItem.date}
                    onChange={e =>
                      setNewExperienceItem({
                        ...newExperienceItem,
                        date: e.target.value,
                      })
                    }
                    placeholder="e.g., Jan 2020 - Present"
                    className="mb-3"
                  />

                  <div className="mb-3">
                    <Label.Root
                      htmlFor="description"
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      Responsibilities and Achievements
                    </Label.Root>
                    <Textarea
                      id="description"
                      rows={4}
                      value={newExperienceItem.description}
                      onChange={e =>
                        setNewExperienceItem({
                          ...newExperienceItem,
                          description: e.target.value,
                        })
                      }
                      placeholder="• Describe your responsibilities and achievements
• Enter each bullet point on a new line
• Focus on measurable accomplishments
• Use action verbs"
                      className="font-light"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Each line will be converted into a separate bullet point.
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          newExperienceItem.company &&
                          newExperienceItem.title
                        ) {
                          const experiences = profile.experience
                            ? JSON.parse(profile.experience)
                            : [];
                          experiences.push({
                            company: newExperienceItem.company,
                            title: newExperienceItem.title,
                            date: newExperienceItem.date,
                            description: newExperienceItem.description
                              .split('\n')
                              .filter(d => d.trim())
                              .map(d =>
                                d.trim().startsWith('•')
                                  ? d.substring(1).trim()
                                  : d.trim()
                              ),
                          });
                          setProfile({
                            ...profile,
                            experience: JSON.stringify(experiences, null, 2),
                          });
                          setNewExperienceItem({
                            company: '',
                            title: '',
                            date: '',
                            description: '',
                          });
                        }
                      }}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Add to Resume
                    </button>
                  </div>
                </div>
              </div>

              {/* Education Section */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-lg font-semibold mb-3 text-gray-700">
                  Education
                </h3>

                {profile.education &&
                  JSON.parse(profile.education || '[]').map((edu, index) => (
                    <div
                      key={`edu-${index}`}
                      className="mb-4 p-3 border border-gray-200 rounded-md shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between mb-2">
                        <div>
                          <h4 className="font-bold text-blue-600">
                            {edu.institution}
                          </h4>
                          <p className="text-sm text-gray-700">
                            {edu.degree} • {edu.date}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const educations = JSON.parse(
                              profile.education || '[]'
                            );
                            educations.splice(index, 1);
                            setProfile({
                              ...profile,
                              education: JSON.stringify(educations, null, 2),
                            });
                          }}
                          className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1 rounded-full"
                          aria-label="Remove education"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M18 6L6 18M6 6l12 12"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}

                <div className="bg-gray-50 p-4 border border-gray-200 rounded-md mb-4">
                  <h4 className="font-medium text-gray-700 mb-3">
                    Add Education
                  </h4>
                  <Input
                    label="Institution"
                    type="text"
                    value={newEducationItem.institution}
                    onChange={e =>
                      setNewEducationItem({
                        ...newEducationItem,
                        institution: e.target.value,
                      })
                    }
                    placeholder="e.g., University of Technology"
                    className="mb-3"
                  />
                  <Input
                    label="Degree"
                    type="text"
                    value={newEducationItem.degree}
                    onChange={e =>
                      setNewEducationItem({
                        ...newEducationItem,
                        degree: e.target.value,
                      })
                    }
                    placeholder="e.g., Bachelor of Science in Computer Science"
                    className="mb-3"
                  />
                  <Input
                    label="Date Range"
                    type="text"
                    value={newEducationItem.date}
                    onChange={e =>
                      setNewEducationItem({
                        ...newEducationItem,
                        date: e.target.value,
                      })
                    }
                    placeholder="e.g., 2018 - 2022"
                    className="mb-3"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          newEducationItem.institution &&
                          newEducationItem.degree
                        ) {
                          const educations = profile.education
                            ? JSON.parse(profile.education)
                            : [];
                          educations.push({
                            institution: newEducationItem.institution,
                            degree: newEducationItem.degree,
                            date: newEducationItem.date,
                          });
                          setProfile({
                            ...profile,
                            education: JSON.stringify(educations, null, 2),
                          });
                          setNewEducationItem({
                            institution: '',
                            degree: '',
                            date: '',
                          });
                        }
                      }}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Add Education
                    </button>
                  </div>
                </div>
              </div>

              {/* Additional Sections */}
              <div className="pt-4 border-t border-gray-200 space-y-4">
                <div>
                  <Textarea
                    label="Certifications (JSON format)"
                    id="certifications"
                    name="certifications"
                    rows={3}
                    value={profile.certifications}
                    onChange={handleProfileChange}
                    className="font-mono text-xs"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Enter certifications in JSON format.
                  </p>
                </div>

                <div>
                  <Textarea
                    label="Languages (JSON format)"
                    id="languages"
                    name="languages"
                    rows={3}
                    value={profile.languages}
                    onChange={handleProfileChange}
                    className="font-mono text-xs"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Enter languages and proficiency in JSON format.
                  </p>
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </Tabs.Content>

          <Tabs.Content value="json" className="bg-white p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Import Profile from JSON
            </h2>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Paste your JSON profile data below. The format should match the
                UserProfile interface or include personalInfo and workExperience
                objects.
              </p>
              <Textarea
                label="JSON Data"
                id="jsonInput"
                rows={15}
                value={jsonInput}
                onChange={handleJsonInputChange}
                className="font-mono text-xs"
              />
              {jsonError && (
                <p className="mt-2 text-sm text-red-500">{jsonError}</p>
              )}
            </div>
            <button
              type="button"
              onClick={importProfileFromJson}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Import Profile
            </button>
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </div>
  );
};

export default Options;
