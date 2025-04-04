import * as React from 'react';
import { Upload, File, AlertCircle } from 'lucide-react';
import { UserProfile } from '@/types';
import { UserProfileForm } from './ManualProfileInput';

interface PdfProfileImportProps {
  onClose: () => void;
  onProfileUpdate?: (profile: UserProfileForm) => void;
}

const PdfProfileImport: React.FC<PdfProfileImportProps> = ({ 
  onClose,
  onProfileUpdate 
}) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);
  const [error, setError] = React.useState<string>('');
  const [isProcessing, setIsProcessing] = React.useState(false);
  
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
    
    // Check if it's a PDF
    if (selectedFile.type !== 'application/pdf') {
      setError('Please upload a PDF file.');
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

  // Process the PDF file
  const processPdfFile = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    setError('');
    
    try {
      // TODO: Implement actual PDF processing with AI SDK
      // For now, show a message that it's in development
      
      setTimeout(() => {
        setIsProcessing(false);
        setError('PDF processing is currently under development.');
      }, 2000);
      
      // When processing is implemented, it would call onProfileUpdate with the extracted profile
    } catch (err) {
      setIsProcessing(false);
      setError(`Error processing PDF: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm text-gray-600 mb-4">
          Upload your resume PDF file to automatically extract your profile information.
          We'll try to detect your details and fill in your profile.
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
            accept=".pdf"
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
              >
                Remove file
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Upload className="h-12 w-12 text-gray-400 mb-3" />
              <p className="font-medium text-gray-800">
                Drag and drop your PDF file here
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
                Maximum file size: 10MB
              </p>
            </div>
          )}
        </div>
        
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
        >
          Cancel
        </button>
        
        <button
          type="button"
          onClick={processPdfFile}
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