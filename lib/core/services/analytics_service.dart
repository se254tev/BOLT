import 'package:bolt_marketplace/core/network/dio_client.dart';

class AnalyticsService {
  static Future<void> trackContactClick({required String productId, String? sellerId, required String type}) async {
    try {
      final dio = DioClient().dio;
      await dio.post('/api/analytics/contact-click', data: {
        'productId': productId,
        'sellerId': sellerId,
        'type': type,
        'timestamp': DateTime.now().toIso8601String(),
      });
    } catch (e) {
      // swallow errors to avoid breaking UX
    }
  }
}
