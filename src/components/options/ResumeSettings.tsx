import React, { useState } from 'react';
import { browser } from 'webextension-polyfill-ts';
import { Button } from '../ui/button';

/**
 * Component for managing resume-related settings
 */
const ResumeSettings: React.FC = () => {
  const [status, setStatus] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);

  // Clear all recent resumes
  const clearAllRecentResumes = async () => {
    try {
      // Get existing resume list to check if there's anything to clear
      const data = await browser.storage.local.get('recentlyResumeList');

      // Remove the storage item entirely
      await browser.storage.local.remove('recentlyResumeList');

      // Show success message
      setStatus('All recent resumes cleared successfully');
      setIsConfirming(false);

      // Clear status message after 3 seconds
      setTimeout(() => setStatus(''), 3000);
    } catch (error) {
      console.error('Failed to clear recent resumes:', error);
      setStatus('Failed to clear recent resumes');
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
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Resume Management</h2>

      <div className="mb-6">
        <h3 className="text-base font-medium mb-2">Recent Resumes</h3>
        <p className="text-sm text-gray-500 mb-4">
          Clear all recently generated resumes from storage. This action cannot
          be undone.
        </p>

        {isConfirming ? (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
            <h4 className="text-sm font-medium text-red-800 mb-2">
              Confirm Action
            </h4>
            <p className="text-xs text-red-700 mb-3">
              Are you sure you want to clear all recent resumes? This will
              permanently remove all your recent resume generation history.
            </p>
            <div className="flex space-x-3">
              <Button
                onClick={clearAllRecentResumes}
                className="bg-red-500 hover:bg-red-600 text-white text-xs py-1 px-3"
              >
                Clear All
              </Button>
              <Button
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
            onClick={showConfirmation}
            className="bg-red-100 text-red-800 hover:bg-red-200 border border-red-200"
          >
            Clear All Recent Resumes
          </Button>
        )}
      </div>

      {status && (
        <div
          className={`mt-2 text-sm ${status.includes('Failed') ? 'text-red-500' : 'text-green-500'}`}
        >
          {status}
        </div>
      )}
    </div>
  );
};

export default ResumeSettings;
