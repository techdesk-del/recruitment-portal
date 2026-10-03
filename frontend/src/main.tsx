import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { RecruitmentProvider } from './context/RecruitmentContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RecruitmentProvider>
      <App />
    </RecruitmentProvider>
  </React.StrictMode>
);
