import axios from 'axios';

const API_URL = '/api/auth';

// Set auth token
const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

// Register user
const register = async (userData) => {
  const response = await axios.post(`${API_URL}/register`, userData);
  if (response.data.token) {
    setAuthToken(response.data.token);
  }
  return response;
};

// Login user
const login = async (userData) => {
  const response = await axios.post(`${API_URL}/login`, userData);
  if (response.data.token) {
    setAuthToken(response.data.token);
  }
  return response;
};

// Load user
const loadUser = async () => {
  const response = await axios.get(`${API_URL}/me`);
  return response;
};

// Update profile
const updateProfile = async (profileData) => {
  const response = await axios.put(`${API_URL}/profile`, profileData);
  return response;
};

// Logout user
const logout = () => {
  localStorage.removeItem('token');
  setAuthToken();
};

const authService = {
  register,
  login,
  logout,
  loadUser,
  updateProfile,
  setAuthToken
};

export default authService;
