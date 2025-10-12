import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Import the main application component

// This file serves as the official entry point for create-react-app.
// It initializes the React application and mounts the main App component
// to the 'root' element in public/index.html.

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
