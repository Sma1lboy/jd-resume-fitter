import * as React from 'react';
import {
  analyzeJobDescription,
  loadOpenAISettings,
  runResumeWorkflow,
  loadUserProfile,
  loadResumeTemplate,
  generateTailoredResume,
} from '@utils/aiWorkflow';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';

interface JobDescriptionInputProps {
  onStatusChange: (status: string) => void;
}

const JobDescriptionInput: React.FC<JobDescriptionInputProps> = ({
  onStatusChange,
}) => {
  const [jobDescription, setJobDescription] = React.useState<string>('');
  const [isProcessing, setIsProcessing] = React.useState<boolean>(false);
  const [consoleOutput, setConsoleOutput] = React.useState<string[]>([]);
  const consoleEndRef = React.useRef<HTMLDivElement>(null);

  // Function to add a log message to the console output
  const addLog = (message: string) => {
    setConsoleOutput(prev => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] ${message}`,
    ]);

    // Scroll to bottom of console
    setTimeout(() => {
      if (consoleEndRef.current) {
        consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  // Clear console output
  const clearConsole = () => {
    setConsoleOutput([]);
  };

  // Process the job description
  const processJobDescription = async () => {
    if (!jobDescription.trim()) {
      onStatusChange('Please enter a job description');
      return;
    }

    setIsProcessing(true);
    clearConsole();
    addLog('Starting job description analysis...');

    try {
      // Load OpenAI settings
      addLog('Loading OpenAI settings...');
      const settings = await loadOpenAISettings();
      addLog(
        `Settings loaded: endpoint=${settings.endpoint}, model=${settings.model}, apiKey=${settings.apiKey ? 'present' : 'missing'}`
      );

      if (!settings.apiKey) {
        addLog(
          'Error: OpenAI API key not found. Please set up your API key first.'
        );
        onStatusChange('Error: OpenAI API key not found');
        setIsProcessing(false);
        return;
      }

      // Try to analyze the job description directly first
      addLog('Attempting to analyze job description directly...');
      try {
        const analysis = await analyzeJobDescription(jobDescription, settings);
        if (analysis) {
          addLog('Job description analysis successful!');
          addLog(`Keywords: ${analysis.keywords.join(', ')}`);
          addLog(`Requirements: ${analysis.requirements.join(', ')}`);
          addLog(`Responsibilities: ${analysis.responsibilities.join(', ')}`);

          // Now try to generate the resume
          addLog('Starting resume generation...');
          // Load user profile
          const profile = await loadUserProfile();
          if (!profile) {
            addLog(
              'Error: User profile not found. Please set up your profile first.'
            );
            onStatusChange('Error: User profile not found');
            setIsProcessing(false);
            return;
          }

          // Load template
          const template = await loadResumeTemplate();
          if (!template) {
            addLog(
              'Error: Resume template not found. Please set up a template first.'
            );
            onStatusChange('Error: Resume template not found');
            setIsProcessing(false);
            return;
          }

          const result = await generateTailoredResume(
            jobDescription,
            profile,
            template,
            settings,
            analysis
          );

          if (result) {
            addLog('Resume generated successfully!');
            onStatusChange('Resume generated successfully!');
          } else {
            addLog('Failed to generate resume');
            onStatusChange('Failed to generate resume');
          }
        } else {
          addLog('Direct analysis failed, trying workflow approach...');
          runWorkflowApproach();
        }
      } catch (analysisError) {
        addLog(
          `Direct analysis error: ${analysisError instanceof Error ? analysisError.message : String(analysisError)}`
        );
        addLog('Falling back to workflow approach...');
        runWorkflowApproach();
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      addLog(`Error: ${errorMessage}`);
      onStatusChange(`Error: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }

    // Helper function for the workflow approach with timeout
    async function runWorkflowApproach() {
      addLog('Starting resume workflow with timeout protection...');

      // Create a timeout promise
      const timeoutPromise = new Promise<null>((_, reject) => {
        setTimeout(
          () => reject(new Error('Resume workflow timed out after 3 minutes')),
          180000
        ); // 3 minutes
      });

      try {
        // Race the workflow against the timeout
        const result = await Promise.race([
          runResumeWorkflow(jobDescription, {
            onAnalysisStart: () => {
              addLog('Starting job description analysis (workflow)...');
              return Promise.resolve();
            },
            onAnalysisComplete: () => {
              addLog('Job description analysis completed (workflow)');
              return Promise.resolve();
            },
            onGenerationStart: () => {
              addLog('Starting resume generation (workflow)...');
              return Promise.resolve();
            },
            onGenerationComplete: () => {
              addLog('Resume generation completed (workflow)');
              return Promise.resolve();
            },
            onProgress: (phase, percentage) => {
              addLog(`Progress: ${phase} - ${percentage}%`);
              return Promise.resolve();
            },
            onError: error => {
              addLog(`Workflow error: ${error.message}`);
              return Promise.resolve();
            },
          }),
          timeoutPromise,
        ]);

        if (result) {
          addLog('Resume generated successfully (workflow)!');
          onStatusChange('Resume generated successfully!');
        } else {
          addLog('Failed to generate resume (workflow)');
          onStatusChange('Failed to generate resume');
        }
      } catch (error) {
        if (error instanceof Error && error.message.includes('timed out')) {
          addLog(`Timeout error: ${error.message}`);
          addLog('The API request is taking too long and has been aborted.');
          onStatusChange('Error: API request timed out');
        } else {
          addLog(
            `Unexpected error: ${error instanceof Error ? error.message : String(error)}`
          );
          onStatusChange('Error: Failed to generate resume');
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">
        Job Description Analysis
      </h2>

      <div className="space-y-2">
        <FormField label="Job Description">
          <Textarea
            value={jobDescription}
            onChange={e => setJobDescription(e.target.value)}
            placeholder="Paste job description here..."
            className="min-h-32"
            disabled={isProcessing}
          />
        </FormField>
        <p className="text-sm text-gray-500">
          Paste the job description you want to analyze and generate a tailored
          resume for.
        </p>
      </div>

      <div className="flex space-x-4">
        <Button
          onClick={processJobDescription}
          disabled={isProcessing || !jobDescription.trim()}
        >
          {isProcessing ? 'Processing...' : 'Generate Resume'}
        </Button>

        <Button
          variant="outline"
          onClick={clearConsole}
          disabled={isProcessing || consoleOutput.length === 0}
        >
          Clear Console
        </Button>
      </div>

      {/* Console Output */}
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-2 text-gray-700">
          Console Output
        </h3>
        <div className="bg-gray-900 text-gray-100 p-4 rounded-md h-64 overflow-y-auto font-mono text-sm">
          {consoleOutput.length > 0 ? (
            <>
              {consoleOutput.map(log => (
                <div
                  key={`log-${log.substring(0, 20)}-${Math.random().toString(36).substring(2, 7)}`}
                  className="whitespace-pre-wrap mb-1"
                >
                  {log}
                </div>
              ))}
              <div ref={consoleEndRef} />
            </>
          ) : (
            <div className="text-gray-500 italic">
              Console output will appear here...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDescriptionInput;
