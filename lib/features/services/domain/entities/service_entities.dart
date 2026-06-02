enum ServiceType { ride, errand }

enum RequestStatus { open, bidding, assigned, completed, cancelled }

enum UserRole { buyer, rider, shopper, admin }

class ServiceRequest {
  final String id;
  final String userId;
  final ServiceType type;
  final RequestStatus status;
  final String title;
  final String? description;
  final double? price;
  final Map<String, dynamic>? location;
  final DateTime createdAt;
  final DateTime? completedAt;
  final String? assignedWorkerId;

  ServiceRequest({
    required this.id,
    required this.userId,
    required this.type,
    required this.status,
    required this.title,
    this.description,
    this.price,
    this.location,
    required this.createdAt,
    this.completedAt,
    this.assignedWorkerId,
  });

  factory ServiceRequest.fromJson(Map<String, dynamic> json) {
    return ServiceRequest(
      id: json['_id'] as String,
      userId: json['userId'] as String,
      type: ServiceType.values.firstWhere(
        (e) => e.name == (json['type'] as String).toLowerCase(),
        orElse: () => ServiceType.errand,
      ),
      status: RequestStatus.values.firstWhere(
        (e) => e.name == (json['status'] as String).toLowerCase(),
        orElse: () => RequestStatus.open,
      ),
      title: json['title'] as String,
      description: json['description'] as String?,
      price: json['price'] != null ? (json['price'] as num).toDouble() : null,
      location: json['location'] as Map<String, dynamic>?,
      createdAt: DateTime.parse(json['createdAt'] as String),
      completedAt: json['completedAt'] != null ? DateTime.parse(json['completedAt'] as String) : null,
      assignedWorkerId: json['assignedWorkerId'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'type': type.name,
        'title': title,
        'description': description,
        'price': price,
        'location': location,
      };
}

class ServiceBid {
  final String id;
  final String requestId;
  final String workerId;
  final double price;
  final String? message;
  final double? rating;
  final int? completedJobs;
  final String? vehicleType;
  final String? workerName;
  final String? workerImage;
  final DateTime createdAt;

  ServiceBid({
    required this.id,
    required this.requestId,
    required this.workerId,
    required this.price,
    this.message,
    this.rating,
    this.completedJobs,
    this.vehicleType,
    this.workerName,
    this.workerImage,
    required this.createdAt,
  });

  factory ServiceBid.fromJson(Map<String, dynamic> json) {
    return ServiceBid(
      id: json['_id'] as String,
      requestId: json['requestId'] as String,
      workerId: json['workerId'] as String,
      price: (json['price'] as num).toDouble(),
      message: json['message'] as String?,
      rating: json['rating'] != null ? (json['rating'] as num).toDouble() : null,
      completedJobs: json['completedJobs'] as int?,
      vehicleType: json['vehicleType'] as String?,
      workerName: json['workerName'] as String?,
      workerImage: json['workerImage'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }

  Map<String, dynamic> toJson() => {
        'requestId': requestId,
        'price': price,
        'message': message,
        'vehicleType': vehicleType,
      };
}

class ServiceReview {
  final String id;
  final String requestId;
  final String reviewerId;
  final String revieweeId;
  final double rating;
  final String? comment;
  final DateTime createdAt;

  ServiceReview({
    required this.id,
    required this.requestId,
    required this.reviewerId,
    required this.revieweeId,
    required this.rating,
    this.comment,
    required this.createdAt,
  });

  factory ServiceReview.fromJson(Map<String, dynamic> json) {
    return ServiceReview(
      id: json['_id'] as String,
      requestId: json['requestId'] as String,
      reviewerId: json['reviewerId'] as String,
      revieweeId: json['revieweeId'] as String,
      rating: (json['rating'] as num).toDouble(),
      comment: json['comment'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }

  Map<String, dynamic> toJson() => {
        'requestId': requestId,
        'revieweeId': revieweeId,
        'rating': rating,
        'comment': comment,
      };
}
