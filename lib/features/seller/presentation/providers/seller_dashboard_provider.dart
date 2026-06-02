import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:bolt_marketplace/core/providers.dart';
import '../../domain/entities/seller_dashboard.dart';

final sellerDashboardControllerProvider = StateNotifierProvider<SellerDashboardController, AsyncValue<SellerDashboard>>(
  (ref) => SellerDashboardController(ref),
);

class SellerDashboardController extends StateNotifier<AsyncValue<SellerDashboard>> {
  final Ref ref;

  SellerDashboardController(this.ref) : super(const AsyncValue.loading()) {
    loadDashboard();
  }

  Future<void> loadDashboard() async {
    state = const AsyncValue.loading();
    try {
      final repository = ref.read(sellerRepositoryProvider);
      final dashboard = await repository.fetchDashboard();
      state = AsyncValue.data(dashboard);
    } catch (e, stackTrace) {
      state = AsyncValue.error(e, stackTrace);
    }
  }
}
