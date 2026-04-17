<?php

require_once __DIR__ . '/../Models/User.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class JWTHelper {
    private $secret;
    private $expiry;

    public function __construct() {
        $this->secret = $_ENV['JWT_SECRET'] ?? 'your_secret_key_change_this';
        $this->expiry = $_ENV['JWT_EXPIRY'] ?? 86400; // 24 hours
    }

    public function generateToken($user) {
        $issuedAt = time();
        $expirationTime = $issuedAt + $this->expiry;

        $payload = [
            'iat' => $issuedAt,
            'exp' => $expirationTime,
            'user_id' => $user['id'],
            'email' => $user['email'],
            'role' => $user['role']
        ];

        return JWT::encode($payload, $this->secret, 'HS256');
    }

    public function validateToken($token) {
        try {
            $decoded = JWT::decode($token, new Key($this->secret, 'HS256'));
            return $decoded;
        } catch (Exception $e) {
            return false;
        }
    }

    public function getUserFromToken() {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? '';
        
        if (empty($authHeader)) {
            return null;
        }

        $token = str_replace('Bearer ', '', $authHeader);
        $decoded = $this->validateToken($token);

        if (!$decoded) {
            return null;
        }

        $userModel = new User();
        return $userModel->findById($decoded->user_id);
    }
}
