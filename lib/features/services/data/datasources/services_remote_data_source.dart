import 'package:dio/dio.dart';
import 'package:bolt_marketplace/core/constants/api_endpoints.dart';
import '../../domain/entities/service_entities.dart';

class ServicesRemoteDataSource {
  final Dio dio;

  ServicesRemoteDataSource(this.dio);

  // Create ride request
  Future<ServiceRequest> createRideRequest({
    required String title,
    required String? description,
    required Map<String, dynamic> pickupLocation,
    required Map<String, dynamic> dropoffLocation,
    required double estimatedPrice,
  }) async {
    final response = await dio.post(
      '${ApiEndpoints.services}/requests/rides',
      data: {
        'title': title,
        'description': description,
        'pickupLocation': pickupLocation,
        'dropoffLocation': dropoffLocation,
        'estimatedPrice': estimatedPrice,
      },
    );
    return ServiceRequest.fromJson(response.data['data']['request']);
  }

  // Create errand request
  Future<ServiceRequest> createErrandRequest({
    required String title,
    required String? description,
    required Map<String, dynamic> location,
    required double estimatedPrice,
    required String category,
  }) async {
    final response = await dio.post(
      '${ApiEndpoints.services}/requests/errands',
      data: {
        'title': title,
        'description': description,
        'location': location,
        'estimatedPrice': estimatedPrice,
        'category': category,
      },
    );
    return ServiceRequest.fromJson(response.data['data']['request']);
  }

  // Get request by ID
  Future<ServiceRequest> getRequestById(String requestId) async {
    final response = await dio.get('${ApiEndpoints.services}/requests/$requestId');
    return ServiceRequest.fromJson(response.data['data']['request']);
  }

  // Get user's requests (buyer or worker)
  Future<List<ServiceRequest>> getUserRequests({
    required String userId,
    String? type,
    String? status,
  }) async {
    final params = {
      'userId': userId,
      if (type != null) 'type': type,
      if (status != null) 'status': status,
    };
    final response = await dio.get(
      '${ApiEndpoints.services}/requests',
      queryParameters: params,
    );
    final requests = (response.data['data']['requests'] as List)
        .map((r) => ServiceRequest.fromJson(r as Map<String, dynamic>))
        .toList();
    return requests;
  }

  // Get requests available for worker (open/bidding)
  Future<List<ServiceRequest>> getWorkerAvailableRequests({String? type}) async {
    final params = {
      if (type != null) 'type': type,
      'status': 'open,bidding',
    };
    final response = await dio.get(
      '${ApiEndpoints.services}/requests/available',
      queryParameters: params,
    );
    final requests = (response.data['data']['requests'] as List)
        .map((r) => ServiceRequest.fromJson(r as Map<String, dynamic>))
        .toList();
    return requests;
  }

  // Get bids for a request
  Future<List<ServiceBid>> getRequestBids(String requestId) async {
    final response = await dio.get('${ApiEndpoints.services}/requests/$requestId/bids');
    final bids = (response.data['data']['bids'] as List)
        .map((b) => ServiceBid.fromJson(b as Map<String, dynamic>))
        .toList();
    return bids;
  }

  // Submit bid
  Future<ServiceBid> submitBid({
    required String requestId,
    required double price,
    String? message,
    String? vehicleType,
  }) async {
    final response = await dio.post(
      '${ApiEndpoints.services}/bids',
      data: {
        'requestId': requestId,
        'price': price,
        'message': message,
        'vehicleType': vehicleType,
      },
    );
    return ServiceBid.fromJson(response.data['data']['bid']);
  }

  // Select bid (accept worker)
  Future<ServiceRequest> selectBid({
    required String requestId,
    required String bidId,
  }) async {
    final response = await dio.post(
      '${ApiEndpoints.services}/requests/$requestId/select-bid',
      data: {
        'bidId': bidId,
      },
    );
    return ServiceRequest.fromJson(response.data['data']['request']);
  }

  // Reject bid
  Future<void> rejectBid({
    required String requestId,
    required String bidId,
  }) async {
    await dio.post(
      '${ApiEndpoints.services}/requests/$requestId/reject-bid',
      data: {
        'bidId': bidId,
      },
    );
  }

  // Complete request
  Future<ServiceRequest> completeRequest(String requestId) async {
    final response = await dio.post(
      '${ApiEndpoints.services}/requests/$requestId/complete',
    );
    return ServiceRequest.fromJson(response.data['data']['request']);
  }

  // Cancel request
  Future<ServiceRequest> cancelRequest(String requestId, {String? reason}) async {
    final response = await dio.post(
      '${ApiEndpoints.services}/requests/$requestId/cancel',
      data: {
        if (reason != null) 'reason': reason,
      },
    );
    return ServiceRequest.fromJson(response.data['data']['request']);
  }

  // Submit review
  Future<ServiceReview> submitReview({
    required String requestId,
    required String revieweeId,
    required double rating,
    String? comment,
  }) async {
    final response = await dio.post(
      '${ApiEndpoints.services}/reviews',
      data: {
        'requestId': requestId,
        'revieweeId': revieweeId,
        'rating': rating,
        'comment': comment,
      },
    );
    return ServiceReview.fromJson(response.data['data']['review']);
  }

  // Register as worker
  Future<Map<String, dynamic>> registerWorker({
    required String role,
    required List<String> serviceTypes,
    String? vehicleType,
    String? vehicleNumber,
  }) async {
    final response = await dio.post(
      '${ApiEndpoints.services}/workers/register',
      data: {
        'role': role,
        'serviceTypes': serviceTypes,
        'vehicleType': vehicleType,
        'vehicleNumber': vehicleNumber,
      },
    );
    return response.data['data'] as Map<String, dynamic>;
  }

  // Get worker profile
  Future<Map<String, dynamic>> getWorkerProfile() async {
    final response = await dio.get('${ApiEndpoints.services}/workers/profile');
    return response.data['data'] as Map<String, dynamic>;
  }

  // Update worker status (online/offline)
  Future<Map<String, dynamic>> updateWorkerStatus(String status) async {
    final response = await dio.patch(
      '${ApiEndpoints.services}/workers/status',
      data: {'status': status},
    );
    return response.data['data'] as Map<String, dynamic>;
  }
}
