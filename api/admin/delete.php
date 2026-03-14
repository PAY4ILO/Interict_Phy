<?php
require '../db.php';

$input = json_decode(file_get_contents('php://input'), true);
$postAdminEmail = $input['adminEmail'] ?? '';
$targetEmail = $input['targetEmail'] ?? '';

if ($postAdminEmail !== $admin_email) {
    http_response_code(403);
    echo json_encode(['success' => false]);
    exit;
}

try {
    $pdo->prepare("DELETE FROM users WHERE email = ?")->execute([$targetEmail]);
    $pdo->prepare("DELETE FROM `groups` WHERE owner_email = ? OR member_email = ?")->execute([$targetEmail, $targetEmail]);

    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    echo json_encode(['success' => false]);
}
?>
