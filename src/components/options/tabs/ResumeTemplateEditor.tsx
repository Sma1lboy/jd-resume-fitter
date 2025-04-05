import * as React from 'react';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { generateText } from 'ai';
import { TextareaField } from '@components/ui/form-field';
import {
  loadResumeTemplate,
  saveResumeTemplate,
  loadOpenAISettings,
} from '@utils/aiWorkflow';
import { logger } from '@utils/logger';
import { Button } from '@/components/ui/button';

interface ResumeTemplateEditorProps {
  onStatusChange: (status: string) => void;
}

// Default LaTeX template
const defaultTemplate = `\\documentclass[letterpaper,11pt]{article}

\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}
\\input{glyphtounicode}

\\pagestyle{fancy}
\\fancyhf{}
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1.0in}

\\urlstyle{same}

\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

\\titleformat{\\section}{
\\vspace{-4pt}\\scshape\\raggedright\\large
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-5pt}]

\\pdfgentounicode=1

\\newcommand{\\resumeItem}[1]{
\\item\\small{
{#1 \\vspace{-1pt}}
}
}

\\newcommand{\\resumeSubheading}[4]{
\\vspace{-2pt}\\item
\\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
\\textbf{#1} & #2 \\\\
\\textit{\\small#3} & \\textit{\\small #4} \\\\
\\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeSubSubheading}[2]{
\\item
\\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
\\textit{\\small#1} & \\textit{\\small #2} \\\\
\\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeProjectHeading}[2]{
\\item
\\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
\\small#1 & \\textit{\\small #2} \\\\
\\end{tabular*}\\vspace{-5pt}
}

\\newcommand{\\resumeSubItem}[1]{\\resumeItem{#1}\\vspace{-4pt}}

\\renewcommand\\labelitemii{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}

\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.15in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}

\\begin{document}

\\begin{center}
\\textbf{\\Huge \\scshape {{name}}} \\\\ \\vspace{1pt}
\\small
\\href{sms:{{phone}}}{{{phone}}} $|$
\\href{mailto:{{email}}}{{{email}}} $|$
\\href{https://www.linkedin.com/in/{{linkedin}}}{\\underline{{{linkedin}}}} $|$
\\href{https://github.com/{{github}}}{\\underline{{{github}}}}
\\end{center}

\\section{Education}
\\resumeSubHeadingListStart
{{#each education}}
\\resumeSubheading
{{{institution}}}{{{location}}}
{{{degree}}}{{{date}}}
{{/each}}
\\resumeSubHeadingListEnd

\\section{Experience}
\\resumeSubHeadingListStart
{{#each experience}}
\\resumeSubheading
{{{title}}}{{{location}}}
{{{company}}}{{{date}}}
\\resumeItemListStart
{{#each description}}
\\resumeItem{{{this}}}
{{/each}}
\\resumeItemListEnd
{{/each}}
\\resumeSubHeadingListEnd

\\section{Skills}
\\begin{itemize}[leftmargin=0.15in, label={}]
\\small{\\item{
\\textbf{Skills}: {{skills}}
}}
\\end{itemize}

{{#if certifications}}
\\section{Certifications}
\\resumeSubHeadingListStart
{{#each certifications}}
\\resumeSubheading
{{{name}}}{{{date}}}
{{{issuer}}}{}
{{/each}}
\\resumeSubHeadingListEnd
{{/if}}

{{#if languages}}
\\section{Languages}
\\begin{itemize}[leftmargin=0.15in, label={}]
\\small{\\item{
{{#each languages}}
{{name}} ({{proficiency}}){{#unless @last}}, {{/unless}}
{{/each}}
}}
\\end{itemize}
{{/if}}

\\end{document}`;

