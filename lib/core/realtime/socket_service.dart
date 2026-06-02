import 'dart:async';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/storage_service.dart';
import '../constants/api_endpoints.dart';

class SocketEvent {
  final String eventName;
  final dynamic data;

  SocketEvent({required this.eventName, required this.data});
}

class SocketService {
  late IO.Socket socket;
  late StreamController<SocketEvent> _eventController;
  final StorageService _storageService = StorageService();
  bool _isConnected = false;
  bool _isConnecting = false;

  Stream<SocketEvent> get eventStream => _eventController.stream;
  bool get isConnected => _isConnected;

  SocketService() {
    _eventController = StreamController<SocketEvent>.broadcast();
  }

  Future<void> connect() async {
    if (_isConnected || _isConnecting) return;
    _isConnecting = true;

    try {
      final token = await _storageService.read('jwt_token');
      if (token == null) {
        throw Exception('No JWT token found');
      }

      socket = IO.io(
        ApiEndpoints.baseUrl,
        IO.OptionBuilder()
            .setTransports(['websocket'])
            .disableAutoConnect()
            .setAuth({
              'token': token,
            })
            .build(),
      );

      // Connection events
      socket.onConnect((_) {
        _isConnected = true;
        _isConnecting = false;
        _eventController.add(SocketEvent(
          eventName: 'connected',
          data: null,
        ));
      });

      socket.onDisconnect((_) {
        _isConnected = false;
        _eventController.add(SocketEvent(
          eventName: 'disconnected',
          data: null,
        ));
        _attemptReconnect();
      });

      // Service request events
      socket.on('request_created', (data) {
        _eventController.add(SocketEvent(
          eventName: 'request_created',
          data: data,
        ));
      });

      socket.on('request_broadcast', (data) {
        _eventController.add(SocketEvent(
          eventName: 'request_broadcast',
          data: data,
        ));
      });

      socket.on('bid_submitted', (data) {
        _eventController.add(SocketEvent(
          eventName: 'bid_submitted',
          data: data,
        ));
      });

      socket.on('bid_received', (data) {
        _eventController.add(SocketEvent(
          eventName: 'bid_received',
          data: data,
        ));
      });

      socket.on('bid_selected', (data) {
        _eventController.add(SocketEvent(
          eventName: 'bid_selected',
          data: data,
        ));
      });

      socket.on('request_assigned', (data) {
        _eventController.add(SocketEvent(
          eventName: 'request_assigned',
          data: data,
        ));
      });

      socket.on('request_rejected', (data) {
        _eventController.add(SocketEvent(
          eventName: 'request_rejected',
          data: data,
        ));
      });

      socket.on('request_completed', (data) {
        _eventController.add(SocketEvent(
          eventName: 'request_completed',
          data: data,
        ));
      });

      socket.on('request_cancelled', (data) {
        _eventController.add(SocketEvent(
          eventName: 'request_cancelled',
          data: data,
        ));
      });

      // Error handling
      socket.onConnectError((error) {
        _isConnecting = false;
        _eventController.add(SocketEvent(
          eventName: 'error',
          data: error,
        ));
      });

      socket.connect();
    } catch (e) {
      _isConnecting = false;
      _eventController.add(SocketEvent(
        eventName: 'error',
        data: e.toString(),
      ));
    }
  }

  void _attemptReconnect() {
    Future.delayed(const Duration(seconds: 3), () {
      if (!_isConnected) {
        connect();
      }
    });
  }

  void disconnect() {
    _isConnected = false;
    socket.disconnect();
  }

  void dispose() {
    disconnect();
    _eventController.close();
  }
}

// Riverpod Provider
final socketServiceProvider = Provider<SocketService>((ref) {
  final service = SocketService();
  ref.onDispose(() {
    service.dispose();
  });
  return service;
});

// Connected state provider
final socketConnectedProvider = StreamProvider<bool>((ref) async* {
  final socketService = ref.watch(socketServiceProvider);
  
  // Connect on first access
  if (!socketService.isConnected) {
    await socketService.connect();
  }

  yield socketService.isConnected;

  // Yield stream updates
  await for (final event in socketService.eventStream) {
    if (event.eventName == 'connected') {
      yield true;
    } else if (event.eventName == 'disconnected') {
      yield false;
    }
  }
});

// Socket events stream provider
final socketEventsProvider = StreamProvider<SocketEvent>((ref) async* {
  final socketService = ref.watch(socketServiceProvider);
  
  // Ensure connected
  if (!socketService.isConnected) {
    await socketService.connect();
  }

  yield* socketService.eventStream;
});

// Filtered event provider for specific event names
final socketEventFilterProvider = StreamProvider.family<dynamic, String>((ref, eventName) async* {
  await for (final event in ref.watch(socketEventsProvider).stream) {
    if (event.eventName == eventName) {
      yield event.data;
    }
  }
});
