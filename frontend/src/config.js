// Configuration for different environments
const config = {
  // API URL based on environment
  apiUrl: import.meta.env.VITE_API_URL || '/api',
  
  // Other configuration options
  appName: 'RepoX',
  defaultPageSize: 10,
};

export default config;
