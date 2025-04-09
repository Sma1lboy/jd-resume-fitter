/* eslint-disable react/no-array-index-key */
import React from 'react';
import { X, Plus, PenSquare } from 'lucide-react';
import { UserProfileForm } from '@/types';
import { Button } from '@/components/ui/button';
import { InputField, TextareaField } from '@/components/ui/form-field';

type EducationItemType = {
  institution: string;
  degree: string;
  date: string;
  relevantCourses?: string;
};

interface EducationSectionProps {
  educationJson: string; // Receive the JSON string
  onProfileUpdate: (updatedProfile: Partial<UserProfileForm>) => void;
}

const EducationSection: React.FC<EducationSectionProps> = ({
  educationJson,
  onProfileUpdate,
}) => {
  const [editingIndex, setEditingIndex] = React.useState<number | null>(null);
  const [newItem, setNewItem] = React.useState<EducationItemType>({
    institution: '',
    degree: '',
    date: '',
    relevantCourses: '',
  });

  const parseEducation = (): EducationItemType[] => {
    try {
      const parsed = JSON.parse(educationJson || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Error parsing education JSON:', error);
      return [];
    }
  };

  const educations = parseEducation();

  const handleUpdate = (index: number, updatedItem: EducationItemType) => {
    const updatedEducations = [...educations];
    updatedEducations[index] = updatedItem;
    onProfileUpdate({ education: JSON.stringify(updatedEducations, null, 2) });
    setEditingIndex(null);
  };

  const handleAdd = () => {
    const updatedEducations = [
      ...educations,
      { institution: '', degree: '', date: '', relevantCourses: '' },
    ];
    onProfileUpdate({ education: JSON.stringify(updatedEducations, null, 2) });
    setNewItem({ institution: '', degree: '', date: '', relevantCourses: '' }); // Reset for new item
    setEditingIndex(updatedEducations.length - 1); // Start editing the new item
  };

  const handleDelete = (index: number) => {
    const updatedEducations = educations.filter((_, i) => i !== index);
    onProfileUpdate({ education: JSON.stringify(updatedEducations, null, 2) });
    if (editingIndex === index) {
      setEditingIndex(null); // Stop editing if the deleted item was being edited
    }
  };

  const handleCancelEdit = (index: number) => {
    // If it was a newly added item (likely empty), remove it on cancel
    if (
      newItem.institution === '' &&
      newItem.degree === '' &&
      newItem.date === '' &&
      (newItem.relevantCourses === '' || !newItem.relevantCourses)
    ) {
      const item = educations[index];
      if (
        item &&
        item.institution === '' &&
        item.degree === '' &&
        item.date === '' &&
        (item.relevantCourses === '' || !item.relevantCourses)
      ) {
        handleDelete(index);
      }
    }
    setEditingIndex(null);
  };

  const startEditing = (index: number, item: EducationItemType) => {
    setEditingIndex(index);
    setNewItem({ ...item }); // Load item data into edit state
  };

  return (
    <div className="pt-4 border-t border-gray-200">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-gray-700">Education</h3>
        <Button
          type="button"
          onClick={handleAdd}
          disabled={editingIndex !== null}
          className={`flex items-center px-3 py-1 rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${editingIndex !== null ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-primary-50 hover:bg-primary-100 text-primary-700 border border-gray-200'}`}
        >
          <Plus className="size-4 mr-1" /> Add Education
        </Button>
      </div>

      {educations.map((edu, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <div
          key={`edu-${index}`}
          className="mb-4 p-4 border border-gray-200 rounded-md shadow-sm hover:shadow-md transition-shadow"
        >
          {editingIndex === index ? (
            // Edit form
            <div>
              <h4 className="font-medium mb-3">Edit Education</h4>
              <InputField
                label="Institution"
                value={newItem.institution}
                onChange={e =>
                  setNewItem({ ...newItem, institution: e.target.value })
                }
              />
              <InputField
                label="Degree"
                value={newItem.degree}
                onChange={e =>
                  setNewItem({ ...newItem, degree: e.target.value })
                } /* ... */
              />
              <InputField
                label="Date Range"
                value={newItem.date}
                onChange={e => setNewItem({ ...newItem, date: e.target.value })}
              />
              <TextareaField
                label="Relevant Courses"
                value={newItem.relevantCourses || ''}
                onChange={e =>
                  setNewItem({ ...newItem, relevantCourses: e.target.value })
                }
              />
              <div className="flex justify-end space-x-2 mt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleCancelEdit(index)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    if (newItem.institution && newItem.degree) {
                      handleUpdate(index, newItem);
                    } else {
                      // eslint-disable-next-line no-alert
                      alert('Institution and Degree are required.');
                    }
                  }}
                >
                  Update Education
                </Button>
              </div>
            </div>
          ) : (
            // Display mode
            <>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold text-primary">{edu.institution}</h4>
                  <p className="text-sm text-gray-700">
                    {edu.degree} • {edu.date}
                  </p>
                  {edu.relevantCourses && (
                    <p className="text-xs mt-1">
                      Courses: {edu.relevantCourses}
                    </p>
                  )}
                </div>
                <div className="flex space-x-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-blue-500 hover:bg-blue-50 p-1 rounded-full"
                    onClick={() => startEditing(index, edu)}
                    aria-label="Edit education"
                  >
                    <PenSquare className="size-5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1 rounded-full"
                    onClick={() => handleDelete(index)}
                    aria-label="Remove education"
                  >
                    <X size={20} />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      ))}
      {educations.length === 0 && editingIndex === null && (
        <p className="text-sm text-gray-500">No education history added.</p>
      )}
    </div>
  );
};

export default EducationSection;
