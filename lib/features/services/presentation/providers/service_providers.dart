import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:bolt_marketplace/core/network/dio_client.dart';
import '../../data/datasources/services_remote_data_source.dart';
import '../../domain/entities/service_entities.dart';

// Data source provider
final servicesRemoteDataSourceProvider = Provider<ServicesRemoteDataSource>((ref) {
  final dioClient = DioClient();
  return ServicesRemoteDataSource(dioClient.dio);
});

// Create ride request
final createRideRequestProvider = FutureProvider.family<ServiceRequest, ({
  String title,
  String? description,
  Map<String, dynamic> pickupLocation,
  Map<String, dynamic> dropoffLocation,
  double estimatedPrice,
})>((ref, params) async {
  final dataSource = ref.watch(servicesRemoteDataSourceProvider);
  return dataSource.createRideRequest(
    title: params.title,
    description: params.description,
    pickupLocation: params.pickupLocation,
    dropoffLocation: params.dropoffLocation,
    estimatedPrice: params.estimatedPrice,
  );
});

// Create errand request
final createErrandRequestProvider = FutureProvider.family<ServiceRequest, ({
  String title,
  String? description,
  Map<String, dynamic> location,
  double estimatedPrice,
  String category,
})>((ref, params) async {
  final dataSource = ref.watch(servicesRemoteDataSourceProvider);
  return dataSource.createErrandRequest(
    title: params.title,
    description: params.description,
    location: params.location,
    estimatedPrice: params.estimatedPrice,
    category: params.category,
  );
});

// Get user requests (buyer side)
final userServiceRequestsProvider = FutureProvider.family<List<ServiceRequest>, ({
  String userId,
  String? type,
  String? status,
})>((ref, params) async {
  final dataSource = ref.watch(servicesRemoteDataSourceProvider);
  return dataSource.getUserRequests(
    userId: params.userId,
    type: params.type,
    status: params.status,
  );
});

// Get available requests for workers
final workerAvailableRequestsProvider = FutureProvider.family<List<ServiceRequest>, String?>((ref, type) async {
  final dataSource = ref.watch(servicesRemoteDataSourceProvider);
  return dataSource.getWorkerAvailableRequests(type: type);
});

// Get request details
final serviceRequestProvider = FutureProvider.family<ServiceRequest, String>((ref, requestId) async {
  final dataSource = ref.watch(servicesRemoteDataSourceProvider);
  return dataSource.getRequestById(requestId);
});

// Get bids for a request
final requestBidsProvider = FutureProvider.family<List<ServiceBid>, String>((ref, requestId) async {
  final dataSource = ref.watch(servicesRemoteDataSourceProvider);
  return dataSource.getRequestBids(requestId);
});

// Submit bid
final submitBidProvider = FutureProvider.family<ServiceBid, ({
  String requestId,
  double price,
  String? message,
  String? vehicleType,
})>((ref, params) async {
  final dataSource = ref.watch(servicesRemoteDataSourceProvider);
  return dataSource.submitBid(
    requestId: params.requestId,
    price: params.price,
    message: params.message,
    vehicleType: params.vehicleType,
  );
});

// Select bid
final selectBidProvider = FutureProvider.family<ServiceRequest, ({
  String requestId,
  String bidId,
})>((ref, params) async {
  final dataSource = ref.watch(servicesRemoteDataSourceProvider);
  return dataSource.selectBid(
    requestId: params.requestId,
    bidId: params.bidId,
  );
});

// Cancel request
final cancelRequestProvider = FutureProvider.family<ServiceRequest, (String, String?)>((ref, params) async {
  final dataSource = ref.watch(servicesRemoteDataSourceProvider);
  return dataSource.cancelRequest(params.$1, reason: params.$2);
});

// Complete request
final completeRequestProvider = FutureProvider.family<ServiceRequest, String>((ref, requestId) async {
  final dataSource = ref.watch(servicesRemoteDataSourceProvider);
  return dataSource.completeRequest(requestId);
});

// Submit review
final submitReviewProvider = FutureProvider.family<ServiceReview, ({
  String requestId,
  String revieweeId,
  double rating,
  String? comment,
})>((ref, params) async {
  final dataSource = ref.watch(servicesRemoteDataSourceProvider);
  return dataSource.submitReview(
    requestId: params.requestId,
    revieweeId: params.revieweeId,
    rating: params.rating,
    comment: params.comment,
  );
});

// Worker registration
final registerWorkerProvider = FutureProvider.family<Map<String, dynamic>, ({
  String role,
  List<String> serviceTypes,
  String? vehicleType,
  String? vehicleNumber,
})>((ref, params) async {
  final dataSource = ref.watch(servicesRemoteDataSourceProvider);
  return dataSource.registerWorker(
    role: params.role,
    serviceTypes: params.serviceTypes,
    vehicleType: params.vehicleType,
    vehicleNumber: params.vehicleNumber,
  );
});

// Worker profile
final workerProfileProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final dataSource = ref.watch(servicesRemoteDataSourceProvider);
  return dataSource.getWorkerProfile();
});

// Update worker status
final updateWorkerStatusProvider = FutureProvider.family<Map<String, dynamic>, String>((ref, status) async {
  final dataSource = ref.watch(servicesRemoteDataSourceProvider);
  return dataSource.updateWorkerStatus(status);
});

// Currently viewed request (for detail pages)
final selectedServiceRequestProvider = StateProvider<ServiceRequest?>((ref) => null);

// Currently selected bid (for showing selected worker)
final selectedBidProvider = StateProvider<ServiceBid?>((ref) => null);

// Refresh requests
final refreshUserRequestsProvider = FutureProvider.family<void, String>((ref, userId) async {
  ref.invalidate(userServiceRequestsProvider);
});

// Refresh available requests
final refreshAvailableRequestsProvider = FutureProvider.family<void, String?>((ref, type) async {
  ref.invalidate(workerAvailableRequestsProvider);
});
