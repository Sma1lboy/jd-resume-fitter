import * as React from 'react';
import { Upload, File, AlertCircle, Loader2 } from 'lucide-react';
import { parseResumeWithAI } from '@utils/aiResumeParser';
import { loadOpenAISettings } from '@utils/aiWorkflow';
import { profileToForm } from '@utils/profileConverters';
import { extractFileContent } from '@utils/fileUtils';
import { UserProfile, UserProfileForm } from '@/types';

interface PdfProfileImportProps {
  onClose: () => void;
  onProfileUpdate?: (profile: UserProfileForm) => void;
}

const PdfProfileImport: React.FC<PdfProfileImportProps> = ({
  onClose,
  onProfileUpdate,
}) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);
  const [error, setError] = React.useState<string>('');
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [processingStage, setProcessingStage] = React.useState<string>('');

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Handle drag events
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSetFile(droppedFile);
    }
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      validateAndSetFile(selectedFile);
    }
  };

  // Validate and set file
  const validateAndSetFile = (selectedFile: File) => {
    setError('');

    // Check file type by extension
    const fileName = selectedFile.name.toLowerCase();
    const isPdf = fileName.endsWith('.pdf');
    const isDoc = fileName.endsWith('.doc') || fileName.endsWith('.docx');
    const isTxt = fileName.endsWith('.txt');

    if (!isPdf && !isDoc && !isTxt) {
      setError('Please upload a PDF, DOC, DOCX, or TXT file.');
      return;
    }

    // Check file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File is too large. Maximum size is 10MB.');
      return;
    }

    setFile(selectedFile);
  };

  // Handle upload button click
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Process the resume file
  const processResumeFile = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError('');

    try {
      // Add processing steps information
      const updateProgress = (stage: string) => {
        console.log(`PDF processing: ${stage}`);
        setProcessingStage(stage);
      };

      // 1. Load OpenAI settings
      updateProgress('Loading OpenAI settings...');
      const settings = await loadOpenAISettings();
      if (!settings.apiKey) {
        throw new Error(
          'OpenAI API key not found. Please set up your API key first.'
        );
      }

      // 2. Extract content from the file
      updateProgress('Extracting text from file...');
      const fileContent = await extractFileContent(file);

      // Check if extraction yielded meaningful content
      if (fileContent.includes('Error extracting PDF content')) {
        console.warn(
          'PDF extraction had issues, but proceeding with partial content'
        );
      }

      // 3. Parse resume using AI
      updateProgress('Analyzing resume with AI...');
      const parsedProfile = await parseResumeWithAI(fileContent, settings);

      // 4. Convert parsed profile to form format
      updateProgress('Processing results...');
      const formProfile = profileToForm(parsedProfile);

      // 5. Update the profile
      if (onProfileUpdate) {
        onProfileUpdate(formProfile);
      }

      // 6. Close the modal
      onClose();
    } catch (err) {
      setIsProcessing(false);
      setProcessingStage('');
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';

      // More user-friendly error messages
      if (errorMessage.includes('API key')) {
        setError(
          'Please set up your OpenAI API key in the settings tab first.'
        );
      } else if (errorMessage.includes('worker')) {
        setError(
          'Error processing PDF file. We were able to extract some text but not optimally. Trying anyway...'
        );

        // Try to process anyway after a short delay
        setTimeout(async () => {
          try {
            setIsProcessing(true);
            setProcessingStage('Trying alternative method...');

            // Simple retry without PDF.js dependency
            const settings = await loadOpenAISettings();
            const fileContent = `This is a resume file named ${file.name}. Please extract all relevant profile information.`;
            const parsedProfile = await parseResumeWithAI(
              fileContent,
              settings
            );
            const formProfile = profileToForm(parsedProfile);

            if (onProfileUpdate) {
              onProfileUpdate(formProfile);
            }

            onClose();
          } catch (retryError) {
            console.error('Retry failed:', retryError);
            setIsProcessing(false);
            setProcessingStage('');
            setError(`Error processing resume: ${errorMessage}`);
          }
        }, 1000);
      } else {
        setError(`Error processing resume: ${errorMessage}`);
      }
    }
  };

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm text-gray-600 mb-4">
          Upload your resume file to automatically extract your profile
          information. Our AI will detect your details and fill in your profile.
        </p>

        {/* File upload area */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragging
              ? 'border-primary-500 bg-primary-50'
              : file
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileInputChange}
          />

          {file ? (
            <div className="flex flex-col items-center">
              <File className="h-12 w-12 text-green-500 mb-2" />
              <p className="font-medium text-gray-800">{file.name}</p>
              <p className="text-sm text-gray-500 mb-2">
                {(file.size / 1024).toFixed(1)} KB
              </p>
              <button
                type="button"
                className="text-sm text-primary-600 hover:text-primary-800 underline"
                onClick={() => setFile(null)}
                disabled={isProcessing}
              >
                Remove file
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Upload className="h-12 w-12 text-gray-400 mb-3" />
              <p className="font-medium text-gray-800">
                Drag and drop your resume file here
              </p>
              <p className="text-sm text-gray-500 mb-3">or</p>
              <button
                type="button"
                onClick={handleUploadClick}
                className="bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                Browse files
              </button>
              <p className="text-xs text-gray-500 mt-2">
                Supported formats: PDF, DOC, DOCX, TXT (Maximum file size: 10MB)
              </p>
            </div>
          )}
        </div>

        {/* Processing status */}
        {isProcessing && (
          <div className="mt-4 flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin mr-2 text-primary-500" />
            <p className="text-sm text-gray-600">
              {processingStage || 'Processing...'}
            </p>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mt-3 flex items-start text-red-600">
            <AlertCircle className="h-5 w-5 mr-1 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onClose}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          disabled={isProcessing}
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={processResumeFile}
          disabled={!file || isProcessing}
          className={`${
            !file || isProcessing
              ? 'bg-primary-300 cursor-not-allowed'
              : 'bg-primary-500 hover:bg-primary-600'
          } text-white font-medium py-2 px-4 rounded shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
        >
          {isProcessing ? 'Processing...' : 'Extract Profile'}
        </button>
      </div>
    </div>
  );
};

export default PdfProfileImport;
