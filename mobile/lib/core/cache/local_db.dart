import 'dart:convert';
import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart' as p;

/// SQLite-backed local cache for offline support.
///
/// Tables:
///   cache_entries  — generic key/value store with expiry
///   sync_queue     — pending mutations to sync when back online
class LocalDb {
  static LocalDb? _instance;
  static Database? _db;

  LocalDb._();

  static LocalDb get instance {
    _instance ??= LocalDb._();
    return _instance!;
  }

  Future<Database> get db async {
    _db ??= await _open();
    return _db!;
  }

  Future<Database> _open() async {
    final dbPath = await getDatabasesPath();
    final path = p.join(dbPath, 'careerguide_cache.db');

    return openDatabase(
      path,
      version: 1,
      onCreate: (db, version) async {
        await db.execute('''
          CREATE TABLE cache_entries (
            key       TEXT PRIMARY KEY,
            value     TEXT NOT NULL,
            cached_at INTEGER NOT NULL,
            ttl_secs  INTEGER NOT NULL DEFAULT 3600
          )
        ''');

        await db.execute('''
          CREATE TABLE sync_queue (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            method     TEXT NOT NULL,
            endpoint   TEXT NOT NULL,
            payload    TEXT,
            created_at INTEGER NOT NULL
          )
        ''');
      },
    );
  }

  // ── Cache read/write ───────────────────────────────────────────────────────

  /// Store [value] under [key] with a time-to-live of [ttlSecs] seconds.
  Future<void> put(String key, dynamic value, {int ttlSecs = 3600}) async {
    final database = await db;
    await database.insert(
      'cache_entries',
      {
        'key': key,
        'value': jsonEncode(value),
        'cached_at': DateTime.now().millisecondsSinceEpoch ~/ 1000,
        'ttl_secs': ttlSecs,
      },
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  /// Retrieve cached value for [key]. Returns null if missing or expired.
  Future<dynamic> get(String key) async {
    final database = await db;
    final rows = await database.query(
      'cache_entries',
      where: 'key = ?',
      whereArgs: [key],
      limit: 1,
    );
    if (rows.isEmpty) return null;

    final row = rows.first;
    final cachedAt = row['cached_at'] as int;
    final ttl = row['ttl_secs'] as int;
    final now = DateTime.now().millisecondsSinceEpoch ~/ 1000;

    if (now - cachedAt > ttl) {
      // Expired — delete and return null
      await database
          .delete('cache_entries', where: 'key = ?', whereArgs: [key]);
      return null;
    }

    return jsonDecode(row['value'] as String);
  }

  /// Delete a specific cache entry.
  Future<void> delete(String key) async {
    final database = await db;
    await database.delete('cache_entries', where: 'key = ?', whereArgs: [key]);
  }

  /// Clear all cache entries.
  Future<void> clearAll() async {
    final database = await db;
    await database.delete('cache_entries');
  }

  // ── Sync queue ─────────────────────────────────────────────────────────────

  /// Enqueue a mutation to be synced when connectivity is restored.
  Future<void> enqueueSync({
    required String method,
    required String endpoint,
    Map<String, dynamic>? payload,
  }) async {
    final database = await db;
    await database.insert('sync_queue', {
      'method': method,
      'endpoint': endpoint,
      'payload': payload != null ? jsonEncode(payload) : null,
      'created_at': DateTime.now().millisecondsSinceEpoch ~/ 1000,
    });
  }

  /// Get all pending sync items ordered by creation time.
  Future<List<Map<String, dynamic>>> getPendingSyncs() async {
    final database = await db;
    return database.query('sync_queue', orderBy: 'created_at ASC');
  }

  /// Remove a sync item after it has been successfully synced.
  Future<void> removeSyncItem(int id) async {
    final database = await db;
    await database.delete('sync_queue', where: 'id = ?', whereArgs: [id]);
  }

  /// Clear all pending sync items.
  Future<void> clearSyncQueue() async {
    final database = await db;
    await database.delete('sync_queue');
  }
}
