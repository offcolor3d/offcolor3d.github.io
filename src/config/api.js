const API_BASE_URL = import.meta.env.PUBLIC_API_BASE_URL;

export const ENDPOINTS = {
    products: {
        getAll: `${API_BASE_URL}/products`,
        getById: (id) => `${API_BASE_URL}/products/${id}`,
        priceOf: `${API_BASE_URL}/products/priceof`,
    },
}