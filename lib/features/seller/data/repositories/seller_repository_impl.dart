import '../../domain/entities/seller_dashboard.dart';
import '../../domain/repositories/seller_repository.dart';
import '../datasources/seller_remote_data_source.dart';

class SellerRepositoryImpl implements SellerRepository {
  final SellerRemoteDataSource remoteDataSource;

  SellerRepositoryImpl({required this.remoteDataSource});

  @override
  Future<SellerDashboard> fetchDashboard() async {
    return await remoteDataSource.fetchDashboard();
  }
}
