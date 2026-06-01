const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  process.env.REACT_APP_API_URL ||
  'https://bolt-nv0u.onrender.com';

export default API_BASE_URL;
