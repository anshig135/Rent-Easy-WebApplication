import axios from 'axios';

const API_URL = '/api/bookings';

// Create booking
const createBooking = async (bookingData) => {
  const response = await axios.post(API_URL, bookingData);
  return response;
};

// Get user's bookings
const getBookings = async () => {
  const response = await axios.get(API_URL);
  return response;
};

// Get single booking
const getBooking = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response;
};

// Update booking status (for owners)
const updateBookingStatus = async (id, statusData) => {
  const response = await axios.put(`${API_URL}/${id}/status`, statusData);
  return response;
};

// Cancel booking (for renters)
const cancelBooking = async (id) => {
  const response = await axios.put(`${API_URL}/${id}/cancel`);
  return response;
};

// Get booking statistics (for owners)
const getBookingStats = async () => {
  const response = await axios.get(`${API_URL}/owner/stats`);
  return response;
};

const bookingService = {
  createBooking,
  getBookings,
  getBooking,
  updateBookingStatus,
  cancelBooking,
  getBookingStats
};

export default bookingService;
