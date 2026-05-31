import 'package:dio/dio.dart';
import 'package:dio_cookie_manager/dio_cookie_manager.dart';
import 'package:cookie_jar/cookie_jar.dart';
import '../constants/api_endpoints.dart';
import '../services/storage_service.dart';

class DioClient {
  late final Dio dio;

  DioClient() {
    final cookieJar = CookieJar();

    dio = Dio(BaseOptions(
      baseUrl: ApiEndpoints.baseUrl,
      connectTimeout: const Duration(seconds: 15),
      receiveTimeout: const Duration(seconds: 15),
      responseType: ResponseType.json,
      followRedirects: true,
    ));
    dio.interceptors.add(CookieManager(cookieJar));
    dio.interceptors.add(LogInterceptor(responseBody: true, requestBody: true));

    // Authorization interceptor and refresh logic
    dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final storage = StorageService();
        final token = await storage.read('jwt_token');
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        return handler.next(options);
      },
      onError: (err, handler) async {
        final response = err.response;
        if (response != null && response.statusCode == 401 && !err.requestOptions.extra.containsKey('retried')) {
          try {
            final refreshResp = await dio.post('${ApiEndpoints.auth}/refresh');
            final newAccess = refreshResp.data['accessToken'];
            if (newAccess != null) {
              final storage = StorageService();
              await storage.write('jwt_token', newAccess);
            }
            final opts = err.requestOptions;
            opts.extra['retried'] = true;
            final cloneReq = await dio.request(opts.path, options: Options(method: opts.method, headers: opts.headers), data: opts.data, queryParameters: opts.queryParameters);
            return handler.resolve(cloneReq);
          } catch (e) {
            final storage = StorageService();
            await storage.delete('jwt_token');
          }
        }
        return handler.next(err);
      },
    ));
  }
}
