import * as React from 'react';
import { createRoot } from 'react-dom/client';

import '../global.css';
import Options from '@/components/options';

try {
  const container = document.getElementById('options-root');
  const root = createRoot(container); 
  root.render(<Options />);
} catch (error) {
  console.error('Error rendering Options:', error);
}
