import * as pdfjsLib from 'pdfjs-dist';
import { browser } from 'webextension-polyfill-ts';
import { contentLogger } from './debugLogger';

// Configure PDF.js worker with fallback options
// 1. Try to use the web accessible resource in the extension
// 2. If that fails, try direct path
// 3. If all fails, use empty string for fake worker mode
let workerSrc = '';
try {
  workerSrc = browser.runtime.getURL('pdf-worker/pdf.worker.min.mjs');
  contentLogger.info('Using PDF.js worker from extension:', workerSrc);
} catch (error) {
  contentLogger.warn('Failed to get runtime URL for PDF worker:', error);
  // Fallback to direct path (may not work in all environments)
  workerSrc = '/pdf-worker/pdf.worker.min.mjs';
}

// Set the worker source with logging
contentLogger.info('Setting PDF.js worker source to:', workerSrc);
pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

/**
 * Read a PDF file and return its contents as text
 * @param file The PDF file to read
 * @returns The text content of the PDF
 */
export async function extractTextFromPdf(file: File): Promise<string> {
  try {
    // First attempt: Use ArrayBuffer approach
    try {
      contentLogger.debug('Extracting PDF with ArrayBuffer method');
      return await extractPdfWithArrayBuffer(file);
    } catch (arrayBufferError) {
      contentLogger.warn('Error extracting PDF with ArrayBuffer method:', arrayBufferError);
      // If first method fails, try the second method
      try {
        contentLogger.debug('Trying Data URL method for PDF extraction');
        return await extractPdfWithDataUrl(file);
      } catch (dataUrlError) {
        contentLogger.warn('Error extracting PDF with Data URL method:', dataUrlError);
        // If both PDF.js methods fail, use plain text fallback
        contentLogger.debug('Trying fallback text extraction method');
        return await extractPdfAsFallbackText(file);
      }
    }
  } catch (error) {
    contentLogger.error('All PDF extraction methods failed:', error);
    // Return error message so AI can still try to handle this case
    return `Error extracting PDF content: ${error instanceof Error ? error.message : 'Unknown error'}. This is a PDF resume, please try to extract information based on this context.`;
  }
}

/**
 * Extract PDF text using ArrayBuffer approach
 */
async function extractPdfWithArrayBuffer(file: File): Promise<string> {
  // Convert file to ArrayBuffer
  const arrayBuffer = await file.arrayBuffer();
  
  // Create loading task with proper parameters
  const loadingTask = pdfjsLib.getDocument({
    data: arrayBuffer,
    useWorkerFetch: false,  // Don't use worker for fetching
    isEvalSupported: false, // Don't use eval
    useSystemFonts: true,   // Use system fonts
  });
  
  // Load PDF document
  const pdf = await loadingTask.promise;
  contentLogger.debug(`PDF loaded successfully: ${pdf.numPages} pages`);
  
  return extractTextFromPdfDocument(pdf);
}

/**
 * Extract PDF text using Data URL approach
 */
async function extractPdfWithDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        if (!event.target?.result) {
          reject(new Error('Failed to read PDF file'));
          return;
        }
        
        // Get data URL and convert to base64
        const dataUrl = event.target.result as string;
        contentLogger.debug('PDF file read as Data URL');
        
        // Load PDF document
        const loadingTask = pdfjsLib.getDocument({
          url: dataUrl,
          useWorkerFetch: false,
          isEvalSupported: false,
          useSystemFonts: true,
        });
        
        const pdf = await loadingTask.promise;
        contentLogger.debug(`PDF loaded successfully from Data URL: ${pdf.numPages} pages`);
        const text = await extractTextFromPdfDocument(pdf);
        resolve(text);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Error reading PDF file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Extract text from a PDF document object
 */
async function extractTextFromPdfDocument(pdf: pdfjsLib.PDFDocumentProxy): Promise<string> {
  let fullText = '';
  
  // Extract text from each page
  for (let i = 1; i <= pdf.numPages; i++) {
    try {
      contentLogger.debug(`Processing page ${i} of ${pdf.numPages}`);
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map(item => 'str' in item ? item.str : '')
        .join(' ');
      
      fullText += pageText + '\n\n';
    } catch (pageError) {
      contentLogger.warn(`Error extracting text from page ${i}:`, pageError);
      // Continue with next page instead of failing completely
    }
  }
  
  if (!fullText.trim()) {
    contentLogger.warn('No text content found in PDF');
    return 'No text content found in PDF.';
  }
  
  contentLogger.debug(`Extracted ${fullText.length} characters from PDF`);
  return fullText;
}

/**
 * Read content from a text file
 * @param file Text file object
 * @returns File content
 */
export function readTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        const content = e.target.result as string;
        contentLogger.debug(`Read ${content.length} characters from text file`);
        resolve(content);
      } else {
        reject(new Error('Failed to read text file'));
      }
    };
    reader.onerror = () => reject(new Error('Error reading text file'));
    reader.readAsText(file);
  });
}

/**
 * Extract content from a file based on its type
 * @param file File object
 * @returns Extracted content
 */
export async function extractFileContent(file: File): Promise<string> {
  const fileName = file.name.toLowerCase();
  
  contentLogger.info(`Processing file: ${fileName} (${(file.size / 1024).toFixed(1)} KB)`);
  
  if (fileName.endsWith('.pdf')) {
    contentLogger.debug('Extracting content from PDF file');
    return extractTextFromPdf(file);
  } else if (fileName.endsWith('.txt')) {
    contentLogger.debug('Extracting content from TXT file');
    return readTextFile(file);
  } else if (fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
    // For DOC/DOCX files, since we can't easily parse them in browser
    // Use a simpler approach - just tell the AI it's a resume
    contentLogger.debug('Creating placeholder content for DOC/DOCX file');
    return `This is a resume in ${fileName.split('.').pop()?.toUpperCase()} format. Please extract all relevant profile information including: name, contact details, work experience, education, skills, and other sections.`;
  } else {
    contentLogger.error(`Unsupported file type: ${fileName}`);
    throw new Error('Unsupported file type');
  }
}

/**
 * Last resort fallback that treats PDF as binary and extracts readable strings
 */
async function extractPdfAsFallbackText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        if (!event.target?.result) {
          reject(new Error('Failed to read PDF file'));
          return;
        }
        
        contentLogger.debug('Using fallback binary extraction method');
        
        // Get the binary content as string
        const binary = event.target.result as ArrayBuffer;
        const bytes = new Uint8Array(binary);
        
        // Extract text from binary by finding readable strings
        let extractedText = '';
        let currentString = '';
        const readableChars = /[\x20-\x7E\r\n\t]/; // ASCII printable chars
        
        // Go through bytes and collect readable strings
        for (let i = 0; i < bytes.length; i++) {
          const char = String.fromCharCode(bytes[i]);
          
          if (readableChars.test(char)) {
            currentString += char;
          } else if (currentString.length > 4) { // Only keep strings with reasonable length
            extractedText += currentString + '\n';
            currentString = '';
          } else {
            currentString = '';
          }
        }
        
        // Add final string if exists
        if (currentString.length > 4) {
          extractedText += currentString;
        }
        
        // If nothing was extracted, return a placeholder
        if (!extractedText.trim()) {
          contentLogger.warn('No text extracted using fallback method');
          extractedText = 'PDF content could not be extracted. This is a PDF resume.';
        } else {
          contentLogger.debug(`Extracted ${extractedText.length} characters using fallback method`);
        }
        
        resolve(extractedText);
      } catch (error) {
        contentLogger.error('Error in fallback extraction:', error);
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Error reading PDF file'));
    reader.readAsArrayBuffer(file);
  });
} 