const ResumeTemplateEditor: React.FC<ResumeTemplateEditorProps> = ({
  onStatusChange,
}) => {
  const [template, setTemplate] = React.useState<string>('');
  const [loading, setLoading] = React.useState<boolean>(true);
  const [isGenerating, setIsGenerating] = React.useState<boolean>(false);

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
        logger.error('Error loading resume template:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTemplate();
  }, []);

  // Generate new LaTeX template from current template or resume text
  const generateTemplateFromCurrent = async () => {
    try {
      setIsGenerating(true);
      onStatusChange('Analyzing input and generating LaTeX template...');

      // Check if current template is empty
      if (!template.trim()) {
        onStatusChange(
          'Error: Current input is empty. Please enter text first.'
        );
        setIsGenerating(false);
        return;
      }

      // Load OpenAI settings
      const settings = await loadOpenAISettings();
      if (!settings.apiKey) {
        onStatusChange(
          'Error: OpenAI API key not found. Please set up your API key first.'
        );
        setIsGenerating(false);
        return;
      }

      // Create an OpenAI compatible provider using ai-sdk
      const provider = createOpenAICompatible({
        name: 'resumeTemplateProvider',
        baseURL: settings.endpoint,
        apiKey: settings.apiKey,
      });

      // Determine if input is likely a LaTeX template or resume text
      const isLikelyLatex =
        template.includes('\\documentclass') ||
        template.includes('\\begin{document}') ||
        template.includes('\\usepackage');

      // Prepare system message and prompt based on input type
      const systemMessage = isLikelyLatex
        ? `You are a LaTeX resume template generator. Your task is to improve or refine an existing LaTeX template.
Return ONLY the complete LaTeX code without any explanations or comments outside the code.`
        : `You are a LaTeX resume template generator. Your task is to convert resume text into a professional LaTeX template.
Create a template that uses Handlebars-style variables like {{name}}, {{email}}, etc. for data insertion.
Return ONLY the complete LaTeX code without any explanations or comments outside the code.`;

      // Create prompt based on input type
      const prompt = isLikelyLatex
        ? `I have this LaTeX resume template that I'd like you to improve or refine:

${template}

Please create an enhanced version of this template with:
- Better formatting and structure
- Improved visual layout
- More professional styling
- Maintain compatibility with Handlebars-style variables ({{name}}, {{email}}, etc.)
- Keep the same basic sections but feel free to reorganize or enhance them

Return ONLY the complete LaTeX code of the improved template.`
        : `I have this resume text that I'd like you to convert into a professional LaTeX template:

${template}

Please create a LaTeX template based on this resume with:
- Professional formatting and structure
- Clean visual layout
- Proper section organization (education, experience, skills, etc.)
- Use Handlebars-style variables for dynamic content ({{name}}, {{email}}, {{phone}}, etc.)
- Include appropriate LaTeX packages and commands

Return ONLY the complete LaTeX code of the template.`;

      // Generate the template using generateText
      const result = await generateText({
        model: provider(settings.model),
        prompt,
        system: systemMessage,
        temperature: 0.3,
        maxTokens: 4000,
      });

      if (result) {
        // Extract the text from the result
        let templateText;
        if (typeof result === 'object' && result.text) {
          templateText = await result.text;
        } else if (typeof result === 'string') {
          templateText = result;
        } else {
          templateText = String(result);
        }

        // Clean any markdown code block formatting if present
        const cleanTemplate = templateText
          .replace(/```latex\s+|\s+```|```\s+|\s+```/g, '')
          .trim();

        setTemplate(cleanTemplate);
        await saveResumeTemplate(cleanTemplate);
        onStatusChange(
          isLikelyLatex
            ? 'LaTeX template successfully enhanced!'
            : 'Resume text successfully converted to LaTeX template!'
        );
      } else {
        onStatusChange('Error generating template. Please try again.');
      }
    } catch (error) {
      logger.error('Error generating template:', error);
      onStatusChange('Error generating template. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

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
      logger.error('Error saving resume template:', error);
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
          logger.error('Error auto-saving template:', error);
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
          Edit your LaTeX resume template below. If you don't have your own
          template, you can use our default template or convert from your
          existing resume.
        </p>
        <div className="flex flex-wrap gap-3 mb-4">
          <Button
            onClick={generateTemplateFromCurrent}
            disabled={isGenerating}
            className="bg-primary-500 hover:bg-primary-600 text-white"
          >
            {isGenerating
              ? 'Generating...'
              : 'Generate Template from Current Input'}
          </Button>
          <Button
            onClick={() => setTemplate(defaultTemplate)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700"
          >
            Reset to Default
          </Button>
        </div>
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

          <div className="flex justify-end gap-4">
            <Button
              onClick={handleSaveTemplate}
              className="bg-primary-500 hover:bg-primary-600 text-primary-foreground"
            >
              Save Template
            </Button>
          </div>

          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-md">
            <h3 className="font-medium text-gray-700 mb-2">
              How to Prepare Your Resume Template
            </h3>
            <div className="text-sm text-gray-600 space-y-3">
              <p>You can prepare your resume template in several ways:</p>
              <ol className="list-decimal pl-5 space-y-2">
                <li>
                  <strong>Generate from current input</strong>: Enter your
                  existing resume text or a LaTeX template, then click the
                  "Generate Template from Current Input" button to automatically
                  create or improve your template.
                </li>
                <li>
                  <strong>Use the default template</strong>: Click the "Reset to
                  Default" button to use our professional template.
                </li>
                <li>
                  <strong>Customize the template</strong>: If you're familiar
                  with LaTeX, you can directly edit the template code above to
                  customize your resume style. The template uses
                  Handlebars-style syntax (e.g.,{' '}
                  <code className="bg-gray-100 px-1 rounded">{'{{name}}'}</code>
                  ) for variable substitution.
                </li>
              </ol>
              <p className="mt-2">
                <strong>Tip</strong>: If you use a custom template, make sure to
                include variables like name, email, phone, skills, education,
                experience, etc., so the system can correctly populate your
                personal information.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ResumeTemplateEditor;
