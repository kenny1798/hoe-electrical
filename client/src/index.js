import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './App.css';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import { AuthContextProvider } from './context/AuthContext';
import {ValidContextProvider} from './context/ValidContext';
import { AdminContextProvider } from './context/AdminContext';
import { PushStatusProvider } from './context/PushStatusContext';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AdminContextProvider>
    <AuthContextProvider>
      <ValidContextProvider>
        <PushStatusProvider>
      <Router>
       <App />
      </Router>
      </PushStatusProvider>
      </ValidContextProvider>
    </AuthContextProvider>
    </AdminContextProvider>
  </React.StrictMode>
);

serviceWorkerRegistration.register();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
