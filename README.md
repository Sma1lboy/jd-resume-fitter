# Resume Generator

<p align="center">
  <img src="src/assets/icons/android-chrome-512x512.png" alt="Resume Generator Logo" width="150" height="150">
</p>

A Chrome extension that helps you create tailored resumes for job applications using OpenAI API. It analyzes job descriptions to highlight your most relevant skills and experiences.

## Features

- **AI-Powered Resume Generation**: Generate customized resumes based on job descriptions using OpenAI API
- **LaTeX Template Support**: Create professional-looking resumes with customizable LaTeX templates
- **Profile Management**: Easily manage your professional profile information
- **Job Description Analysis**: Automatically extract key requirements and responsibilities from job postings
- **PDF Export**: Export your generated resumes as PDF documents
- **Local Storage**: All your data is stored locally in your browser

## Installation

### From Chrome Web Store

1. Visit the [Chrome Web Store](https://chrome.google.com/webstore/category/extensions) (link will be updated when published)
2. Search for "Resume Generator"
3. Click "Add to Chrome"

### Manual Installation (Developer Mode)

1. Clone this repository:
   ```
   git clone https://github.com/Sma1lboy/jd-resume-fitter.git
   ```
2. Install dependencies:
   ```
   yarn install
   ```
3. Build the extension:
   ```
   yarn build:chrome
   ```
4. Open Chrome and navigate to `chrome://extensions/`
5. Enable "Developer mode" (toggle in the top right)
6. Click "Load unpacked" and select the `dist/chrome` directory

## Usage

### Initial Setup

1. After installing the extension, click on the extension icon in your browser toolbar
2. Go to the Options page to set up your OpenAI API key:
   - Click on the "Settings" tab
   - Enter your OpenAI API key
   - Click "Save"
3. Set up your profile information:
   - Navigate to the "Profile" tab
   - Fill in your personal details, education, experience, and skills
   - Your profile will be automatically saved

### Generating a Resume

1. Find a job posting you want to apply for
2. Click on the extension icon and select "Generate Resume"
3. The extension will analyze the job description and create a tailored resume
4. Review and edit the generated resume
5. Click "Export to PDF" to download your ready-to-submit resume

### Customizing Templates

1. Go to the Options page and select the "Template" tab
2. Edit the LaTeX template or choose "Generate Template from Current Input" to have AI create a template
3. Click "Save" to update your template

## Development

### Project Structure

```
resume-generator/
├── src/                 # Source code
│   ├── components/      # React components
│   ├── utils/           # Utility functions
│   ├── types/           # TypeScript type definitions
│   └── manifest.json    # Extension manifest
├── public/              # Static assets
└── dist/                # Build output
```

### Development Workflow

1. Run the development server:
   ```
   yarn dev:chrome
   ```
2. Make your changes
3. Build for production:
   ```
   yarn build:chrome
   ```

## Technologies Used

- **React**: UI framework
- **TypeScript**: Type-safe JavaScript
- **TailwindCSS**: Styling
- **OpenAI API**: AI-powered content generation
- **LaTeX**: Resume templating
- **Chrome Extension API**: Browser integration

## Privacy

This extension respects your privacy. All personal information is stored locally in your browser. See our [Privacy Policy](PRIVACY.md) for more details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgments

- OpenAI for providing the API that powers our resume generation
- The open source community for the amazing tools that made this possible

---

Made with ❤️ for job seekers everywhere
