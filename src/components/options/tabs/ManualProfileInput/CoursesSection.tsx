/* eslint-disable react/no-array-index-key */
import React from 'react';
import { X } from 'lucide-react';
import { UserProfileForm } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CoursesSectionProps {
  coursesString: string; // Comma-separated string
  onProfileUpdate: (updatedProfile: Partial<UserProfileForm>) => void;
}

const CoursesSection: React.FC<CoursesSectionProps> = ({
  coursesString,
  onProfileUpdate,
}) => {
  const [newCourse, setNewCourse] = React.useState<string>('');

  const courses =
    coursesString
      ?.split(',')
      .map(c => c.trim())
      .filter(Boolean) || [];

  const handleAddCourse = () => {
    if (newCourse.trim() && !courses.includes(newCourse.trim())) {
      const updatedCourses = [...courses, newCourse.trim()];
      onProfileUpdate({ courses: updatedCourses.join(', ') });
      setNewCourse('');
    }
  };

  const handleRemoveCourse = (index: number) => {
    const updatedCourses = courses.filter((_, i) => i !== index);
    onProfileUpdate({ courses: updatedCourses.join(', ') });
  };

  return (
    <div className="pt-4 border-t border-gray-200">
      <Label
        htmlFor="newCourse"
        className="mb-2 block font-medium text-gray-700"
      >
        Relevant Courses
      </Label>
      <div className="flex flex-wrap gap-2 mb-3">
        {courses.map((course, index) => (
          <div
            key={index}
            className="bg-blue-100 text-gray-800 px-3 py-1 rounded-full flex items-center"
          >
            <span className="mr-2">{course}</span>
            <button
              type="button"
              onClick={() => handleRemoveCourse(index)}
              className="text-red-400 hover:text-red-600"
              aria-label={`Remove ${course}`}
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
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddCourse();
            }
          }}
        />
        <Button type="button" onClick={handleAddCourse}>
          Add
        </Button>
      </div>
      {courses.length === 0 && (
        <p className="text-xs text-gray-500 mt-1">No courses added yet.</p>
      )}
    </div>
  );
};

export default CoursesSection;
