import * as React from 'react';
import { browser } from 'webextension-polyfill-ts';
import { UserProfile } from '../utils/aiWorkflow';
import './styles.scss';

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

const Options: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<number>(0);
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

  const [resumeTemplate, setResumeTemplate] = React.useState<string>('');
  const [status, setStatus] = React.useState<string>('');

  // Load profile and template on component mount
  React.useEffect(() => {
    const loadData = async () => {
      await loadProfile();
      await loadTemplate();
    };
    loadData();
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

  // Load resume template from storage
  const loadTemplate = async (): Promise<void> => {
    try {
      const data = await browser.storage.local.get('resumeTemplate');
      if (data.resumeTemplate) {
        setResumeTemplate(data.resumeTemplate);
      }
    } catch (error) {
      console.error('Error loading template:', error);
      setStatus('Error loading template');
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

  // Save template to storage
  const saveTemplate = async (): Promise<void> => {
    try {
      await browser.storage.local.set({
        resumeTemplate,
      });

      setStatus('Template saved successfully!');
      setTimeout(() => setStatus(''), 3000);
    } catch (error) {
      console.error('Error saving template:', error);
      setStatus(
        `Error saving template: ${error instanceof Error ? error.message : 'Unknown error'}`
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

  // Handle template changes
  const handleTemplateChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ): void => {
    setResumeTemplate(e.target.value);
  };

  return (
    <div className="options-container">
      <h1>Resume Generator Settings</h1>

      {status && <div className="status-message">{status}</div>}

      <div className="tabs">
        <div className="tab-headers">
          <button
            type="button"
            className={`tab-header ${activeTab === 0 ? 'active' : ''}`}
            onClick={() => setActiveTab(0)}
          >
            Profile
          </button>
          <button
            type="button"
            className={`tab-header ${activeTab === 1 ? 'active' : ''}`}
            onClick={() => setActiveTab(1)}
          >
            Resume Template
          </button>
        </div>

        <div className="tab-content">
          <div className={`tab-panel ${activeTab === 0 ? 'active' : ''}`}>
            <h2>User Profile</h2>
            <form
              onSubmit={e => {
                e.preventDefault();
                saveProfile();
              }}
            >
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={profile.name}
                  onChange={handleProfileChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="title">Professional Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={profile.title}
                  onChange={handleProfileChange}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={profile.email}
                    onChange={handleProfileChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone</label>
                  <input
                    type="text"
                    id="phone"
                    name="phone"
                    value={profile.phone}
                    onChange={handleProfileChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="location">Location</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={profile.location}
                  onChange={handleProfileChange}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="linkedin">LinkedIn</label>
                  <input
                    type="text"
                    id="linkedin"
                    name="linkedin"
                    value={profile.linkedin}
                    onChange={handleProfileChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="github">GitHub</label>
                  <input
                    type="text"
                    id="github"
                    name="github"
                    value={profile.github}
                    onChange={handleProfileChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="website">Website</label>
                <input
                  type="text"
                  id="website"
                  name="website"
                  value={profile.website}
                  onChange={handleProfileChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="summary">Professional Summary</label>
                <textarea
                  id="summary"
                  name="summary"
                  rows={3}
                  value={profile.summary}
                  onChange={handleProfileChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="skills">Skills (comma-separated)</label>
                <textarea
                  id="skills"
                  name="skills"
                  rows={3}
                  value={profile.skills}
                  onChange={handleProfileChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="experience">Experience (JSON format)</label>
                <textarea
                  id="experience"
                  name="experience"
                  rows={6}
                  value={profile.experience}
                  onChange={handleProfileChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="education">Education (JSON format)</label>
                <textarea
                  id="education"
                  name="education"
                  rows={4}
                  value={profile.education}
                  onChange={handleProfileChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="certifications">
                  Certifications (JSON format)
                </label>
                <textarea
                  id="certifications"
                  name="certifications"
                  rows={3}
                  value={profile.certifications}
                  onChange={handleProfileChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="languages">Languages (JSON format)</label>
                <textarea
                  id="languages"
                  name="languages"
                  rows={3}
                  value={profile.languages}
                  onChange={handleProfileChange}
                />
              </div>

              <button type="submit" className="save-button">
                Save Profile
              </button>
            </form>
          </div>

          <div className={`tab-panel ${activeTab === 1 ? 'active' : ''}`}>
            <h2>Resume Template</h2>
            <form
              onSubmit={e => {
                e.preventDefault();
                saveTemplate();
              }}
            >
              <div className="form-group">
                <label htmlFor="resumeTemplate">LaTeX Template</label>
                <textarea
                  id="resumeTemplate"
                  name="resumeTemplate"
                  rows={20}
                  value={resumeTemplate}
                  onChange={handleTemplateChange}
                />
                <p className="help-text">
                  Use placeholders like {`{{name}}`}, {`{{title}}`}, etc. for
                  dynamic content.
                </p>
              </div>

              <button type="submit" className="save-button">
                Save Template
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Options;
