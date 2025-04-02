import * as React from 'react';
import * as Label from '@radix-ui/react-label';
import { UserProfile } from '@utils/aiWorkflow';
import { Input } from '@components/ui/input';
import { Textarea } from '@components/ui/textarea';
import { InputField, TextareaField } from '@components/ui/form-field';
import { X } from 'lucide-react';

// Define the form profile type (strings for form fields)
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
  experience: string;
  education: string;
  certifications: string;
  languages: string;
}

interface ManualProfileInputProps {
  profile: UserProfileForm;
  onProfileChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onProfileUpdate: (updatedProfile: UserProfileForm) => void;
  onSave: () => void;
}

const ManualProfileInput: React.FC<ManualProfileInputProps> = ({
  profile,
  onProfileChange,
  onProfileUpdate,
  onSave,
}) => {
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

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        onSave();
      }}
      className="space-y-6"
    >
      {/* Personal Information Section */}
      <div className="space-y-4">
        <InputField
          label="Full Name"
          type="text"
          id="name"
          name="name"
          value={profile.name}
          onChange={onProfileChange}
        />

        <InputField
          label="Professional Title"
          type="text"
          id="title"
          name="title"
          value={profile.title}
          onChange={onProfileChange}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Email"
            type="email"
            id="email"
            name="email"
            value={profile.email}
            onChange={onProfileChange}
          />

          <InputField
            label="Phone"
            type="text"
            id="phone"
            name="phone"
            value={profile.phone}
            onChange={onProfileChange}
          />
        </div>

        <InputField
          label="Location"
          type="text"
          id="location"
          name="location"
          value={profile.location}
          onChange={onProfileChange}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="LinkedIn"
            type="text"
            id="linkedin"
            name="linkedin"
            value={profile.linkedin}
            onChange={onProfileChange}
          />

          <InputField
            label="GitHub"
            type="text"
            id="github"
            name="github"
            value={profile.github}
            onChange={onProfileChange}
          />
        </div>

        <InputField
          label="Website"
          type="text"
          id="website"
          name="website"
          value={profile.website}
          onChange={onProfileChange}
        />

        <TextareaField
          label="Professional Summary"
          id="summary"
          name="summary"
          rows={3}
          value={profile.summary}
          onChange={onProfileChange}
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
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                className="bg-amber-100 text-gray-800 px-3 py-1 rounded-full flex items-center"
              >
                <span className="mr-2">{skill.trim()}</span>
                <button
                  type="button"
                  onClick={() => {
                    const skills = profile.skills
                      .split(',')
                      .filter(s => s.trim());
                    skills.splice(index, 1);
                    const updatedProfile = {
                      ...profile,
                      skills: skills.join(', '),
                    };
                    onProfileUpdate(updatedProfile);
                  }}
                  className="text-red-400 hover:text-red-600 transition-colors"
                  aria-label={`Remove ${skill.trim()} skill`}
                >
                  <X size={16} />
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
                const updatedProfile = {
                  ...profile,
                  skills: skills.join(', '),
                };
                onProfileUpdate(updatedProfile);
                setNewSkill('');
              }
            }}
            className="bg-primary-500 hover:bg-primary-600 text-primary-foreground px-4 py-2 rounded shadow-sm transition-colors"
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
              // eslint-disable-next-line react/no-array-index-key
              key={`exp-${index}`}
              className="mb-4 p-4 border border-gray-200 rounded-md shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold text-primary">{exp.title}</h4>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">{exp.company}</span> •{' '}
                    {exp.date}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const experiences = JSON.parse(profile.experience || '[]');
                    experiences.splice(index, 1);
                    const updatedProfile = {
                      ...profile,
                      experience: JSON.stringify(experiences, null, 2),
                    };
                    onProfileUpdate(updatedProfile);
                  }}
                  className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1 rounded-full"
                  aria-label="Remove experience"
                >
                  <X size={20} />
                </button>
              </div>
              <ul className="list-disc pl-5 space-y-1">
                {exp.description &&
                  exp.description.map((desc, i) => (
                    <li
                      // eslint-disable-next-line react/no-array-index-key
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
          <h4 className="font-medium text-gray-700 mb-3">Add New Experience</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            <InputField
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
            <InputField
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

          <InputField
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
            <TextareaField
              label="Responsibilities and Achievements"
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
                if (newExperienceItem.company && newExperienceItem.title) {
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
                  const updatedProfile = {
                    ...profile,
                    experience: JSON.stringify(experiences, null, 2),
                  };
                  onProfileUpdate(updatedProfile);
                  setNewExperienceItem({
                    company: '',
                    title: '',
                    date: '',
                    description: '',
                  });
                }
              }}
              className="bg-primary-500 hover:bg-primary-600 text-primary-foreground px-4 py-2 rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2"
            >
              Add to Resume
            </button>
          </div>
        </div>
      </div>

      {/* Education Section */}
      <div className="pt-4 border-t border-gray-200">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">Education</h3>

        {profile.education &&
          JSON.parse(profile.education || '[]').map((edu, index) => (
            <div
              // eslint-disable-next-line react/no-array-index-key
              key={`edu-${index}`}
              className="mb-4 p-3 border border-gray-200 rounded-md shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between mb-2">
                <div>
                  <h4 className="font-bold text-primary">{edu.institution}</h4>
                  <p className="text-sm text-gray-700">
                    {edu.degree} • {edu.date}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const educations = JSON.parse(profile.education || '[]');
                    educations.splice(index, 1);
                    const updatedProfile = {
                      ...profile,
                      education: JSON.stringify(educations, null, 2),
                    };
                    onProfileUpdate(updatedProfile);
                  }}
                  className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1 rounded-full"
                  aria-label="Remove education"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          ))}

        <div className="bg-gray-50 p-4 border border-gray-200 rounded-md mb-4">
          <h4 className="font-medium text-gray-700 mb-3">Add Education</h4>
          <InputField
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
          <InputField
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
          <InputField
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
                if (newEducationItem.institution && newEducationItem.degree) {
                  const educations = profile.education
                    ? JSON.parse(profile.education)
                    : [];
                  educations.push({
                    institution: newEducationItem.institution,
                    degree: newEducationItem.degree,
                    date: newEducationItem.date,
                  });
                  const updatedProfile = {
                    ...profile,
                    education: JSON.stringify(educations, null, 2),
                  };
                  onProfileUpdate(updatedProfile);
                  setNewEducationItem({
                    institution: '',
                    degree: '',
                    date: '',
                  });
                }
              }}
              className="bg-primary-500 hover:bg-primary-600 text-primary-foreground px-4 py-2 rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2"
            >
              Add Education
            </button>
          </div>
        </div>
      </div>

      {/* Additional Sections */}
      <div className="pt-4 border-t border-gray-200 space-y-4">
        <div>
          <TextareaField
            label="Certifications (JSON format)"
            id="certifications"
            name="certifications"
            rows={3}
            value={profile.certifications}
            onChange={onProfileChange}
            className="font-mono text-xs"
          />
          <p className="mt-1 text-xs text-gray-500">
            Enter certifications in JSON format.
          </p>
        </div>

        <div>
          <TextareaField
            label="Languages (JSON format)"
            id="languages"
            name="languages"
            rows={3}
            value={profile.languages}
            onChange={onProfileChange}
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
          className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Save Profile
        </button>
      </div>
    </form>
  );
};

export default ManualProfileInput;
