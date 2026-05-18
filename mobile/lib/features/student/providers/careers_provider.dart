import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_client.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/models/career_model.dart';

/// Fetches published careers from the backend, supporting search and category filtering.
final careersProvider = FutureProvider.family<List<CareerModel>, String>((ref, filterKey) async {
  final api = ref.read(apiClientProvider);
  try {
    final parts = filterKey.split('::');
    final search = parts[0];
    final category = parts[1];

    final queryParams = <String, String>{};
    if (search.isNotEmpty) {
      queryParams['search'] = search;
    }
    if (category != 'All') {
      queryParams['category'] = category;
    }

    final res = await api.get(
      ApiConstants.careers,
      queryParameters: queryParams,
    );
    final list = res.data as List? ?? [];
    return list.map((c) => CareerModel.fromJson(c)).toList();
  } catch (_) {
    return [];
  }
});

/// Fetches distinct categories of published careers for dynamic filter chips.
final careerCategoriesProvider = FutureProvider<List<String>>((ref) async {
  final api = ref.read(apiClientProvider);
  try {
    final res = await api.get(ApiConstants.careerCategories);
    final list = res.data as List? ?? [];
    return list.map((c) => c.toString()).toList();
  } catch (_) {
    return [];
  }
});

/// Fetches the details of a single career by ID.
final careerDetailsProvider = FutureProvider.family<CareerModel, int>((ref, id) async {
  final api = ref.read(apiClientProvider);
  final res = await api.get('${ApiConstants.careers}/$id');
  return CareerModel.fromJson(res.data);
});
