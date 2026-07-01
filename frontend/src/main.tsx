import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import { store } from './store/store.js';
import { AuthProvider } from './context/AuthContext.jsx';
import { MallProvider } from './context/MallContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';
import './index.css';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <MallProvider>
            <NotificationProvider>
              <App />
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3500,
                  style: {
                    borderRadius: '10px',
                  },
                }}
              />
            </NotificationProvider>
          </MallProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </Provider>
);
