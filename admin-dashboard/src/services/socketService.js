import { io } from 'socket.io-client';
import API_BASE_URL from '../config/api';

const SOCKET_URL = API_BASE_URL;
let socket;

const initSocket = () => {
  if (socket) return socket;
  socket = io(SOCKET_URL, {
    path: '/socket.io',
    transports: ['websocket'],
    autoConnect: false,
  });
  return socket;
};

export const connectAdminSocket = () => {
  const socketClient = initSocket();
  if (!socketClient.connected) {
    socketClient.connect();
  }
  socketClient.on('connect_error', (error) => {
    console.error('Admin socket connection error:', error);
  });
  return socketClient;
};

export const subscribeToAdminEvents = (onEvent) => {
  const socketClient = connectAdminSocket();
  socketClient.emit('joinRoom', 'admin');
  socketClient.on('adminEvent', onEvent);
  socketClient.on('request_created', (payload) => onEvent({ type: 'request_created', payload }));
  socketClient.on('worker_registered', (payload) => onEvent({ type: 'worker_registered', payload }));
  socketClient.on('bid_submitted', (payload) => onEvent({ type: 'bid_submitted', payload }));
  socketClient.on('request_assigned', (payload) => onEvent({ type: 'request_assigned', payload }));
  socketClient.on('request_completed', (payload) => onEvent({ type: 'request_completed', payload }));
};

export const disconnectAdminSocket = () => {
  if (!socket) return;
  socket.disconnect();
  socket = null;
};
