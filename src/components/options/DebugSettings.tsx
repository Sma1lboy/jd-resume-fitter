import React, { useState, useEffect } from 'react';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { getAppConfig, setAppConfig } from '@/utils/config';

const DebugSettings: React.FC = () => {
  const [debugMode, setDebugMode] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await getAppConfig();
      setDebugMode(settings.debugMode);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const handleDebugModeChange = async (checked: boolean) => {
    setDebugMode(checked);
    
    try {
      await setAppConfig({ debugMode: checked });
      setSaveStatus('Settings saved');
      
      // Clear status message after 3 seconds
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      console.error('Failed to save debug mode setting:', error);
      setSaveStatus('Save failed');
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Debug Settings</h2>
      
      <div className="mb-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="debug-mode" className="text-sm text-gray-700 font-medium">
              Enable Debug Mode
            </Label>
            <p className="text-xs text-gray-500">
              Enabling debug mode will output more detailed logs to the console, which helps with troubleshooting issues.
            </p>
          </div>
          <Switch 
            id="debug-mode"
            checked={debugMode}
            onCheckedChange={handleDebugModeChange}
          />
        </div>
      </div>
      
      {saveStatus && (
        <div className={`mt-2 text-sm ${saveStatus.includes('failed') ? 'text-red-500' : 'text-green-500'}`}>
          {saveStatus}
        </div>
      )}
    </div>
  );
};

export default DebugSettings; 