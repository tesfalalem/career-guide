<?php
require_once __DIR__ . '/../config/database.php';
$db = (new Database())->getConnection();
$stmt = $db->prepare("SELECT id, name, profile_image FROM users WHERE id = ?");
$stmt->execute([67]);
$user = $stmt->fetch();
echo json_encode($user, JSON_PRETTY_PRINT);
