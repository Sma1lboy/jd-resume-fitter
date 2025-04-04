import * as React from 'react';
import { TextareaField } from '@components/ui/form-field';
import { loadResumeTemplate, saveResumeTemplate } from '@utils/aiWorkflow';

interface ResumeTemplateEditorProps {
  onStatusChange: (status: string) => void;
}

// Default LaTeX template
const defaultTemplate = `\\documentclass[11pt,a4paper]{article}

% Packages
\\usepackage[margin=0.75in]{geometry}
\\usepackage{hyperref}
\\usepackage{fontawesome}
\\usepackage{titlesec}
\\usepackage{enumitem}
\\usepackage{xcolor}

% Define colors
\\definecolor{primary}{RGB}{70, 130, 180}
\\definecolor{secondary}{RGB}{128, 128, 128}

% Format section headings
\\titleformat{\\section}{\\normalfont\\Large\\bfseries}{}{0em}{\\color{primary}}[\\titlerule]
\\titlespacing*{\\section}{0pt}{*1.5}{*1}

% Remove page numbers
\\pagestyle{empty}

\\begin{document}

% Header with name and contact info
\\begin{center}
    {\\LARGE \\textbf{{{name}}}}\\\\[0.3em]
    {\\large {title}}\\\\[0.5em]
    {\\small
    \\faEnvelope\\ \\href{mailto:{email}}{{email}} $|$
    \\faPhone\\ {phone} $|$
    \\faMapMarker\\ {location}
    {{#if linkedin}}
    $|$ \\faLinkedin\\ \\href{https://www.linkedin.com/in/{linkedin}}{linkedin}
    {{/if}}
    {{#if github}}
    $|$ \\faGithub\\ \\href{https://github.com/{github}}{github}
    {{/if}}
    {{#if website}}
    $|$ \\faGlobe\\ \\href{https://{website}}{{website}}
    {{/if}}
    }
\\end{center}

% Summary
\\section{Professional Summary}
{summary}

% Skills
\\section{Skills}
{{#each skills}}
{{this}}{{#unless @last}}, {{/unless}}
{{/each}}

% Experience
\\section{Experience}
{{#each experience}}
\\textbf{{company}} \\hfill {{date}}\\\\
\\textit{{title}}\\\\
\\begin{itemize}[leftmargin=*,nosep]
{{#each description}}
    \\item {{{this}}}
{{/each}}
\\end{itemize}
{{/each}}

% Education
\\section{Education}
{{#each education}}
\\textbf{{institution}} \\hfill {{date}}\\\\
\\textit{{degree}}\\\\
{{/each}}

{{#if certifications}}
% Certifications
\\section{Certifications}
{{#each certifications}}
\\textbf{{name}} \\hfill {{date}}\\\\
\\textit{{issuer}}\\\\
{{/each}}
{{/if}}

{{#if languages}}
% Languages
\\section{Languages}
{{#each languages}}
{{language}} ({{proficiency}}){{#unless @last}}, {{/unless}}
{{/each}}
{{/if}}

\\end{document}`;

