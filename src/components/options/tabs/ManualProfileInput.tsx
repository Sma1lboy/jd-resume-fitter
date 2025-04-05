/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable no-alert */
import * as React from 'react';
import { X, Upload, FileText, Plus, PenSquare, Code } from 'lucide-react';
import {
  MotionDialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogFooter,
} from '@components/ui/dialog';
import JsonProfileImport from '../JsonProfileImport';
import PdfProfileImport from '../PdfProfileImport';
import { UserProfileForm } from '@/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  InputField,
  TextareaField,
  FormField,
} from '@/components/ui/form-field';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Simple Section and SectionHeader components
const Section: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="border-t border-gray-200 pt-6 mt-6">{children}</div>;
};

const SectionHeader: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="flex items-center justify-between mb-3">{children}</div>
  );
};

// Enhanced debounce function that includes a cancel method
const enhancedDebounce = <F extends (...args: any[]) => any>(
  func: F,
  wait: number
) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const debouncedFunc = (...args: Parameters<F>): void => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), wait);
  };

  // Add a cancel method to the function
  (debouncedFunc as any).cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return debouncedFunc as ((...args: Parameters<F>) => void) & {
    cancel: () => void;
  };
};

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
  onProfileBlur?: (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => Promise<void>;
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
  onProfileBlur,
}) => {
  // State for editing individual entries
  const [newSkill, setNewSkill] = React.useState<string>('');
  const [newCourse, setNewCourse] = React.useState<string>('');
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
    relevantCourses: '',
  });

  // Edit states
  const [editingExperienceIndex, setEditingExperienceIndex] = React.useState<
    number | null
  >(null);
  const [editingEducationIndex, setEditingEducationIndex] = React.useState<
    number | null
  >(null);

  // Modal states
  const [jsonModalOpen, setJsonModalOpen] = React.useState(false);
  const [pdfModalOpen, setPdfModalOpen] = React.useState(false);

  // State for showing JSON editor section
  const [showJsonEditor, setShowJsonEditor] = React.useState<boolean>(false);

  // Toggle JSON editor visibility
  const toggleJsonEditor = () => {
    setShowJsonEditor(!showJsonEditor);
  };

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
          onClick={() => setPdfModalOpen(true)}
          className="flex items-center bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 px-4 py-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <FileText className="h-4 w-4 mr-2" />
          Import from PDF
        </button>
        <button
          type="button"
          onClick={() => setJsonModalOpen(true)}
          className="flex items-center bg-primary-50 hover:bg-primary-100 text-primary-700 border border-primary-200 px-4 py-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <Upload className="h-4 w-4 mr-2" />
          Import from JSON
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
      <MotionDialog open={jsonModalOpen} onOpenChange={setJsonModalOpen}>
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
      <MotionDialog open={pdfModalOpen} onOpenChange={setPdfModalOpen}>
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
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Personal Information
          </h3>
        </div>

        <InputField
          label="Full Name"
          type="text"
          id="name"
          name="name"
          value={profile.name}
          onChange={onProfileChange}
          onBlur={onProfileBlur}
        />

        <InputField
          label="Professional Title"
          type="text"
          id="title"
          name="title"
          value={profile.title}
          onChange={onProfileChange}
          onBlur={onProfileBlur}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Email"
            type="email"
            id="email"
            name="email"
            value={profile.email}
            onChange={onProfileChange}
            onBlur={onProfileBlur}
          />

          <InputField
            label="Phone"
            type="tel"
            id="phone"
            name="phone"
            value={profile.phone}
            onChange={onProfileChange}
            onBlur={onProfileBlur}
          />
        </div>

        <InputField
          label="Location"
          type="text"
          id="location"
          name="location"
          value={profile.location}
          onChange={onProfileChange}
          onBlur={onProfileBlur}
          placeholder="City, State, Country"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="LinkedIn"
            type="text"
            id="linkedin"
            name="linkedin"
            value={profile.linkedin}
            onChange={onProfileChange}
            onBlur={onProfileBlur}
            placeholder="username (without URL)"
          />

          <InputField
            label="GitHub"
            type="text"
            id="github"
            name="github"
            value={profile.github}
            onChange={onProfileChange}
            onBlur={onProfileBlur}
            placeholder="username (without URL)"
          />
        </div>

        <InputField
          label="Website"
          type="text"
          id="website"
          name="website"
          value={profile.website}
          onChange={onProfileChange}
          onBlur={onProfileBlur}
          placeholder="yourwebsite.com (without http/https)"
        />

        <TextareaField
          label="Professional Summary"
          id="summary"
          name="summary"
          value={profile.summary}
          onChange={onProfileChange}
          onBlur={onProfileBlur}
          placeholder="A brief overview of your professional background, expertise, and career objectives"
          rows={4}
        />
      </div>

      {/* Education Section */}
      <div className="pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-gray-700">Education</h3>
          <button
            type="button"
            onClick={() => {
              setEditingEducationIndex(null);
              setNewEducationItem({
                institution: '',
                degree: '',
                date: '',
                relevantCourses: '',
              });

              // Add an empty item
              try {
                const educations = JSON.parse(profile.education || '[]');
                educations.push({
                  institution: '',
                  degree: '',
                  date: '',
                  relevantCourses: '',
                });

                const updatedProfile = {
                  ...profile,
                  education: JSON.stringify(educations, null, 2),
                };

                onProfileUpdate(updatedProfile);
                // Set editing index to the last item
                setEditingEducationIndex(educations.length - 1);
              } catch (error) {
                console.error('Error adding new education:', error);
                alert(
                  'Error adding new education. Please check the console for details.'
                );
                // Reset editing state on error
                setEditingEducationIndex(null);
              }
            }}
            disabled={
              editingExperienceIndex !== null || editingEducationIndex !== null
            }
            className={`flex items-center ${
              editingExperienceIndex !== null || editingEducationIndex !== null
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-primary-50 hover:bg-primary-100 text-primary-700'
            } border border-gray-200 px-3 py-1 rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500`}
          >
            <Plus className="size-4 mr-1" />
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
                    // Edit form
                    <div>
                      <h4 className="font-medium text-gray-700 mb-3">
                        Edit Education
                      </h4>
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
                      <TextareaField
                        label="Relevant Courses"
                        value={newEducationItem.relevantCourses}
                        onChange={e =>
                          setNewEducationItem({
                            ...newEducationItem,
                            relevantCourses: e.target.value,
                          })
                        }
                        placeholder="e.g., Data Structures, Algorithms, Machine Learning"
                        className="mb-3"
                        rows={2}
                      />
                      <div className="flex justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            // If it's a newly created empty item, remove it
                            try {
                              if (
                                newEducationItem.institution === '' &&
                                newEducationItem.degree === ''
                              ) {
                                const educations = JSON.parse(
                                  profile.education || '[]'
                                );
                                educations.splice(index, 1);
                                const updatedProfile = {
                                  ...profile,
                                  education: JSON.stringify(
                                    educations,
                                    null,
                                    2
                                  ),
                                };
                                onProfileUpdate(updatedProfile);
                              }
                            } catch (error) {
                              console.error(
                                'Error removing empty education item:',
                                error
                              );
                            }

                            setEditingEducationIndex(null);
                            setNewEducationItem({
                              institution: '',
                              degree: '',
                              date: '',
                              relevantCourses: '',
                            });
                          }}
                          className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (
                              newEducationItem.institution &&
                              newEducationItem.degree
                            ) {
                              try {
                                const educations = JSON.parse(
                                  profile.education || '[]'
                                );

                                const newEducation = {
                                  institution: newEducationItem.institution,
                                  degree: newEducationItem.degree,
                                  date: newEducationItem.date,
                                  relevantCourses:
                                    newEducationItem.relevantCourses,
                                };

                                educations[index] = newEducation;

                                const updatedProfile = {
                                  ...profile,
                                  education: JSON.stringify(
                                    educations,
                                    null,
                                    2
                                  ),
                                };

                                onProfileUpdate(updatedProfile);
                                setEditingEducationIndex(null);
                                setNewEducationItem({
                                  institution: '',
                                  degree: '',
                                  date: '',
                                  relevantCourses: '',
                                });
                              } catch (error) {
                                console.error(
                                  'Error updating education:',
                                  error
                                );
                                alert(
                                  'Error updating education. Please check the console for details.'
                                );
                                // Reset editing state on error
                                setEditingEducationIndex(null);
                              }
                            } else {
                              alert('Institution and degree are required.');
                            }
                          }}
                          className="bg-primary-500 hover:bg-primary-600 text-primary-foreground px-4 py-2 rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2"
                        >
                          Update Education
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Display mode
                    <>
                      <div className="flex justify-between mb-2">
                        <div>
                          <h4 className="font-bold text-primary">
                            {edu.institution}
                          </h4>
                          <p className="text-sm text-gray-700">
                            {edu.degree} • {edu.date}
                          </p>
                          {edu.relevantCourses && (
                            <p className="text-xs text-gray-600 mt-1">
                              <span className="font-medium">
                                Relevant Courses:
                              </span>{' '}
                              {edu.relevantCourses}
                            </p>
                          )}
                        </div>
                        <div className="flex space-x-1">
                          <button
                            type="button"
                            onClick={() => {
                              console.log('Editing education at index:', index);
                              setEditingEducationIndex(index);
                              setNewEducationItem({
                                institution: edu.institution || '',
                                degree: edu.degree || '',
                                date: edu.date || '',
                                relevantCourses: edu.relevantCourses || '',
                              });
                            }}
                            className="text-gray-400 hover:text-blue-500 hover:bg-blue-50 p-1 rounded-full"
                            aria-label="Edit education"
                          >
                            <PenSquare className="size-5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              try {
                                const eduArray = JSON.parse(
                                  profile.education || '[]'
                                );
                                eduArray.splice(index, 1);
                                const updatedProfile = {
                                  ...profile,
                                  education: JSON.stringify(eduArray, null, 2),
                                };
                                onProfileUpdate(updatedProfile);
                                // If editing the removed item, cancel editing
                                if (editingEducationIndex === index) {
                                  setEditingEducationIndex(null);
                                }
                              } catch (error) {
                                console.error(
                                  'Error deleting education:',
                                  error
                                );
                                alert(
                                  'Error deleting education. Please check the console for details.'
                                );
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
              console.error('Error parsing education JSON:', error);
              return (
                <p className="text-red-500">
                  Error parsing education data. Please check the format.
                </p>
              );
            }
          })()}
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

              // Add an empty item
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
                // Set editing index to the last item
                setEditingExperienceIndex(experiences.length - 1);
              } catch (error) {
                console.error('Error adding new experience:', error);
                alert(
                  'Error adding new experience. Please check the console for details.'
                );
                // Reset editing state on error
                setEditingExperienceIndex(null);
              }
            }}
            disabled={
              editingExperienceIndex !== null || editingEducationIndex !== null
            }
            className={`flex items-center ${
              editingExperienceIndex !== null || editingEducationIndex !== null
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-primary-50 hover:bg-primary-100 text-primary-700'
            } border border-gray-200 px-3 py-1 rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500`}
          >
            <Plus className="size-4 mr-1" />
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
                    // Edit form
                    <div>
                      <h4 className="font-medium text-gray-700 mb-3">
                        Edit Experience
                      </h4>
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
                          Each line will be converted into a separate bullet
                          point.
                        </p>
                      </div>

                      <div className="flex justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            // If it's a newly created empty item, remove it
                            try {
                              if (
                                newExperienceItem.company === '' &&
                                newExperienceItem.title === ''
                              ) {
                                const experiences = JSON.parse(
                                  profile.experience || '[]'
                                );
                                experiences.splice(index, 1);
                                const updatedProfile = {
                                  ...profile,
                                  experience: JSON.stringify(
                                    experiences,
                                    null,
                                    2
                                  ),
                                };
                                onProfileUpdate(updatedProfile);
                              }
                            } catch (error) {
                              console.error(
                                'Error removing empty experience item:',
                                error
                              );
                            }

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
                            if (
                              newExperienceItem.company &&
                              newExperienceItem.title
                            ) {
                              try {
                                const experiences = JSON.parse(
                                  profile.experience || '[]'
                                );

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
                                  experience: JSON.stringify(
                                    experiences,
                                    null,
                                    2
                                  ),
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
                                console.error(
                                  'Error updating experience:',
                                  error
                                );
                                alert(
                                  'Error updating experience. Please check the console for details.'
                                );
                                // Reset editing state on error
                                setEditingExperienceIndex(null);
                              }
                            } else {
                              alert('Company name and job title are required.');
                            }
                          }}
                          className="bg-primary-500 hover:bg-primary-600 text-primary-foreground px-4 py-2 rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2"
                        >
                          Update Experience
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Display mode
                    <>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold text-primary">
                            {exp.title}
                          </h4>
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">{exp.company}</span> •{' '}
                            {exp.date}
                          </p>
                        </div>
                        <div className="flex space-x-1">
                          <button
                            type="button"
                            onClick={() => {
                              console.log(
                                'Editing experience at index:',
                                index
                              );
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
                            <PenSquare className="size-5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              try {
                                const expArray = JSON.parse(
                                  profile.experience || '[]'
                                );
                                expArray.splice(index, 1);
                                const updatedProfile = {
                                  ...profile,
                                  experience: JSON.stringify(expArray, null, 2),
                                };
                                onProfileUpdate(updatedProfile);
                                // If editing the removed item, cancel editing
                                if (editingExperienceIndex === index) {
                                  setEditingExperienceIndex(null);
                                }
                              } catch (error) {
                                console.error(
                                  'Error deleting experience:',
                                  error
                                );
                                alert(
                                  'Error deleting experience. Please check the console for details.'
                                );
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
              console.error('Error parsing experience JSON:', error);
              return (
                <p className="text-red-500">
                  Error parsing experience data. Please check the format.
                </p>
              );
            }
          })()}
      </div>

      {/* Skills Section */}
      <div className="pt-4 border-t border-gray-200">
        <Label
          htmlFor="skills"
          className="mb-2 block font-medium text-gray-700"
        >
          Skills
        </Label>
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

      {/* Courses Section */}
      <div className="pt-4 border-t border-gray-200">
        <Label
          htmlFor="courses"
          className="mb-2 block font-medium text-gray-700"
        >
          Relevant Courses
        </Label>
        <div className="flex flex-wrap gap-2 mb-3">
          {profile.courses
            ?.split(',')
            .filter(c => c.trim())
            .map((course, index) => (
              <div
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                className="bg-blue-100 text-gray-800 px-3 py-1 rounded-full flex items-center"
              >
                <span className="mr-2">{course.trim()}</span>
                <button
                  type="button"
                  onClick={() => {
                    const courses = profile.courses
                      ?.split(',')
                      .filter(c => c.trim());
                    courses.splice(index, 1);
                    const updatedProfile = {
                      ...profile,
                      courses: courses.join(', '),
                    };
                    onProfileUpdate(updatedProfile);
                  }}
                  className="text-red-400 hover:text-red-600 transition-colors"
                  aria-label={`Remove ${course.trim()} course`}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
        </div>
        <div className="flex">
          <Input
            type="text"
            id="newCourse"
            value={newCourse}
            onChange={e => setNewCourse(e.target.value)}
            placeholder="Add a course"
            className="mr-2"
          />
          <button
            type="button"
            onClick={() => {
              if (newCourse.trim()) {
                const courses = profile.courses
                  ? profile.courses.split(',').filter(c => c.trim())
                  : [];
                courses.push(newCourse.trim());
                const updatedProfile = {
                  ...profile,
                  courses: courses.join(', '),
                };
                onProfileUpdate(updatedProfile);
                setNewCourse('');
              }
            }}
            className="bg-primary-500 hover:bg-primary-600 text-primary-foreground px-4 py-2 rounded shadow-sm transition-colors"
          >
            Add
          </button>
        </div>
      </div>

      {/* Additional Sections */}
      <div className="pt-4 border-t border-gray-200 space-y-4">
        {/* 删除重复的certifications和languages */}
      </div>

      {/* Advanced JSON Fields Section */}
      <Section>
        <SectionHeader>
          <h3 className="text-lg font-semibold">
            Advanced Fields (JSON Format)
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleJsonEditor}
            className="ml-2"
          >
            {showJsonEditor ? (
              <>
                <X className="mr-2 h-4 w-4" />
                Hide JSON Editor
              </>
            ) : (
              <>
                <Code className="mr-2 h-4 w-4" />
                Show JSON Editor
              </>
            )}
          </Button>
        </SectionHeader>

        {showJsonEditor && (
          <>
            <div className="mb-4 rounded-lg border border-yellow-300 bg-yellow-50 p-3 text-sm text-gray-700">
              <p>
                The JSON editor below allows for advanced configuration of your
                profile data. Only use this if you understand JSON formatting.
              </p>
            </div>
            <div className="mb-4">
              <TextareaField
                label="Experience (JSON format)"
                id="experience"
                placeholder={`[
  {
    "company": "Company Name",
    "title": "Your Title",
    "date": "Employment Period",
    "description": ["Responsibility 1", "Achievement 2", "Task 3"]
  }
]`}
                value={profile?.experience ?? ''}
                onChange={onProfileChange}
                onBlur={onProfileBlur}
                className="font-mono text-xs"
              />
            </div>
            <div className="mb-4">
              <TextareaField
                label="Education (JSON format)"
                id="education"
                placeholder={`[
  {
    "institution": "University Name",
    "degree": "Degree Name",
    "date": "Study Period",
    "relevantCourses": "Course 1, Course 2, Course 3"
  }
]`}
                value={profile?.education ?? ''}
                onChange={onProfileChange}
                onBlur={onProfileBlur}
                className="font-mono text-xs"
              />
            </div>
            <div className="mb-4">
              <TextareaField
                label="Courses (JSON format)"
                id="courses"
                placeholder={`["Course 1", "Course 2", "Course 3"]`}
                value={profile?.courses ?? ''}
                onChange={onProfileChange}
                onBlur={onProfileBlur}
                className="font-mono text-xs"
              />
            </div>
            <div className="mb-4">
              <TextareaField
                label="Certifications (JSON format)"
                id="certifications"
                placeholder={`[
  {
    "name": "Certification Name",
    "issuer": "Issuing Organization",
    "date": "Issue Date",
    "link": "https://certification-url.com"
  }
]`}
                value={profile?.certifications ?? ''}
                onChange={onProfileChange}
                onBlur={onProfileBlur}
                className="font-mono text-xs"
              />
            </div>
            <div className="mb-4">
              <TextareaField
                label="Languages (JSON format)"
                id="languages"
                placeholder={`[
  {
    "name": "Language Name",
    "proficiency": "Proficiency Level"
  }
]`}
                value={profile?.languages ?? ''}
                onChange={onProfileChange}
                onBlur={onProfileBlur}
                className="font-mono text-xs"
              />
            </div>
          </>
        )}
      </Section>

      <TextareaField
        label="Skills"
        id="skills"
        name="skills"
        rows={3}
        value={profile.skills}
        onChange={onProfileChange}
        onBlur={onProfileBlur}
        placeholder="Comma-separated list of skills (e.g., JavaScript, React, Node.js)"
      />

      <TextareaField
        label="Courses"
        id="courses"
        name="courses"
        rows={3}
        value={profile.courses}
        onChange={onProfileChange}
        onBlur={onProfileBlur}
        placeholder="Comma-separated list of courses (e.g., Data Structures, Algorithms, Machine Learning)"
      />
    </form>
  );
};

export default ManualProfileInput;
