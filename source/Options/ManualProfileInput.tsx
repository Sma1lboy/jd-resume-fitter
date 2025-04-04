import * as React from 'react';
import * as Label from '@radix-ui/react-label';
import { Input } from '@components/ui/input';
import { Textarea } from '@components/ui/textarea';
import { InputField, TextareaField } from '@components/ui/form-field';
import { X, Upload, FileText } from 'lucide-react';
import { MotionDialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from '@components/ui/dialog';
import JsonProfileImport from './JsonProfileImport';
import PdfProfileImport from './PdfProfileImport';

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
  onReset: () => void;
  jsonInput?: string;
  jsonError?: string;
  onJsonInputChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onImportProfile?: () => void;
}

const ManualProfileInput: React.FC<ManualProfileInputProps> = ({
  profile,
  onProfileChange,
  onProfileUpdate,
  onSave,
  onReset,
  jsonInput = '',
  jsonError = '',
  onJsonInputChange = () => {},
  onImportProfile = () => {},
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
  
  // Edit states
  const [editingExperienceIndex, setEditingExperienceIndex] = React.useState<number | null>(null);
  const [editingEducationIndex, setEditingEducationIndex] = React.useState<number | null>(null);
  
  // Modal states
  const [jsonModalOpen, setJsonModalOpen] = React.useState(false);
  const [pdfModalOpen, setPdfModalOpen] = React.useState(false);

  // Handle JSON import with modal closing
  const handleJsonImport = () => {
    onImportProfile();
    setJsonModalOpen(false);
  };

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        onSave();
      }}
      className="space-y-6"
    >
      {/* Import Options */}
      <div className="flex gap-4 mb-6">
        <button
          type="button"
          onClick={() => setJsonModalOpen(true)}
          className="flex items-center bg-primary-50 hover:bg-primary-100 text-primary-700 border border-primary-200 px-4 py-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <Upload className="h-4 w-4 mr-2" />
          Import from JSON
        </button>
        <button
          type="button"
          onClick={() => setPdfModalOpen(true)}
          className="flex items-center bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 px-4 py-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <FileText className="h-4 w-4 mr-2" />
          Import from PDF
        </button>
        
        <div className="ml-auto flex gap-2">
          <button
            type="button"
            onClick={onReset}
            className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-4 py-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Reset Profile
          </button>
          <button
            type="submit"
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            Save Profile
          </button>
        </div>
      </div>

      {/* JSON Import Modal */}
      <MotionDialog
        open={jsonModalOpen}
        onOpenChange={setJsonModalOpen}
      >
        <DialogHeader>
          <DialogTitle>Import Profile from JSON</DialogTitle>
        </DialogHeader>
        <JsonProfileImport
          jsonInput={jsonInput}
          jsonError={jsonError}
          onJsonInputChange={onJsonInputChange}
          onImportProfile={handleJsonImport}
        />
      </MotionDialog>

      {/* PDF Import Modal */}
      <MotionDialog
        open={pdfModalOpen}
        onOpenChange={setPdfModalOpen}
      >
        <DialogHeader>
          <DialogTitle>Import Profile from PDF</DialogTitle>
        </DialogHeader>
        <PdfProfileImport 
          onClose={() => setPdfModalOpen(false)} 
          onProfileUpdate={onProfileUpdate}
        />
      </MotionDialog>

      <div className="border-t border-gray-200 pt-6" />
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
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-gray-700">
            Work Experience
          </h3>
          <button
            type="button"
            onClick={() => {
              setEditingExperienceIndex(null);
              setNewExperienceItem({
                company: '',
                title: '',
                date: '',
                description: '',
              });
              
              // 添加一个空白条目
              try {
                const experiences = JSON.parse(profile.experience || '[]');
                experiences.push({
                  company: '',
                  title: '',
                  date: '',
                  description: [],
                });
                
                const updatedProfile = {
                  ...profile,
                  experience: JSON.stringify(experiences, null, 2),
                };
                
                onProfileUpdate(updatedProfile);
                // 设置编辑索引为最后一个项目
                setEditingExperienceIndex(experiences.length - 1);
              } catch (error) {
                console.error("Error adding new experience:", error);
                alert("Error adding new experience. Please check the console for details.");
                // 确保在错误时重置编辑状态
                setEditingExperienceIndex(null);
              }
            }}
            disabled={editingExperienceIndex !== null || editingEducationIndex !== null}
            className={`flex items-center ${
              editingExperienceIndex !== null || editingEducationIndex !== null
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-primary-50 hover:bg-primary-100 text-primary-700'
            } border border-gray-200 px-3 py-1 rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add Experience
          </button>
        </div>

        {/* Experience List */}
        {profile.experience &&
          (() => {
            try {
              const experiences = JSON.parse(profile.experience || '[]');
              return experiences.map((exp, index) => (
                <div
                  // eslint-disable-next-line react/no-array-index-key
                  key={`exp-${index}`}
                  className="mb-4 p-4 border border-gray-200 rounded-md shadow-sm hover:shadow-md transition-shadow"
                >
                  {editingExperienceIndex === index ? (
                    // 编辑表单
                    <div>
                      <h4 className="font-medium text-gray-700 mb-3">Edit Experience</h4>
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
                          id={`description-edit-${index}`}
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
                      
                      <div className="flex justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingExperienceIndex(null);
                            setNewExperienceItem({
                              company: '',
                              title: '',
                              date: '',
                              description: '',
                            });
                          }}
                          className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (newExperienceItem.company && newExperienceItem.title) {
                              try {
                                const experiences = JSON.parse(profile.experience || '[]');
                                
                                const newExperience = {
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
                                };
                                
                                experiences[index] = newExperience;
                                
                                const updatedProfile = {
                                  ...profile,
                                  experience: JSON.stringify(experiences, null, 2),
                                };
                                
                                onProfileUpdate(updatedProfile);
                                setEditingExperienceIndex(null);
                                setNewExperienceItem({
                                  company: '',
                                  title: '',
                                  date: '',
                                  description: '',
                                });
                              } catch (error) {
                                console.error("Error updating experience:", error);
                                alert("Error updating experience. Please check the console for details.");
                                // 确保在错误时重置编辑状态
                                setEditingExperienceIndex(null);
                              }
                            } else {
                              alert("Company name and job title are required.");
                            }
                          }}
                          className="bg-primary-500 hover:bg-primary-600 text-primary-foreground px-4 py-2 rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2"
                        >
                          Update Experience
                        </button>
                      </div>
                    </div>
                  ) : (
                    // 显示模式
                    <>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold text-primary">{exp.title}</h4>
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">{exp.company}</span> •{' '}
                            {exp.date}
                          </p>
                        </div>
                        <div className="flex space-x-1">
                          <button
                            type="button"
                            onClick={() => {
                              console.log("Editing experience at index:", index);
                              setEditingExperienceIndex(index);
                              setNewExperienceItem({
                                company: exp.company || '',
                                title: exp.title || '',
                                date: exp.date || '',
                                description: Array.isArray(exp.description) 
                                  ? exp.description.join('\n') 
                                  : '',
                              });
                            }}
                            className="text-gray-400 hover:text-blue-500 hover:bg-blue-50 p-1 rounded-full"
                            aria-label="Edit experience"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              try {
                                const expArray = JSON.parse(profile.experience || '[]');
                                expArray.splice(index, 1);
                                const updatedProfile = {
                                  ...profile,
                                  experience: JSON.stringify(expArray, null, 2),
                                };
                                onProfileUpdate(updatedProfile);
                                // 如果正在编辑被删除的条目，取消编辑
                                if (editingExperienceIndex === index) {
                                  setEditingExperienceIndex(null);
                                }
                              } catch (error) {
                                console.error("Error deleting experience:", error);
                                alert("Error deleting experience. Please check the console for details.");
                              }
                            }}
                            className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1 rounded-full"
                            aria-label="Remove experience"
                          >
                            <X size={20} />
                          </button>
                        </div>
                      </div>
                      <ul className="list-disc pl-5 space-y-1">
                        {Array.isArray(exp.description) &&
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
                    </>
                  )}
                </div>
              ));
            } catch (error) {
              console.error("Error parsing experience JSON:", error);
              return <p className="text-red-500">Error parsing experience data. Please check the format.</p>;
            }
          })()}
      </div>

      {/* Education Section */}
      <div className="pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-gray-700">
            Education
          </h3>
          <button
            type="button"
            onClick={() => {
              setEditingEducationIndex(null);
              setNewEducationItem({
                institution: '',
                degree: '',
                date: '',
              });
              
              // 添加一个空白条目
              try {
                const educations = JSON.parse(profile.education || '[]');
                educations.push({
                  institution: '',
                  degree: '',
                  date: '',
                });
                
                const updatedProfile = {
                  ...profile,
                  education: JSON.stringify(educations, null, 2),
                };
                
                onProfileUpdate(updatedProfile);
                // 设置编辑索引为最后一个项目
                setEditingEducationIndex(educations.length - 1);
              } catch (error) {
                console.error("Error adding new education:", error);
                alert("Error adding new education. Please check the console for details.");
                // 确保在错误时重置编辑状态
                setEditingEducationIndex(null);
              }
            }}
            disabled={editingExperienceIndex !== null || editingEducationIndex !== null}
            className={`flex items-center ${
              editingExperienceIndex !== null || editingEducationIndex !== null
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-primary-50 hover:bg-primary-100 text-primary-700'
            } border border-gray-200 px-3 py-1 rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add Education
          </button>
        </div>

        {/* Education List */}
        {profile.education &&
          (() => {
            try {
              const educations = JSON.parse(profile.education || '[]');
              return educations.map((edu, index) => (
                <div
                  // eslint-disable-next-line react/no-array-index-key
                  key={`edu-${index}`}
                  className="mb-4 p-3 border border-gray-200 rounded-md shadow-sm hover:shadow-md transition-shadow"
                >
                  {editingEducationIndex === index ? (
                    // 编辑表单
                    <div>
                      <h4 className="font-medium text-gray-700 mb-3">Edit Education</h4>
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
                      <div className="flex justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingEducationIndex(null);
                            setNewEducationItem({
                              institution: '',
                              degree: '',
                              date: '',
                            });
                          }}
                          className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (newEducationItem.institution && newEducationItem.degree) {
                              try {
                                const educations = JSON.parse(profile.education || '[]');
                                
                                const newEducation = {
                                  institution: newEducationItem.institution,
                                  degree: newEducationItem.degree,
                                  date: newEducationItem.date,
                                };
                                
                                educations[index] = newEducation;
                                
                                const updatedProfile = {
                                  ...profile,
                                  education: JSON.stringify(educations, null, 2),
                                };
                                
                                onProfileUpdate(updatedProfile);
                                setEditingEducationIndex(null);
                                setNewEducationItem({
                                  institution: '',
                                  degree: '',
                                  date: '',
                                });
                              } catch (error) {
                                console.error("Error updating education:", error);
                                alert("Error updating education. Please check the console for details.");
                                // 确保在错误时重置编辑状态
                                setEditingEducationIndex(null);
                              }
                            } else {
                              alert("Institution and degree are required.");
                            }
                          }}
                          className="bg-primary-500 hover:bg-primary-600 text-primary-foreground px-4 py-2 rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2"
                        >
                          Update Education
                        </button>
                      </div>
                    </div>
                  ) : (
                    // 显示模式
                    <>
                      <div className="flex justify-between mb-2">
                        <div>
                          <h4 className="font-bold text-primary">{edu.institution}</h4>
                          <p className="text-sm text-gray-700">
                            {edu.degree} • {edu.date}
                          </p>
                        </div>
                        <div className="flex space-x-1">
                          <button
                            type="button"
                            onClick={() => {
                              console.log("Editing education at index:", index);
                              setEditingEducationIndex(index);
                              setNewEducationItem({
                                institution: edu.institution || '',
                                degree: edu.degree || '',
                                date: edu.date || '',
                              });
                            }}
                            className="text-gray-400 hover:text-blue-500 hover:bg-blue-50 p-1 rounded-full"
                            aria-label="Edit education"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              try {
                                const eduArray = JSON.parse(profile.education || '[]');
                                eduArray.splice(index, 1);
                                const updatedProfile = {
                                  ...profile,
                                  education: JSON.stringify(eduArray, null, 2),
                                };
                                onProfileUpdate(updatedProfile);
                                // 如果正在编辑被删除的条目，取消编辑
                                if (editingEducationIndex === index) {
                                  setEditingEducationIndex(null);
                                }
                              } catch (error) {
                                console.error("Error deleting education:", error);
                                alert("Error deleting education. Please check the console for details.");
                              }
                            }}
                            className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1 rounded-full"
                            aria-label="Remove education"
                          >
                            <X size={20} />
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ));
            } catch (error) {
              console.error("Error parsing education JSON:", error);
              return <p className="text-red-500">Error parsing education data. Please check the format.</p>;
            }
          })()}
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
    </form>
  );
};

export default ManualProfileInput;
