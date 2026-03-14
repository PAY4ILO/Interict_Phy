<?php
require 'db.php';

$input = json_decode(file_get_contents('php://input'), true);
$email = $input['email'] ?? '';
$hash = $input['hash'] ?? '';
$data = $input['data'] ?? '';

if (!$email || !$hash) {
    echo json_encode(['success' => false, 'message' => 'Invalid input']);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Пользователь уже существует']);
        exit;
    }

    $isAdmin = ($email === $admin_email);
    $role = $isAdmin ? 'admin' : 'user';
    $plan = $isAdmin ? 'advanced' : 'basic';

    $stmt = $pdo->prepare("INSERT INTO users (email, hash, data, role, plan, expires) VALUES (?, ?, ?, ?, ?, NULL)");
    $stmt->execute([$email, $hash, $data, $role, $plan]);

    $newUser = [
        'email' => $email,
        'hash' => $hash,
        'data' => $data,
        'role' => $role,
        'plan' => $plan,
        'expires' => null,
        'myGroup' => [],
        'groupOwner' => null
    ];

    echo json_encode(['success' => true, 'user' => $newUser]);

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error']);
}

