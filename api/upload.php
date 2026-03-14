<?php
require 'db.php';

$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($method === 'POST') {
    if (!isset($_FILES['image'])) {
        echo json_encode(['success' => false, 'message' => 'No image uploaded']);
        exit;
    }

    $file = $_FILES['image'];
    $uploadDir = '../uploads/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    $fileName = time() . '_' . basename($file['name']);
    $targetPath = $uploadDir . $fileName;

    if (move_uploaded_file($file['tmp_name'], $targetPath)) {
        echo json_encode(['success' => true, 'url' => '/uploads/' . $fileName]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error uploading file']);
    }
    exit;
}
