
import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchCurrentUser } from '../store/slices/authSlice';

interface ReduxAuthProviderProps {
  children: React.ReactNode;
}

export const ReduxAuthProvider: React.FC<ReduxAuthProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { token, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Initialize auth state on app load
    if (token && !user) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, token, user]);


  return <>{children}</>;
};
