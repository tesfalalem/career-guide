import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Provides a stream of connectivity status.
final connectivityProvider = StreamProvider<bool>((ref) {
  return Connectivity()
      .onConnectivityChanged
      .map((results) => results.any((r) => r != ConnectivityResult.none));
});

/// One-shot check — returns true if currently online.
Future<bool> isOnline() async {
  final results = await Connectivity().checkConnectivity();
  return results.any((r) => r != ConnectivityResult.none);
}
