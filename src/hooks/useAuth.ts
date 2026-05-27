import { useAppSelector } from './store';

export const useAuth = () => {
  const { user, token, isLoading, error } = useAppSelector((state) => state.auth);
  return {
    user,
    token,
    isAuthenticated: !!token,
    isLoading,
    error,
  };
};
