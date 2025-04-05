/**
 * Overleaf integration utilities for resume generator
 */

/**
 * Opens a LaTeX resume in Overleaf editor
 *
 * @param latexContent The LaTeX content to open in Overleaf
 * @param fileName Optional file name (defaults to 'resume.tex')
 * @returns The URL of the newly created Overleaf document
 */
export function openInOverleaf(
  latexContent: string,
  fileName = 'resume.tex'
): string {
  // Encode the LaTeX content for URL
  const encodedSnippet = encodeURIComponent(latexContent);

  // Create form data
  const formData = new FormData();
  formData.append('encoded_snip', encodedSnippet);

  // Open in new tab
  const form = document.createElement('form');
  form.setAttribute('method', 'post');
  form.setAttribute('action', 'https://www.overleaf.com/docs');
  form.setAttribute('target', '_blank');

  // Create hidden input for encoded snippet
  const hiddenField = document.createElement('input');
  hiddenField.setAttribute('type', 'hidden');
  hiddenField.setAttribute('name', 'encoded_snip');
  hiddenField.setAttribute('value', encodedSnippet);

  // Optionally set filename
  if (fileName) {
    const nameField = document.createElement('input');
    nameField.setAttribute('type', 'hidden');
    nameField.setAttribute('name', 'snip_name');
    nameField.setAttribute('value', fileName);
  }

  // Add field to form
  form.appendChild(hiddenField);

  // Add form to body, submit, and remove
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);

  return 'https://www.overleaf.com/docs';
}

/**
 * Creates a direct link to open content in Overleaf
 *
 * @param latexContent The LaTeX content to include in the link
 * @returns A URL that will open the content in Overleaf
 */
export function getOverleafLinkForContent(latexContent: string): string {
  const encodedSnippet = encodeURIComponent(latexContent);
  return `https://www.overleaf.com/docs?encoded_snip=${encodedSnippet}`;
}

/**
 * Creates a button element that will open content in Overleaf when clicked
 *
 * @param latexContent The LaTeX content to open
 * @param buttonText Text to display on the button
 * @returns An HTML button element
 */
export function createOverleafButton(
  latexContent: string,
  buttonText = 'Open in Overleaf'
): HTMLButtonElement {
  const button = document.createElement('button');
  button.textContent = buttonText;
  button.className = 'overleaf-button';
  button.onclick = () => openInOverleaf(latexContent);
  return button;
}
