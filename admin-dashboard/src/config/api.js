const DEFAULT_API_BASE_URL = 'https://bolt-nv0u.onrender.com';
const API_BASE_URL = import.meta.env.VITE_API_URL || DEFAULT_API_BASE_URL;

export default API_BASE_URL;
