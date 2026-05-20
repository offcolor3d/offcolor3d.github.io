const API_BASE_URL = 'https://api-n3a3.onrender.com/api';

export const ENDPOINTS = {
    products: {
        getAll: `${API_BASE_URL}/products`,
        getById: (id) => `${API_BASE_URL}/products/${id}`,
        priceOf: `${API_BASE_URL}/products/priceof`,
    },
}