const ResumeTemplateEditor: React.FC<ResumeTemplateEditorProps> = ({
  onStatusChange,
}) => {
  const [template, setTemplate] = React.useState<string>('');
  const [loading, setLoading] = React.useState<boolean>(true);

  // Load template on component mount
  React.useEffect(() => {
    const loadTemplate = async () => {
      try {
        setLoading(true);
        const loadedTemplate = await loadResumeTemplate();
        if (loadedTemplate) {
          setTemplate(loadedTemplate);
        } else {
          // Set default template if none exists
          setTemplate(defaultTemplate);
        }
      } catch (error) {
        console.error('Error loading resume template:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTemplate();
  }, []);

  // Save template
  const handleSaveTemplate = async () => {
    try {
      const success = await saveResumeTemplate(template);
      if (success) {
        onStatusChange('Resume template saved successfully!');
      } else {
        onStatusChange('Error saving resume template');
      }
    } catch (error) {
      console.error('Error saving resume template:', error);
      onStatusChange('Error saving resume template');
    }
  };

  // Auto-save template with debounce
  const debouncedSaveTemplate = React.useCallback(
    (value: string) => {
      const saveWithDebounce = debounce(async (templateToSave: string) => {
        try {
          await saveResumeTemplate(templateToSave);
          onStatusChange('Template auto-saved');
          setTimeout(() => onStatusChange(''), 2000);
        } catch (error) {
          console.error('Error auto-saving template:', error);
        }
      }, 1000);

      saveWithDebounce(value);
    },
    [onStatusChange]
  );

  // Handle template change
  const handleTemplateChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newTemplate = e.target.value;
    setTemplate(newTemplate);
    debouncedSaveTemplate(newTemplate);
  };

  // Debounce function
  function debounce<F extends (...args: any[]) => any>(
    func: F,
    waitFor: number
  ): (...args: Parameters<F>) => void {
    let timeout: ReturnType<typeof setTimeout> | null = null;

    return (...args: Parameters<F>): void => {
      if (timeout !== null) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(() => func(...args), waitFor);
    };
  }

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2 text-gray-700">
          Resume Template Editor
        </h2>
        <p className="text-gray-600 mb-4">
          Edit your LaTeX resume template below. The template uses
          Handlebars-style syntax for variable substitution (e.g., {'{name}'},{' '}
          {'{email}'}).
        </p>
      </div>

      {loading ? (
        <div className="text-center py-4">Loading template...</div>
      ) : (
        <>
          <TextareaField
            label="LaTeX Template"
            id="resumeTemplate"
            rows={20}
            value={template}
            onChange={handleTemplateChange}
            className="font-mono text-sm"
          />

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSaveTemplate}
              className="bg-primary-500 hover:bg-primary-600 text-primary-foreground px-4 py-2 rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2"
            >
              Save Template
            </button>
          </div>

          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-md">
            <h3 className="font-medium text-gray-700 mb-2">
              Template Variables
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              The following variables are available in your template:
            </p>
            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
              <li>
                <code className="bg-gray-100 px-1 rounded">{'{name}'}</code> -
                Your full name
              </li>
              <li>
                <code className="bg-gray-100 px-1 rounded">{'{title}'}</code> -
                Your professional title
              </li>
              <li>
                <code className="bg-gray-100 px-1 rounded">{'{email}'}</code> -
                Your email address
              </li>
              <li>
                <code className="bg-gray-100 px-1 rounded">{'{phone}'}</code> -
                Your phone number
              </li>
              <li>
                <code className="bg-gray-100 px-1 rounded">{'{location}'}</code>{' '}
                - Your location
              </li>
              <li>
                <code className="bg-gray-100 px-1 rounded">{'{linkedin}'}</code>{' '}
                - Your LinkedIn username
              </li>
              <li>
                <code className="bg-gray-100 px-1 rounded">{'{github}'}</code> -
                Your GitHub username
              </li>
              <li>
                <code className="bg-gray-100 px-1 rounded">{'{website}'}</code>{' '}
                - Your website URL
              </li>
              <li>
                <code className="bg-gray-100 px-1 rounded">{'{summary}'}</code>{' '}
                - Your professional summary
              </li>
              <li>
                <code className="bg-gray-100 px-1 rounded">
                  {'{#each skills}}'}
                </code>{' '}
                - Loop through skills
              </li>
              <li>
                <code className="bg-gray-100 px-1 rounded">
                  {'{#each experience}}'}
                </code>{' '}
                - Loop through experience items
              </li>
              <li>
                <code className="bg-gray-100 px-1 rounded">
                  {'{#each education}}'}
                </code>{' '}
                - Loop through education items
              </li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default ResumeTemplateEditor;
