import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

interface ErrorPageProps {
  error?: string;
  message?: string;
}

const ErrorPage: React.FC<ErrorPageProps> = ({ 
  error = "Internal Server Error",
  message = "An unexpected error occurred on the server."
}) => {
  const navigate = useNavigate();

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="text-center">
        <div className="mb-4">
          <AlertTriangle size={64} className="text-danger mb-3" />
          <h1 className="display-4 fw-bold text-danger">500</h1>
          <h2 className="h4 mb-3">{error}</h2>
          <p className="text-muted mb-4">
            {message}
          </p>
        </div>
        
        <div className="d-flex gap-3 justify-content-center">
          <button 
            className="btn btn-primary d-flex align-items-center"
            onClick={() => navigate('/')}
          >
            <Home size={16} className="me-2" />
            Go Home
          </button>
          <button 
            className="btn btn-outline-secondary d-flex align-items-center"
            onClick={handleRefresh}
          >
            <RefreshCw size={16} className="me-2" />
            Refresh Page
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;