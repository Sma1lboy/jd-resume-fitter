/* eslint-disable react/no-array-index-key */
import React from 'react';
import { X, Plus, PenSquare } from 'lucide-react';
import { UserProfileForm } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputField } from '@/components/ui/form-field';

// Re-define types locally or import if shared
type DescriptionPoint = { text: string; weight?: number };
type ExperienceItemType = {
  company: string;
  title: string;
  date: string;
  description: DescriptionPoint[];
  weight?: number;
};

interface ExperienceSectionProps {
  experienceJson: string; // Receive the JSON string
  onProfileUpdate: (updatedProfile: Partial<UserProfileForm>) => void;
}

const ExperienceSection: React.FC<ExperienceSectionProps> = ({
  experienceJson,
  onProfileUpdate,
}) => {
  const [editingIndex, setEditingIndex] = React.useState<number | null>(null);
  const [newItem, setNewItem] = React.useState<
    Omit<ExperienceItemType, 'weight'>
  >({
    // Exclude overall weight from local edit state
    company: '',
    title: '',
    date: '',
    description: [],
  });

  const parseExperiences = (): ExperienceItemType[] => {
    try {
      const parsed = JSON.parse(experienceJson || '[]');
      return Array.isArray(parsed)
        ? parsed.map(exp => ({
            ...exp,
            description: Array.isArray(exp.description)
              ? exp.description.map(d => ({
                  text: d?.text || '',
                  weight: d?.weight,
                }))
              : [], // Ensure description structure
          }))
        : [];
    } catch (error) {
      console.error('Error parsing experience JSON:', error);
      return [];
    }
  };

  const experiences = parseExperiences();

  const handleUpdate = (
    index: number,
    updatedItemData: Omit<ExperienceItemType, 'weight'>
  ) => {
    const updatedExperiences = [...experiences];
    // Preserve original overall weight when updating
    updatedExperiences[index] = {
      ...updatedItemData,
      description: updatedItemData.description.filter(d => d.text.trim()), // Filter empty points on save
      weight: updatedExperiences[index]?.weight, // Keep original weight
    };
    onProfileUpdate({
      experience: JSON.stringify(updatedExperiences, null, 2),
    });
    setEditingIndex(null);
  };

  const handleAdd = () => {
    const updatedExperiences = [
      ...experiences,
      { company: '', title: '', date: '', description: [], weight: 1 },
    ]; // Add with default weight 1
    onProfileUpdate({
      experience: JSON.stringify(updatedExperiences, null, 2),
    });
    setNewItem({ company: '', title: '', date: '', description: [] });
    setEditingIndex(updatedExperiences.length - 1);
  };

  const handleDelete = (index: number) => {
    const updatedExperiences = experiences.filter((_, i) => i !== index);
    onProfileUpdate({
      experience: JSON.stringify(updatedExperiences, null, 2),
    });
    if (editingIndex === index) {
      setEditingIndex(null);
    }
  };

  const handleCancelEdit = (index: number) => {
    if (newItem.company === '' && newItem.title === '') {
      const item = experiences[index];
      if (item && item.company === '' && item.title === '') {
        handleDelete(index);
      }
    }
    setEditingIndex(null);
  };

  const startEditing = (index: number, item: ExperienceItemType) => {
    setEditingIndex(index);
    setNewItem({
      // Load item data into edit state, ensure description points are parsed correctly
      company: item.company || '',
      title: item.title || '',
      date: item.date || '',
      description: Array.isArray(item.description)
        ? item.description.map(d => ({
            text: d?.text || '',
            weight: d?.weight,
          }))
        : [],
    });
  };

  // Handlers for editing description points within newItem state
  const handleDescChange = (
    descIndex: number,
    field: 'text' | 'weight',
    value: string | number | undefined
  ) => {
    const updatedDesc = newItem.description.map((item, idx) => {
      if (idx === descIndex) {
        if (field === 'weight') {
          const numValue =
            typeof value === 'string' ? parseInt(value, 10) : value;
          return {
            ...item,
            weight: Number.isNaN(numValue) ? undefined : numValue,
          };
        }
        // Ensure value is string when field is 'text'
        return { ...item, [field]: String(value ?? '') };
      }
      return item;
    });
    setNewItem(prev => ({ ...prev, description: updatedDesc }));
  };

  const handleAddDescPoint = () => {
    setNewItem(prev => ({
      ...prev,
      description: [...prev.description, { text: '', weight: undefined }],
    }));
  };

  const handleRemoveDescPoint = (descIndex: number) => {
    const updatedDesc = newItem.description.filter(
      (_, idx) => idx !== descIndex
    );
    setNewItem(prev => ({ ...prev, description: updatedDesc }));
  };

  return (
    <div className="pt-4 border-t border-gray-200">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-gray-700">Work Experience</h3>
        <Button
          type="button"
          onClick={handleAdd}
          disabled={editingIndex !== null}
          className={`flex items-center px-3 py-1 rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${editingIndex !== null ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-primary-50 hover:bg-primary-100 text-primary-700 border border-gray-200'}`}
        >
          <Plus className="size-4 mr-1" /> Add Experience
        </Button>
      </div>

      {experiences.map((exp, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <div
          key={`exp-${index}`}
          className="mb-4 p-4 border border-gray-200 rounded-md shadow-sm hover:shadow-md transition-shadow"
        >
          {editingIndex === index ? (
            // Edit form
            <div>
              <h4 className="font-medium mb-3">Edit Experience</h4>
              <InputField
                label="Company"
                value={newItem.company}
                onChange={e =>
                  setNewItem(prev => ({ ...prev, company: e.target.value }))
                }
              />
              <InputField
                label="Title"
                value={newItem.title}
                onChange={e =>
                  setNewItem(prev => ({ ...prev, title: e.target.value }))
                }
              />
              <InputField
                label="Date"
                value={newItem.date}
                onChange={e =>
                  setNewItem(prev => ({ ...prev, date: e.target.value }))
                }
                className="mb-3"
              />

              {/* Description Points Editor */}
              <div className="mb-3">
                <Label className="text-sm font-medium mb-1 block">
                  Responsibilities/Achievements
                </Label>
                {newItem.description.map((descPoint, descIndex) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <div
                    key={descIndex}
                    className="flex items-center space-x-2 mb-2"
                  >
                    <Input
                      type="text"
                      value={descPoint.text}
                      placeholder="Enter point"
                      className="flex-grow"
                      onChange={e =>
                        handleDescChange(descIndex, 'text', e.target.value)
                      }
                    />
                    <Input
                      type="number"
                      value={descPoint.weight ?? ''}
                      placeholder="Wt"
                      className="w-16 text-center"
                      min="0"
                      onChange={e =>
                        handleDescChange(descIndex, 'weight', e.target.value)
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-red-500"
                      onClick={() => handleRemoveDescPoint(descIndex)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-1"
                  onClick={handleAddDescPoint}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Point
                </Button>
              </div>

              <div className="flex justify-end space-x-2">
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
                    if (newItem.company && newItem.title) {
                      handleUpdate(index, newItem);
                    } else {
                      // eslint-disable-next-line no-alert
                      alert('Company and Title required.');
                    }
                  }}
                >
                  Update Experience
                </Button>
              </div>
            </div>
          ) : (
            // Display mode
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
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-blue-500 hover:bg-blue-50 p-1 rounded-full"
                    onClick={() => startEditing(index, exp)}
                    aria-label="Edit experience"
                  >
                    <PenSquare className="size-5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1 rounded-full"
                    onClick={() => handleDelete(index)}
                    aria-label="Remove experience"
                  >
                    <X size={20} />
                  </Button>
                </div>
              </div>
              <ul className="space-y-1 mt-2 pl-1">
                {exp.description.map((descPoint, i) => (
                  <li
                    key={`exp-desc-${index}-${i}`}
                    className="text-sm text-gray-600 flex items-start leading-relaxed"
                  >
                    <span className="mr-2 text-primary font-semibold">•</span>
                    <span className="flex-1">{descPoint.text}</span>
                    {descPoint.weight !== undefined && (
                      <span className="ml-3 text-xs font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md">
                        Wt: {descPoint.weight}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      ))}
      {experiences.length === 0 && editingIndex === null && (
        <p className="text-sm text-gray-500">No work experience added.</p>
      )}
    </div>
  );
};

export default ExperienceSection;
