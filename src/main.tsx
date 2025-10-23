import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';

import App from './app/App';
import { router } from './app/router';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <App>
    <RouterProvider router={router} />
  </App>,
);
