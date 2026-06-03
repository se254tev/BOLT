const { Server } = require('socket.io');

let ioInstance = null;

const initRealtimeGateway = (server) => {
  if (ioInstance) return ioInstance;

  const io = new Server(server, {
    cors: {
      origin: true,
      methods: ['GET', 'POST'],
    },
    path: '/socket.io',
  });

  io.on('connection', (socket) => {
    socket.on('join_rooms', (payload) => {
      if (!payload || typeof payload !== 'object') return;
      const { userId, workerId, requestId, role } = payload;
      if (userId) socket.join(`user:${userId}`);
      if (workerId) socket.join(`worker:${workerId}`);
      if (requestId) socket.join(`request:${requestId}`);
      if (role) {
        socket.join(`worker:role:${role}`);
        if (role === 'admin') socket.join('admin');
      }
      socket.emit('connected', { message: 'Realtime service gateway connected' });
    });

    socket.on('join_request', ({ requestId }) => {
      if (requestId) {
        socket.join(`request:${requestId}`);
      }
    });

    socket.on('disconnect', () => {
      // no-op; socket.io room cleanup is automatic
    });
  });

  ioInstance = io;
  return io;
};

const getRealtimeServer = () => ioInstance;

const emitToRoom = (room, event, payload) => {
  const io = getRealtimeServer();
  if (!io) return;
  io.to(room).emit(event, payload);
};

const emitToUser = (userId, event, payload) => emitToRoom(`user:${userId}`, event, payload);
const emitToWorker = (workerId, event, payload) => emitToRoom(`worker:${workerId}`, event, payload);
const emitToWorkerRole = (role, event, payload) => emitToRoom(`worker:role:${role}`, event, payload);
const emitToRequestRoom = (requestId, event, payload) => emitToRoom(`request:${requestId}`, event, payload);
const emitToAdmins = (event, payload) => emitToRoom('admin', event, payload);

module.exports = {
  initRealtimeGateway,
  getRealtimeServer,
  emitToUser,
  emitToWorker,
  emitToWorkerRole,
  emitToRequestRoom,
  emitToAdmins,
};
