import React, { ReactNode } from 'react';
import ErrorBoundary from './ErrorBoundary';

interface SafeComponentProps {
  children: ReactNode;
  fallback?: ReactNode;
  showDetails?: boolean;
}

const SafeComponent: React.FC<SafeComponentProps> = ({ 
  children, 
  fallback,
  showDetails = false 
}) => {
  const defaultFallback = (
    <div className="alert alert-warning d-flex align-items-center" role="alert">
      <i className="fas fa-exclamation-triangle me-2"></i>
      <div>
        This component could not load properly. Please try refreshing the page.
      </div>
    </div>
  );

  return (
    <ErrorBoundary 
      fallback={fallback || defaultFallback} 
      showDetails={showDetails}
    >
      {children}
    </ErrorBoundary>
  );
};

export default SafeComponent;