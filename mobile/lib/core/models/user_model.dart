class UserModel {
  final String id;
  final String name;
  final String email;
  final String role; // student | teacher | admin | bit
  final String? academicYear;
  final List<String> enrolledPaths;
  final int xp;
  final int streak;
  final String accountStatus; // active | pending | rejected
  final String? profileImage;
  final String? department;
  final String? studentId;
  final String? institution;

  const UserModel({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    this.academicYear,
    this.enrolledPaths = const [],
    this.xp = 0,
    this.streak = 0,
    this.accountStatus = 'active',
    this.profileImage,
    this.department,
    this.studentId,
    this.institution,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id']?.toString() ?? '',
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      role: json['role'] ?? 'student',
      academicYear: json['academic_year'] ?? json['academicYear'],
      enrolledPaths: json['enrolledPaths'] != null
          ? List<String>.from(json['enrolledPaths'])
          : [],
      xp: int.tryParse(json['xp']?.toString() ?? '0') ?? 0,
      streak: int.tryParse(json['streak']?.toString() ?? '0') ?? 0,
      accountStatus: json['account_status'] ?? 'active',
      profileImage: json['profile_image'],
      department: json['department'],
      studentId: json['student_id'],
      institution: json['institution'],
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'email': email,
        'role': role,
        'academic_year': academicYear,
        'enrolledPaths': enrolledPaths,
        'xp': xp,
        'streak': streak,
        'account_status': accountStatus,
        'profile_image': profileImage,
        'department': department,
        'student_id': studentId,
        'institution': institution,
      };

  UserModel copyWith({
    String? name,
    String? academicYear,
    List<String>? enrolledPaths,
    int? xp,
    int? streak,
    String? profileImage,
  }) {
    return UserModel(
      id: id,
      name: name ?? this.name,
      email: email,
      role: role,
      academicYear: academicYear ?? this.academicYear,
      enrolledPaths: enrolledPaths ?? this.enrolledPaths,
      xp: xp ?? this.xp,
      streak: streak ?? this.streak,
      accountStatus: accountStatus,
      profileImage: profileImage ?? this.profileImage,
      department: department,
      studentId: studentId,
      institution: institution,
    );
  }

  String get firstName => name.split(' ').first;

  String get initials {
    final parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    }
    return name.isNotEmpty ? name[0].toUpperCase() : '?';
  }

  bool get isPending => accountStatus == 'pending';
  bool get isStudent => role == 'student';
  bool get isTeacher => role == 'teacher';
  bool get isAdmin => role == 'admin';
  bool get isBit => role == 'bit';
}
