
import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchCurrentUser, logout } from '../store/slices/authSlice';

interface ReduxAuthProviderProps {
  children: React.ReactNode;
}

export const ReduxAuthProvider: React.FC<ReduxAuthProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { token, user, isLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Initialize auth state on app load - only fetch if we have a token and no user data yet
    if (token && !user && !isLoading) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, token, user, isLoading]);

  return <>{children}</>;
};
