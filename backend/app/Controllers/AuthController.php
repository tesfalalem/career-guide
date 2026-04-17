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

        // Check if user exists
        if ($this->userModel->findByEmail($data['email'])) {
            http_response_code(409);
            echo json_encode(['error' => 'Email already registered']);
            return;
        }

        // Determine role and approval status
        $requestedRole = $data['role_preference'] ?? $data['role_request'] ?? 'student';
        $needsApproval = ($requestedRole === 'teacher');
        
        // Prepare user data
        $userData = [
            'name'             => $data['name'],
            'email'            => $data['email'],
            'password'         => password_hash($data['password'], PASSWORD_BCRYPT),
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
}
