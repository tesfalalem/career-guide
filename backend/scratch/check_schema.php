<?php
require_once __DIR__ . '/../config/database.php';
$db = (new Database())->getConnection();
$stmt = $db->query("DESCRIBE users");
$columns = $stmt->fetchAll();
echo json_encode($columns, JSON_PRETTY_PRINT);
