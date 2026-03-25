const DEFAULT_API_URL = 'https://quarta-colonia-755008866679.southamerica-east1.run.app';

export const getApiBaseUrl = () => (import.meta.env.VITE_API_URL ?? DEFAULT_API_URL).replace(/\/+$/, '');
