import { render } from 'preact';
import { App } from './app.jsx';
import './css/variables.css';
import './css/base.css';
import './css/components.css';

render(<App />, document.getElementById('app'));

// Prevent pinch-zoom while interacting with form fields on mobile
document.addEventListener('touchstart', (e) => {
  if (e.touches.length > 1 && e.target.closest('input, textarea, select')) {
    e.preventDefault();
  }
}, { passive: false });
