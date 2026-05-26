import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store/store';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'var(--bg-card)', color: 'var(--text)',
              border: '1px solid var(--border)', borderRadius: '12px',
              fontSize: '.875rem', fontWeight: '500', boxShadow: 'var(--shadow-lg)',
            },
          }}
        />
      </BrowserRouter>
    </Provider>
  </StrictMode>
);
