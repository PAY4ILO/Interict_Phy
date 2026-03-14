<?php
require '../db.php';

$input = json_decode(file_get_contents('php://input'), true);
$email = $input['email'] ?? '';

if ($email !== $admin_email) {
    http_response_code(403);
    echo json_encode(['success' => false]);
    exit;
}

try {
    $stmt = $pdo->query("SELECT * FROM users");
    $users = $stmt->fetchAll();

    $dbObj = [];
    foreach ($users as $u) {
        $dbObj[$u['email']] = $u;
    }

    echo json_encode(['success' => true, 'db' => $dbObj]);
} catch (PDOException $e) {
    echo json_encode(['success' => false]);
}
?>
