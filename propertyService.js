import axios from 'axios';

const API_URL = '/api/properties';

// Get all properties
const getProperties = async (params = {}) => {
  const response = await axios.get(API_URL, { params });
  return response;
};

// Get single property
const getProperty = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response;
};

// Create property
const createProperty = async (formData) => {
  const response = await axios.post(API_URL, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response;
};

// Update property
const updateProperty = async (id, formData) => {
  const response = await axios.put(`${API_URL}/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response;
};

// Delete property
const deleteProperty = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response;
};

// Get user's properties
const getMyProperties = async () => {
  const response = await axios.get(`${API_URL}/owner/my-properties`);
  return response;
};

const propertyService = {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  getMyProperties
};

export default propertyService;
