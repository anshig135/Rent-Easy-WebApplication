import React, { createContext, useContext, useReducer, useEffect } from 'react';
import authService from '../services/authService';

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true
};

// Create context
const AuthContext = createContext();

// Actions
const AUTH_ACTIONS = {
  USER_LOADED: 'USER_LOADED',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  AUTH_ERROR: 'AUTH_ERROR',
  LOGOUT: 'LOGOUT',
  CLEAR_ERRORS: 'CLEAR_ERRORS'
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.USER_LOADED:
      return {
        ...state,
        isAuthenticated: true,
        loading: false,
        user: action.payload
      };
    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.REGISTER_SUCCESS:
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        ...action.payload,
        isAuthenticated: true,
        loading: false
      };
    case AUTH_ACTIONS.AUTH_ERROR:
    case AUTH_ACTIONS.LOGOUT:
      localStorage.removeItem('token');
      return {
        ...state,
        token: null,
        isAuthenticated: false,
        loading: false,
        user: null
      };
    default:
      return state;
  }
};

// Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user
  const loadUser = async () => {
    if (localStorage.token) {
      authService.setAuthToken(localStorage.token);
    }

    try {
      const res = await authService.loadUser();
      dispatch({
        type: AUTH_ACTIONS.USER_LOADED,
        payload: res.data.user
      });
    } catch (err) {
      dispatch({ type: AUTH_ACTIONS.AUTH_ERROR });
    }
  };

  // Register user
  const register = async (userData) => {
    try {
      const res = await authService.register(userData);
      dispatch({
        type: AUTH_ACTIONS.REGISTER_SUCCESS,
        payload: res.data
      });
      loadUser();
      return res.data;
    } catch (err) {
      dispatch({ type: AUTH_ACTIONS.AUTH_ERROR });
      throw err.response.data;
    }
  };

  // Login user
  const login = async (userData) => {
    try {
      const res = await authService.login(userData);
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: res.data
      });
      loadUser();
      return res.data;
    } catch (err) {
      dispatch({ type: AUTH_ACTIONS.AUTH_ERROR });
      throw err.response.data;
    }
  };

  // Logout
  const logout = () => {
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  };

  // Update profile
  const updateProfile = async (profileData) => {
    try {
      const res = await authService.updateProfile(profileData);
      dispatch({
        type: AUTH_ACTIONS.USER_LOADED,
        payload: res.data.user
      });
      return res.data;
    } catch (err) {
      throw err.response.data;
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const value = {
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    loading: state.loading,
    register,
    login,
    logout,
    loadUser,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
