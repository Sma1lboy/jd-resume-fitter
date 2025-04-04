const fs = require('fs');
const path = require('path');

// Create directories for each browser target
const browserTargets = ['chrome', 'firefox', 'opera'];

// Copy worker file for each browser target
browserTargets.forEach(browser => {
  // Define target directories
  const targetDir = path.join(__dirname, 'extension', browser, 'pdf-worker');
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
    console.log(`Created directory: ${targetDir}`);
  }
  
  // Path to the PDF.js worker file in node_modules
  const workerSrc = path.join(__dirname, 'node_modules', 'pdfjs-dist', 'build', 'pdf.worker.min.mjs');
  const workerDest = path.join(targetDir, 'pdf.worker.min.mjs');
  
  // Copy the worker file
  try {
    fs.copyFileSync(workerSrc, workerDest);
    console.log(`Copied PDF.js worker from ${workerSrc} to ${workerDest}`);
  } catch (error) {
    console.error(`Error copying worker file to ${browser}:`, error);
  }
});

// Also copy to general extension directory for development mode
const extensionDir = path.join(__dirname, 'extension', 'pdf-worker');
if (!fs.existsSync(extensionDir)) {
  fs.mkdirSync(extensionDir, { recursive: true });
  console.log(`Created directory: ${extensionDir}`);
}

const workerSrc = path.join(__dirname, 'node_modules', 'pdfjs-dist', 'build', 'pdf.worker.min.mjs');
const extensionWorkerDest = path.join(extensionDir, 'pdf.worker.min.mjs');

try {
  fs.copyFileSync(workerSrc, extensionWorkerDest);
  console.log(`Copied PDF.js worker from ${workerSrc} to ${extensionWorkerDest}`);
} catch (error) {
  console.error('Error copying worker file to extension directory:', error);
} 