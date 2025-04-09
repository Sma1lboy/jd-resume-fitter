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
type ProjectItemType = {
  name: string;
  technologies?: string;
  dateRange?: string;
  description: DescriptionPoint[];
  weight?: number;
};

interface ProjectSectionProps {
  projectsJson: string; // Receive the JSON string
  onProfileUpdate: (updatedProfile: Partial<UserProfileForm>) => void;
}

const ProjectSection: React.FC<ProjectSectionProps> = ({
  projectsJson,
  onProfileUpdate,
}) => {
  const [editingIndex, setEditingIndex] = React.useState<number | null>(null);
  const [newItem, setNewItem] = React.useState<Omit<ProjectItemType, 'weight'>>(
    {
      // Exclude overall weight
      name: '',
      technologies: '',
      dateRange: '',
      description: [],
    }
  );

  const parseProjects = (): ProjectItemType[] => {
    try {
      const parsed = JSON.parse(projectsJson || '[]');
      return Array.isArray(parsed)
        ? parsed.map(proj => ({
            ...proj,
            description: Array.isArray(proj.description)
              ? proj.description.map(d => ({
                  text: d?.text || '',
                  weight: d?.weight,
                }))
              : [],
          }))
        : [];
    } catch (error) {
      console.error('Error parsing projects JSON:', error);
      return [];
    }
  };

  const projects = parseProjects();

  const handleUpdate = (
    index: number,
    updatedItemData: Omit<ProjectItemType, 'weight'>
  ) => {
    const updatedProjects = [...projects];
    updatedProjects[index] = {
      ...updatedItemData,
      description: updatedItemData.description.filter(d => d.text.trim()),
      weight: updatedProjects[index]?.weight,
    };
    onProfileUpdate({ projects: JSON.stringify(updatedProjects, null, 2) });
    setEditingIndex(null);
  };

  const handleAdd = () => {
    const updatedProjects = [
      ...projects,
      { name: '', technologies: '', dateRange: '', description: [], weight: 1 },
    ];
    onProfileUpdate({ projects: JSON.stringify(updatedProjects, null, 2) });
    setNewItem({ name: '', technologies: '', dateRange: '', description: [] });
    setEditingIndex(updatedProjects.length - 1);
  };

  const handleDelete = (index: number) => {
    const updatedProjects = projects.filter((_, i) => i !== index);
    onProfileUpdate({ projects: JSON.stringify(updatedProjects, null, 2) });
    if (editingIndex === index) setEditingIndex(null);
  };

  const handleCancelEdit = (index: number) => {
    if (newItem.name === '') {
      const item = projects[index];
      if (item && item.name === '') handleDelete(index);
    }
    setEditingIndex(null);
  };

  const startEditing = (index: number, item: ProjectItemType) => {
    setEditingIndex(index);
    setNewItem({
      name: item.name || '',
      technologies: item.technologies || '',
      dateRange: item.dateRange || '',
      description: Array.isArray(item.description)
        ? item.description.map(d => ({
            text: d?.text || '',
            weight: d?.weight,
          }))
        : [],
    });
  };

  // Handlers for description points (same as ExperienceSection)
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
  const handleAddDescPoint = () =>
    setNewItem(prev => ({
      ...prev,
      description: [...prev.description, { text: '', weight: undefined }],
    }));
  const handleRemoveDescPoint = (descIndex: number) =>
    setNewItem(prev => ({
      ...prev,
      description: prev.description.filter((_, idx) => idx !== descIndex),
    }));

  return (
    <div className="pt-4 border-t border-gray-200">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-gray-700">
          Project Experience
        </h3>
        <Button
          type="button"
          onClick={handleAdd}
          disabled={editingIndex !== null}
          className={`flex items-center px-3 py-1 rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${editingIndex !== null ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-primary-50 hover:bg-primary-100 text-primary-700 border border-gray-200'}`}
        >
          <Plus className="size-4 mr-1" /> Add Project
        </Button>
      </div>

      {projects.map((proj, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <div
          key={`proj-${index}`}
          className="mb-4 p-4 border border-gray-200 rounded-md shadow-sm hover:shadow-md transition-shadow"
        >
          {editingIndex === index ? (
            <div>
              <h4 className="font-medium mb-3">Edit Project</h4>
              <InputField
                label="Name"
                value={newItem.name}
                onChange={e =>
                  setNewItem(prev => ({ ...prev, name: e.target.value }))
                }
              />
              <InputField
                label="Technologies"
                value={newItem.technologies || ''}
                onChange={e =>
                  setNewItem(prev => ({
                    ...prev,
                    technologies: e.target.value,
                  }))
                }
              />
              <InputField
                label="Date Range"
                value={newItem.dateRange || ''}
                onChange={e =>
                  setNewItem(prev => ({ ...prev, dateRange: e.target.value }))
                }
                className="mb-3"
              />

              {/* Description Points Editor */}
              <div className="mb-3">
                <Label className="text-sm font-medium mb-1 block">
                  Description
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
                    if (newItem.name) {
                      handleUpdate(index, newItem);
                    } else {
                      // eslint-disable-next-line no-alert
                      alert('Project Name required.');
                    }
                  }}
                >
                  Update Project
                </Button>
              </div>
            </div>
          ) : (
            // Display mode
            <>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold text-primary">{proj.name}</h4>
                  {proj.dateRange && (
                    <p className="text-sm text-gray-500">{proj.dateRange}</p>
                  )}
                  {proj.technologies && (
                    <p className="text-xs mt-1">Tech: {proj.technologies}</p>
                  )}
                </div>
                <div className="flex space-x-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-blue-500 hover:bg-blue-50 p-1 rounded-full"
                    onClick={() => startEditing(index, proj)}
                    aria-label="Edit project"
                  >
                    <PenSquare className="size-5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1 rounded-full"
                    onClick={() => handleDelete(index)}
                    aria-label="Remove project"
                  >
                    <X size={20} />
                  </Button>
                </div>
              </div>
              {/* Render description as list with bullet points */}
              <ul className="space-y-1 mt-2 pl-1">
                {proj.description.map((descPoint, i) => (
                  <li
                    key={`proj-desc-${index}-${i}`}
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
      {projects.length === 0 && editingIndex === null && (
        <p className="text-sm text-gray-500">No project experience added.</p>
      )}
    </div>
  );
};

export default ProjectSection;
