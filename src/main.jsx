import { createRoot } from 'react-dom/client';
import './index.css';
import Router from './routes.jsx';

createRoot(document.getElementById('applicationRoot')).render(<Router />);