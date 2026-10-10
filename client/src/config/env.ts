export const config = {
  apiUrl: import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api'),
  appName: import.meta.env.VITE_APP_NAME || 'Kampus.VC',
  isDev: import.meta.env.DEV,
};
