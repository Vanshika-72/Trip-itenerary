import { useSelector, useDispatch } from 'react-redux';
import { loginUser, registerUser, logoutUser, clearError } from '../store/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.auth);

  return {
    user,
    isAuthenticated: Boolean(user),
    loading,
    error,
    login: (credentials) => dispatch(loginUser(credentials)).unwrap(),
    register: (userData) => dispatch(registerUser(userData)).unwrap(),
    logout: () => dispatch(logoutUser()),
    clearAuthError: () => dispatch(clearError()),
  };
};

export default useAuth;
