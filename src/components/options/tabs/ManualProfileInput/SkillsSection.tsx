/* eslint-disable react/no-array-index-key */
import React from 'react';
import { X } from 'lucide-react';
import { UserProfileForm } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SkillsSectionProps {
  skillsString: string; // Comma-separated string
  onProfileUpdate: (updatedProfile: Partial<UserProfileForm>) => void;
}

const SkillsSection: React.FC<SkillsSectionProps> = ({
  skillsString,
  onProfileUpdate,
}) => {
  const [newSkill, setNewSkill] = React.useState<string>('');

  const skills =
    skillsString
      ?.split(',')
      .map(s => s.trim())
      .filter(Boolean) || [];

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      const updatedSkills = [...skills, newSkill.trim()];
      onProfileUpdate({ skills: updatedSkills.join(', ') });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (index: number) => {
    const updatedSkills = skills.filter((_, i) => i !== index);
    onProfileUpdate({ skills: updatedSkills.join(', ') });
  };

  return (
    <div className="pt-4 border-t border-gray-200">
      <Label
        htmlFor="newSkill"
        className="mb-2 block font-medium text-gray-700"
      >
        Skills
      </Label>
      <div className="flex flex-wrap gap-2 mb-3">
        {skills.map((skill, index) => (
          <div
            key={index}
            className="bg-amber-100 text-gray-800 px-3 py-1 rounded-full flex items-center"
          >
            <span className="mr-2">{skill}</span>
            <button
              type="button"
              onClick={() => handleRemoveSkill(index)}
              className="text-red-400 hover:text-red-600"
              aria-label={`Remove ${skill}`}
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
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddSkill();
            }
          }}
        />
        <Button type="button" onClick={handleAddSkill}>
          Add
        </Button>
      </div>
      {skills.length === 0 && (
        <p className="text-xs text-gray-500 mt-1">No skills added yet.</p>
      )}
    </div>
  );
};
export default SkillsSection;
