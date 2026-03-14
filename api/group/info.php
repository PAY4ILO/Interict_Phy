<?php
require '../db.php';

$input = json_decode(file_get_contents('php://input'), true);
$email = $input['email'] ?? '';

try {
    $stmt = $pdo->prepare("SELECT member_email FROM `groups` WHERE owner_email = ?");
    $stmt->execute([$email]);
    $list = $stmt->fetchAll(PDO::FETCH_COLUMN);

    echo json_encode(['success' => true, 'list' => $list]);
} catch (PDOException $e) {
    echo json_encode(['success' => false]);
}
?>
