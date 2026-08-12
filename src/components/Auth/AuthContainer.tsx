import React from 'react';
import './Auth.css';

interface AuthContainerProps {
  children: React.ReactNode;
}

export const AuthContainer: React.FC<AuthContainerProps> = ({ children }) => {
  return (
    <div className="auth-page">
      <main className="auth-main">
        <div className="container auth-container">
          <div className="auth-card">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};
