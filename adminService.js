import axios from 'axios';

const API_URL = '/api/admin';

// Get platform statistics
const getStats = async () => {
  const response = await axios.get(`${API_URL}/stats`);
  return response;
};

// Get all users
const getUsers = async (params = {}) => {
  const response = await axios.get(`${API_URL}/users`, { params });
  return response;
};

// Get single user
const getUser = async (id) => {
  const response = await axios.get(`${API_URL}/users/${id}`);
  return response;
};

// Update user status
const updateUserStatus = async (id, statusData) => {
  const response = await axios.put(`${API_URL}/users/${id}/status`, statusData);
  return response;
};

// Delete user
const deleteUser = async (id) => {
  const response = await axios.delete(`${API_URL}/users/${id}`);
  return response;
};

// Get all properties (including unapproved)
const getProperties = async (params = {}) => {
  const response = await axios.get(`${API_URL}/properties`, { params });
  return response;
};

// Update property approval status
const updatePropertyApproval = async (id, approvalData) => {
  const response = await axios.put(`${API_URL}/properties/${id}/approval`, approvalData);
  return response;
};

// Delete property
const deleteProperty = async (id) => {
  const response = await axios.delete(`${API_URL}/properties/${id}`);
  return response;
};

// Get all bookings
const getBookings = async (params = {}) => {
  const response = await axios.get(`${API_URL}/bookings`, { params });
  return response;
};

const adminService = {
  getStats,
  getUsers,
  getUser,
  updateUserStatus,
  deleteUser,
  getProperties,
  updatePropertyApproval,
  deleteProperty,
  getBookings
};

export default adminService;
