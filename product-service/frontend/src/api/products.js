import axios from 'axios';

const API_BASE_URL = '/api';

export const productsApi = {
  getAll: async () => {
    const response = await axios.get(`${API_BASE_URL}/products`);
    return response.data;
  },

  getById: async (id) => {
    const response = await axios.get(`${API_BASE_URL}/products/${id}`);
    return response.data;
  },

  create: async (productData) => {
    const response = await axios.post(`${API_BASE_URL}/products`, productData);
    return response.data;
  },

  update: async (id, productData) => {
    const response = await axios.put(`${API_BASE_URL}/products/${id}`, productData);
    return response.data;
  },

  delete: async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/products/${id}`);
    return response.data;
  },

  getLowStock: async () => {
    const response = await axios.get(`${API_BASE_URL}/products/low-stock`);
    return response.data;
  },

  getStats: async () => {
    const response = await axios.get(`${API_BASE_URL}/products/stats`);
    return response.data;
  }
};
