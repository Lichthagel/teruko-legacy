export const API_URL = import.meta.env.PROD ? "/graphql" : `${import.meta.env.VITE_BASE_URL}/graphql`;

export const IMG_BASE_URL = import.meta.env.PROD ? "/img" : `${import.meta.env.VITE_BASE_URL}/img`;
