import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // এটি import করুন
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <BrowserRouter>  {/* এটি যোগ করুন */}
      <App />
    </BrowserRouter> {/* এটি যোগ করুন */}
  </React.StrictMode>
);