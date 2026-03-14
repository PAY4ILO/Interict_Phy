<?php
require 'db.php';

$input = json_decode(file_get_contents('php://input'), true);
$email = $input['email'] ?? '';
$hash = $input['hash'] ?? '';

try {
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user || $user['hash'] !== $hash) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Неверный email или пароль']);
        exit;
    }

    if ($user['expires'] && strtotime($user['expires']) < time()) {
        $pdo->prepare("UPDATE users SET plan = 'basic', expires = NULL WHERE email = ?")->execute([$email]);
        $user['plan'] = 'basic';
        $user['expires'] = null;
    }

    if ($email === $admin_email) {
        $user['role'] = 'admin';
        $user['plan'] = 'advanced';
    }

    $stmtGroup = $pdo->prepare("SELECT member_email FROM `groups` WHERE owner_email = ?");
    $stmtGroup->execute([$email]);
    $myGroup = $stmtGroup->fetchAll(PDO::FETCH_COLUMN);

    $stmtOwner = $pdo->prepare("SELECT owner_email FROM `groups` WHERE member_email = ?");
    $stmtOwner->execute([$email]);
    $ownerRow = $stmtOwner->fetch();
    $groupOwner = $ownerRow ? $ownerRow['owner_email'] : null;

    $user['myGroup'] = $myGroup;
    $user['groupOwner'] = $groupOwner;

    echo json_encode(['success' => true, 'user' => $user]);

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Server error']);
}
