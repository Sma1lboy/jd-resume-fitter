import * as React from 'react';
import { createRoot } from 'react-dom/client';

import '../styles/tailwind.css';
import Options from './Options';

try {
  const container = document.getElementById('options-root');
  const root = createRoot(container); // createRoot(container!) if you use TypeScript
  root.render(<Options />);
} catch (error) {
  console.error('Error rendering Options:', error);
}
