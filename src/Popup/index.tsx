import * as React from 'react';
import { createRoot } from 'react-dom/client';
import '../global.css';
import Popup from '@/components/popup';

try {
  const container = document.getElementById('popup-root');
  if (container) {
    const root = createRoot(container);
    root.render(<Popup />);
  }
} catch (error) {
  console.error('Error rendering Popup:', error);
}
