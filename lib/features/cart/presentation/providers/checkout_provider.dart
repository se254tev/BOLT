import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/checkout_info.dart';

final checkoutInfoProvider = StateProvider<CheckoutInfo>((ref) => CheckoutInfo.empty());
