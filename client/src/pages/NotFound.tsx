import React from 'react';
import { useLocation } from 'wouter';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound: React.FC = () => {
  const [, setLocation] = useLocation();

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light" data-testid="not-found-page">
      <div className="text-center">
        <div className="mb-4">
          <h1 className="display-1 fw-bold text-muted">404</h1>
          <h2 className="h4 mb-3">Page Not Found</h2>
          <p className="text-muted mb-4">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <div className="d-flex gap-3 justify-content-center">
          <button 
            className="btn btn-primary d-flex align-items-center"
            onClick={() => setLocation('/')}
          >
            <Home size={16} className="me-2" />
            Go Home
          </button>
          <button 
            className="btn btn-outline-secondary d-flex align-items-center"
            onClick={() => window.history.back()}
          >
            <ArrowLeft size={16} className="me-2" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;