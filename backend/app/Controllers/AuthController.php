<?php

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../Models/User.php';
require_once __DIR__ . '/../Helpers/JWTHelper.php';

class AuthController {
    private $userModel;
    private $jwtHelper;

    public function __construct() {
        $this->userModel = new User();
        $this->jwtHelper = new JWTHelper();
    }

    public function register() {
        $data = json_decode(file_get_contents("php://input"), true);

        if (!isset($data['name']) || !isset($data['email']) || !isset($data['password'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required fields']);
            return;
        }

        $name = trim($data['name']);
        $email = strtolower(trim($data['email']));
        $password = $data['password'];

        // ── Full Name Validations ──
        
        // 1. Empty or only spaces
        if (empty($name)) {
            http_response_code(400);
            echo json_encode(['error' => 'Full name cannot be empty']);
            return;
        }

        // 2. Length check (at least 5, max 50)
        if (mb_strlen($name) < 5) {
            http_response_code(400);
            echo json_encode(['error' => 'Full name must be at least 5 characters long']);
            return;
        }
        if (mb_strlen($name) > 50) {
            http_response_code(400);
            echo json_encode(['error' => 'Full name is too long']);
            return;
        }

        // 3. Single word check
        if (strpos($name, ' ') === false) {
            http_response_code(400);
            echo json_encode(['error' => 'Please enter at least two names (e.g., First and Father name)']);
            return;
        }

        // 4. Invalid characters (Numbers, symbols like @, #, $, etc.)
        // Allow: alphabets, spaces, hyphens, and apostrophes
        if (!preg_match("/^[a-zA-Z\s\-\']+$/u", $name)) {
            http_response_code(400);
            echo json_encode(['error' => 'Full name can only contain letters, spaces, hyphens and apostrophes']);
            return;
        }

        // 5. Only symbols (----, '''')
        if (!preg_match("/[a-zA-Z]/u", $name)) {
            http_response_code(400);
            echo json_encode(['error' => 'Full name must contain at least some letters']);
            return;
        }

        // 6. Repeated/meaningless text (aaaa, xxx)
        if (preg_match("/(.)\\1{3,}/u", $name)) {
            http_response_code(400);
            echo json_encode(['error' => 'Full name contains excessive repeated characters']);
            return;
        }

        // 7. Too many spaces between words
        if (strpos($name, '  ') !== false) {
            http_response_code(400);
            echo json_encode(['error' => 'Full name contains too many consecutive spaces']);
            return;
        }

        // 8. Security patterns (HTML tags, SQL injection)
        if (preg_match("/<[^>]*>|' OR |\" OR |DROP TABLE|--/i", $name)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid name format detected']);
            return;
        }

        // ── Email Validations ──

        // 1. Format check
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(['error' => 'Please provide a valid email address']);
            return;
        }

        // 2. Uniqueness check
        if ($this->userModel->findByEmail($email)) {
            http_response_code(409);
            echo json_encode(['error' => 'This email is already registered']);
            return;
        }

        // ── Phone Number Validations ──
        if (!isset($data['phone_number']) || empty(trim($data['phone_number']))) {
            http_response_code(400);
            echo json_encode(['error' => 'Phone number is required']);
            return;
        }

        $phone = trim($data['phone_number']);
        if (!$this->isValidPhone($phone)) {
            http_response_code(400);
            echo json_encode(['error' => 'Please provide a valid phone number format']);
            return;
        }

        $normalizedPhone = $this->normalizePhone($phone);
        if ($this->userModel->findByPhone($normalizedPhone)) {
            http_response_code(409);
            echo json_encode(['error' => 'This phone number is already registered']);
            return;
        }

        // Determine role and approval status
        $requestedRole = $data['role_preference'] ?? $data['role_request'] ?? 'student';
        $needsApproval = ($requestedRole === 'teacher');
        
        // Prepare user data
        $userData = [
            'name'             => $name,
            'email'            => $email,
            'phone_number'     => $normalizedPhone,
            'password'         => password_hash($password, PASSWORD_BCRYPT),
            'role'             => $needsApproval ? 'teacher' : 'student',
            'role_request'     => $requestedRole,
            'account_status'   => $needsApproval ? 'pending' : 'active',
            'requested_at'     => $needsApproval ? date('Y-m-d H:i:s') : null,
            'role_preference'  => $data['role_preference'] ?? 'student',
            'profile_completed'=> true
        ];

        // Add student-specific fields
        if (isset($data['student_id'])) {
            $userData['student_id'] = $data['student_id'];
        }
        if (isset($data['department'])) {
            $userData['department'] = $data['department'];
        }
        if (isset($data['academic_year'])) {
            $userData['academic_year'] = $data['academic_year'];
        }
        if (isset($data['graduation_year'])) {
            $userData['graduation_year'] = $data['graduation_year'];
        }

        // Add teacher-specific fields
        if (isset($data['institution'])) {
            $userData['institution'] = $data['institution'];
        }
        if (isset($data['years_experience'])) {
            $userData['years_experience'] = $data['years_experience'];
        }
        if (isset($data['expertise_areas'])) {
            $userData['expertise_areas'] = json_encode($data['expertise_areas']);
        }
        if (isset($data['qualifications'])) {
            $userData['qualifications'] = json_encode([$data['qualifications']]);
        }
        if (isset($data['bio'])) {
            $userData['bio'] = $data['bio'];
        }

        // Create user
        $userId = $this->userModel->create($userData);

        if ($userId) {
            $user = $this->userModel->findById($userId);
            $token = $this->jwtHelper->generateToken($user);

            http_response_code(201);
            echo json_encode([
                'message' => 'User registered successfully',
                'token' => $token,
                'user' => $this->formatUser($user)
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create user']);
        }
    }

    public function login() {
        $data = json_decode(file_get_contents("php://input"), true);

        if (!isset($data['email']) || !isset($data['password'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Email and password required']);
            return;
        }

        $user = $this->userModel->findByEmail($data['email']);

        if (!$user || !password_verify($data['password'], $user['password'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid credentials']);
            return;
        }

        $token = $this->jwtHelper->generateToken($user);

        echo json_encode([
            'message' => 'Login successful',
            'token' => $token,
            'user' => $this->formatUser($user)
        ]);
    }

    public function logout() {
        // In a stateless JWT system, logout is handled client-side
        // Optionally implement token blacklisting here
        echo json_encode(['message' => 'Logged out successfully']);
    }

    public function refreshToken() {
        $headers = \getallheaders();
        $token = str_replace('Bearer ', '', $headers['Authorization'] ?? '');

        $decoded = $this->jwtHelper->validateToken($token);

        if (!$decoded) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid token']);
            return;
        }

        $user = $this->userModel->findById($decoded->user_id);
        $newToken = $this->jwtHelper->generateToken($user);

        echo json_encode(['token' => $newToken]);
    }

    public function googleOAuth() {
        // Implement Google OAuth flow
        echo json_encode(['message' => 'Google OAuth not yet implemented']);
    }

    public function githubOAuth() {
        // Implement GitHub OAuth flow
        echo json_encode(['message' => 'GitHub OAuth not yet implemented']);
    }

    private function formatUser($user) {
        unset($user['password']);
        return $user;
    }

    public function forgotPassword() {
        $data = json_decode(file_get_contents("php://input"), true);

        if (!isset($data['name']) || !isset($data['email']) || !isset($data['phone_number']) || !isset($data['password']) || !isset($data['confirm_password'])) {
            http_response_code(400);
            echo json_encode(['error' => 'All fields (Full Name, Email, Phone Number, New Password, Confirm Password) are required']);
            return;
        }

        $name = trim($data['name']);
        $email = strtolower(trim($data['email']));
        $phone = trim($data['phone_number']);
        $password = $data['password'];
        $confirmPassword = $data['confirm_password'];

        // Validation checks
        if (empty($name) || empty($email) || empty($phone) || empty($password)) {
            http_response_code(400);
            echo json_encode(['error' => 'All fields are required']);
            return;
        }

        if ($password !== $confirmPassword) {
            http_response_code(400);
            echo json_encode(['error' => 'New password and confirm password do not match']);
            return;
        }

        if (strlen($password) < 8) {
            http_response_code(400);
            echo json_encode(['error' => 'New password must be at least 8 characters long']);
            return;
        }

        // Validate password strength
        if (!preg_match('/[A-Za-z]/', $password) || !preg_match('/[\d\W]/', $password)) {
            http_response_code(400);
            echo json_encode(['error' => 'Password must include both letters and numbers/symbols']);
            return;
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(['error' => 'Please provide a valid email address']);
            return;
        }

        if (!$this->isValidPhone($phone)) {
            http_response_code(400);
            echo json_encode(['error' => 'Please provide a valid phone number format']);
            return;
        }

        // Retrieve user by email
        $user = $this->userModel->findByEmail($email);

        if (!$user) {
            http_response_code(400);
            echo json_encode(['error' => 'Incorrect name, email, or phone number combination.']);
            return;
        }

        // Ensure target is student or teacher
        if ($user['role'] !== 'student' && $user['role'] !== 'teacher') {
            http_response_code(403);
            echo json_encode(['error' => 'Password reset is only available for Student and Teacher accounts.']);
            return;
        }

        // Check if name matches (case-insensitive)
        if (strcasecmp(trim($user['name']), $name) !== 0) {
            http_response_code(400);
            echo json_encode(['error' => 'Incorrect name, email, or phone number combination.']);
            return;
        }

        // Check if phone matches (normalized comparison)
        $userPhoneNormalized = $this->normalizePhone($user['phone_number']);
        $inputPhoneNormalized = $this->normalizePhone($phone);
        if (empty($userPhoneNormalized) || $userPhoneNormalized !== $inputPhoneNormalized) {
            http_response_code(400);
            echo json_encode(['error' => 'Incorrect name, email, or phone number combination.']);
            return;
        }

        // Secure password hashing
        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

        // Save password update to database
        if ($this->userModel->update($user['id'], ['password' => $hashedPassword])) {
            echo json_encode(['message' => 'Password has been reset successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to reset password']);
        }
    }

    private function isValidPhone($phone) {
        if (empty($phone)) return false;
        if (!preg_match('/^\+?[0-9\s\-()]+$/', $phone)) {
            return false;
        }
        $digits = preg_replace('/[^0-9]/', '', $phone);
        $length = strlen($digits);
        return $length >= 9 && $length <= 15;
    }

    private function normalizePhone($phone) {
        if (empty($phone)) return '';
        $hasPlus = (strpos(trim($phone), '+') === 0);
        $digits = preg_replace('/[^0-9]/', '', $phone);
        return ($hasPlus ? '+' : '') . $digits;
    }
}
