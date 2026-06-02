class User {
  final String id;
  final String name;
  final String email;
  final String phone;
  final String role;
  final String? sellerStatus;
  final String? profileImage;
  final DateTime createdAt;

  User({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
    required this.role,
    this.sellerStatus,
    this.profileImage,
    required this.createdAt,
  });
}
