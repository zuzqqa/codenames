export const apiUrl = import.meta.env.VITE_BACKEND_API_URL;
export const socketUrl = import.meta.env.VITE_SOCKET_IO_SERVER;
export const peerUrl = import.meta.env.VITE_PEERSERVER;
export const secure = import.meta.env.VITE_SECURE_COOKIES === 'true' ? 'secure; samesite=none;' : '';
