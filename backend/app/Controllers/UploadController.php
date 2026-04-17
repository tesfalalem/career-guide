<?php

require_once __DIR__ . '/../Models/User.php';
require_once __DIR__ . '/../Helpers/JWTHelper.php';

class UploadController {
    private $jwtHelper;
    private $uploadDir;

    public function __construct() {
        $this->jwtHelper = new JWTHelper();
        $this->uploadDir = __DIR__ . '/../../uploads/course-content/';

        if (!file_exists($this->uploadDir)) {
            mkdir($this->uploadDir, 0755, true);
        }
    }

    private function getUser() {
        $headers = \getallheaders();
        $token = str_replace('Bearer ', '', $headers['Authorization'] ?? '');
        $decoded = $this->jwtHelper->validateToken($token);
        if (!$decoded) return null;
        $userModel = new User();
        return $userModel->findById($decoded->user_id);
    }

    // Build the public URL for a filename using the API serve endpoint
    private function buildUrl($filename) {
        $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
        $host   = $_SERVER['HTTP_HOST'] ?? 'localhost:8000';
        return $scheme . '://' . $host . '/api/uploads/serve?file=' . urlencode($filename);
    }

    // Upload a file and return its URL
    public function upload() {
        $user = $this->getUser();
        if (!$user || !in_array($user['role'], ['bit', 'admin', 'teacher'])) {
            http_response_code(403);
            echo json_encode(['error' => 'Permission denied']);
            return;
        }

        if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
            http_response_code(400);
            echo json_encode(['error' => 'No file uploaded or upload error: ' . ($_FILES['file']['error'] ?? 'none')]);
            return;
        }

        $file     = $_FILES['file'];
        $origName = basename($file['name']);
        $ext      = strtolower(pathinfo($origName, PATHINFO_EXTENSION));

        $allowed = ['jpg','jpeg','png','gif','webp','pdf','doc','docx','ppt','pptx','xls','xlsx','txt','zip','mp4','webm','mov'];
        if (!in_array($ext, $allowed)) {
            http_response_code(400);
            echo json_encode(['error' => 'File type not allowed: ' . $ext]);
            return;
        }

        if ($file['size'] > 50 * 1024 * 1024) {
            http_response_code(400);
            echo json_encode(['error' => 'File too large (max 50MB)']);
            return;
        }

        $filename = uniqid() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '_', $origName);
        $dest     = $this->uploadDir . $filename;

        if (!move_uploaded_file($file['tmp_name'], $dest)) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to save file to disk']);
            return;
        }

        echo json_encode([
            'url'      => $this->buildUrl($filename),
            'filename' => $origName,
            'size'     => $file['size'],
            'type'     => $ext
        ]);
    }

    // Serve a file by streaming it through PHP (bypasses Apache path issues)
    public function serve() {
        $filename = $_GET['file'] ?? '';

        // Sanitize — no path traversal
        $filename = basename($filename);
        if (empty($filename)) {
            http_response_code(400);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'No file specified']);
            return;
        }

        $filepath = $this->uploadDir . $filename;

        if (!file_exists($filepath)) {
            http_response_code(404);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'File not found']);
            return;
        }

        $ext      = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
        $mimeMap  = [
            'jpg'  => 'image/jpeg',  'jpeg' => 'image/jpeg',
            'png'  => 'image/png',   'gif'  => 'image/gif',
            'webp' => 'image/webp',  'pdf'  => 'application/pdf',
            'doc'  => 'application/msword',
            'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'ppt'  => 'application/vnd.ms-powerpoint',
            'pptx' => 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'xls'  => 'application/vnd.ms-excel',
            'xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'txt'  => 'text/plain',
            'zip'  => 'application/zip',
            'mp4'  => 'video/mp4',
            'webm' => 'video/webm',
            'mov'  => 'video/quicktime',
        ];

        $mime = $mimeMap[$ext] ?? 'application/octet-stream';

        // For images/videos show inline; for docs force download
        $inline = in_array($ext, ['jpg','jpeg','png','gif','webp','mp4','webm','mov','pdf']);
        $disposition = $inline ? 'inline' : 'attachment';

        // Remove the JSON content-type header set globally in index.php
        header_remove('Content-Type');
        header('Content-Type: ' . $mime);
        header('Content-Disposition: ' . $disposition . '; filename="' . $filename . '"');
        header('Content-Length: ' . filesize($filepath));
        header('Cache-Control: public, max-age=86400');
        header('Access-Control-Allow-Origin: *');

        readfile($filepath);
        exit();
    }
}
