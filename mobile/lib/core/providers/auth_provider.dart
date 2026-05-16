import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../models/user_model.dart';
import '../network/api_client.dart';
import '../constants/api_constants.dart';

// The current authenticated user
final authProvider =
    StateNotifierProvider<AuthNotifier, AsyncValue<UserModel?>>((ref) {
  return AuthNotifier(ref.read(apiClientProvider));
});

// Convenience: just the user object
final currentUserProvider = Provider<UserModel?>((ref) {
  return ref.watch(authProvider).valueOrNull;
});

class AuthNotifier extends StateNotifier<AsyncValue<UserModel?>> {
  final ApiClient _api;

  // Start with data(null) immediately — no loading state, no splash hang
  AuthNotifier(this._api) : super(const AsyncValue.data(null));

  Future<UserModel> login(String email, String password) async {
    state = const AsyncValue.loading();
    try {
      final response = await _api.post(
        ApiConstants.login,
        data: {'email': email, 'password': password},
      );
      final data = response.data;
      if (data['token'] != null) {
        await ApiClient.saveToken(data['token']);
      }
      final user = UserModel.fromJson(data['user']);
      state = AsyncValue.data(user);
      return user;
    } on DioException catch (e) {
      state = const AsyncValue.data(null);
      String msg;
      if (e.type == DioExceptionType.connectionTimeout ||
          e.type == DioExceptionType.receiveTimeout ||
          e.type == DioExceptionType.connectionError) {
        msg = 'Cannot connect to server. Make sure the backend is running.';
      } else {
        msg = e.response?.data?['error'] ?? e.message ?? 'Login failed';
      }
      throw Exception(msg);
    }
  }

  Future<UserModel> register(Map<String, dynamic> data) async {
    state = const AsyncValue.loading();
    try {
      final response = await _api.post(ApiConstants.register, data: data);
      final resData = response.data;
      if (resData['token'] != null) {
        await ApiClient.saveToken(resData['token']);
      }
      final user = UserModel.fromJson(resData['user']);
      state = AsyncValue.data(user);
      return user;
    } on DioException catch (e) {
      state = const AsyncValue.data(null);
      String msg;
      if (e.type == DioExceptionType.connectionTimeout ||
          e.type == DioExceptionType.receiveTimeout ||
          e.type == DioExceptionType.connectionError) {
        msg =
            'Cannot connect to server. Make sure the backend is running and the IP is correct.';
      } else {
        msg = e.response?.data?['error'] ?? e.message ?? 'Registration failed';
      }
      throw Exception(msg);
    }
  }

  Future<void> logout() async {
    try {
      await _api.post(ApiConstants.logout);
    } catch (_) {}
    await ApiClient.removeToken();
    state = const AsyncValue.data(null);
  }

  void updateUser(UserModel user) {
    state = AsyncValue.data(user);
  }
}
