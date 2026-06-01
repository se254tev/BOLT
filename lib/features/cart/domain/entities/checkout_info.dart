class CheckoutInfo {
  final String fullName;
  final String address;
  final String city;
  final String postalCode;
  final String phone;
  final String paymentMethod;

  const CheckoutInfo({
    required this.fullName,
    required this.address,
    required this.city,
    required this.postalCode,
    required this.phone,
    required this.paymentMethod,
  });

  factory CheckoutInfo.empty() => const CheckoutInfo(
        fullName: '',
        address: '',
        city: '',
        postalCode: '',
        phone: '',
        paymentMethod: 'Cash on Delivery',
      );

  CheckoutInfo copyWith({
    String? fullName,
    String? address,
    String? city,
    String? postalCode,
    String? phone,
    String? paymentMethod,
  }) {
    return CheckoutInfo(
      fullName: fullName ?? this.fullName,
      address: address ?? this.address,
      city: city ?? this.city,
      postalCode: postalCode ?? this.postalCode,
      phone: phone ?? this.phone,
      paymentMethod: paymentMethod ?? this.paymentMethod,
    );
  }

  Map<String, dynamic> toJson() => {
        'fullName': fullName,
        'address': address,
        'city': city,
        'postalCode': postalCode,
        'phone': phone,
        'paymentMethod': paymentMethod,
      };
}
