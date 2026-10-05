import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { AuthProvider } from './context/AuthContext';
import { RecruitmentProvider } from './context/RecruitmentContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <RecruitmentProvider>
        <App />
      </RecruitmentProvider>
    </AuthProvider>
  </React.StrictMode>
);
