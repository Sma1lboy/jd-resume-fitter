import React from 'react';
import { browser } from 'webextension-polyfill-ts';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { getAppConfig, setAppConfig } from '@/utils/config';

/**
 * Component for application settings management
 */
const OptionsAppSettings: React.FC = () => {
  // Resume settings state
  const [resumeStatus, setResumeStatus] = React.useState('');
  const [isConfirming, setIsConfirming] = React.useState(false);

  // Debug settings state
  const [debugMode, setDebugMode] = React.useState(false);
  const [debugStatus, setDebugStatus] = React.useState('');

  // Load debug settings on component mount
  React.useEffect(() => {
    loadDebugSettings();
  }, []);

  // Load debug settings
  const loadDebugSettings = async () => {
    try {
      const settings = await getAppConfig();
      setDebugMode(settings.debugMode);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  // Handle debug mode change
  const handleDebugModeChange = async (checked: boolean) => {
    setDebugMode(checked);

    try {
      await setAppConfig({ debugMode: checked });
      setDebugStatus('Settings saved');

      // Clear status message after 3 seconds
      setTimeout(() => setDebugStatus(''), 3000);
    } catch (error) {
      console.error('Failed to save debug mode setting:', error);
      setDebugStatus('Save failed');
    }
  };

  // Clear all recent resumes
  const clearAllRecentResumes = async () => {
    try {
      // Remove the storage item entirely
      await browser.storage.local.remove('recentlyResumeList');

      // Show success message
      setResumeStatus('All recent resumes cleared successfully');
      setIsConfirming(false);

      // Clear status message after 3 seconds
      setTimeout(() => setResumeStatus(''), 3000);
    } catch (error) {
      console.error('Failed to clear recent resumes:', error);
      setResumeStatus('Failed to clear recent resumes');
      setIsConfirming(false);
    }
  };

  // Cancel the confirmation dialog
  const cancelClearAction = () => {
    setIsConfirming(false);
  };

  // Show confirmation dialog
  const showConfirmation = () => {
    setIsConfirming(true);
  };

  return (
    <div className="space-y-6">
      {/* Resume Management Section */}
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Application Settings</h2>

        {/* Resume Management */}
        <div className="mb-6 border-b pb-6">
          <h3 className="text-base font-medium mb-2">Resume Management</h3>
          <p className="text-sm text-gray-500 mb-4">
            Clear all recently generated resumes from storage. This action
            cannot be undone.
          </p>

          {isConfirming ? (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-3">
              <h4 className="text-sm font-medium text-red-800 mb-2">
                Confirm Action
              </h4>
              <p className="text-xs text-red-700 mb-3">
                Are you sure you want to clear all recent resumes?
              </p>
              <div className="flex space-x-3">
                <Button
                  type="button"
                  onClick={clearAllRecentResumes}
                  className="bg-red-500 hover:bg-red-600 text-white text-xs py-1 px-3"
                >
                  Clear All
                </Button>
                <Button
                  type="button"
                  onClick={cancelClearAction}
                  variant="outline"
                  className="text-xs py-1 px-3"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              type="button"
              onClick={showConfirmation}
              className="bg-red-100 text-red-800 hover:bg-red-200 border border-red-200"
            >
              Clear All Recent Resumes
            </Button>
          )}

          {resumeStatus && (
            <div
              className={`mt-2 text-sm ${resumeStatus.includes('Failed') ? 'text-red-500' : 'text-green-500'}`}
            >
              {resumeStatus}
            </div>
          )}
        </div>

        {/* Debug Settings */}
        <div>
          <h3 className="text-base font-medium mb-2">Debug Settings</h3>

          <div className="mb-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label
                  htmlFor="debug-mode"
                  className="text-sm text-gray-700 font-medium"
                >
                  Enable Debug Mode
                </Label>
                <p className="text-xs text-gray-500">
                  Enabling debug mode will output more detailed logs to the
                  console, which helps with troubleshooting issues.
                </p>
              </div>
              <Switch
                id="debug-mode"
                checked={debugMode}
                onCheckedChange={handleDebugModeChange}
              />
            </div>
          </div>

          {debugStatus && (
            <div
              className={`mt-2 text-sm ${debugStatus.includes('failed') ? 'text-red-500' : 'text-green-500'}`}
            >
              {debugStatus}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OptionsAppSettings;
