<?php
require 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

// Add CORS support for React Dev Server
if ($method === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($method === 'GET') {
    $isAdmin = isset($_GET['admin']) && $_GET['admin'] === 'true';
    
    // Topics are stored in tasks table
    if ($isAdmin) {
        $stmt = $pdo->query("SELECT * FROM tasks ORDER BY id ASC");
    } else {
        $stmt = $pdo->query("SELECT * FROM tasks WHERE is_published = 1 ORDER BY id ASC");
    }
    
    $topics = $stmt->fetchAll();
    echo json_encode(['success' => true, 'topics' => $topics]);
    exit;
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (isset($input['action']) && $input['action'] === 'update') {
        $id = $input['id'];
        $title = $input['title'];
        $description = $input['description'] ?? '';
        $theory_content = $input['theory_content'] ?? '';
        $image_url = $input['image_url'] ?? '';
        $is_published = $input['is_published'] ? 1 : 0;
        
        $stmt = $pdo->prepare("UPDATE tasks SET title=?, description=?, theory_content=?, image_url=?, is_published=? WHERE id=?");
        $stmt->execute([$title, $description, $theory_content, $image_url, $is_published, $id]);
        
        echo json_encode(['success' => true]);
        exit;
    }
    
    if (isset($input['action']) && $input['action'] === 'create') {
        $title = $input['title'] ?? 'New Topic';
        
        $stmt = $pdo->prepare("INSERT INTO tasks (title, description, theory_content, image_url, is_published) VALUES (?, '', '', '', 0)");
        $stmt->execute([$title]);
        
        echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
        exit;
    }
}
