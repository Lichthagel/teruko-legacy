export const BASE_URL = import.meta.env.PROD ? "" : (import.meta.env.VITE_BASE_URL as string | undefined || "");

export const API_URL = `${BASE_URL}/graphql`;

export const IMG_BASE_URL = `${BASE_URL}/img`;
