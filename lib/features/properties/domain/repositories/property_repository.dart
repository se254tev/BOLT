import '../entities/property.dart';

abstract class PropertyRepository {
  Future<List<Property>> fetchProperties({String? query});
  Future<Property> getPropertyById(String id);
}
