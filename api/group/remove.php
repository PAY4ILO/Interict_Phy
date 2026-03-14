<?php
require '../db.php';

$input = json_decode(file_get_contents('php://input'), true);
$ownerEmail = $input['ownerEmail'] ?? '';
$memberEmail = $input['memberEmail'] ?? '';

try {
    $stmt = $pdo->prepare("DELETE FROM `groups` WHERE owner_email = ? AND member_email = ?");
    $stmt->execute([$ownerEmail, $memberEmail]);

    if ($stmt->rowCount() > 0) {
        $pdo->prepare("UPDATE users SET plan = 'basic' WHERE email = ?")->execute([$memberEmail]);
    }

    $stmt = $pdo->prepare("SELECT member_email FROM `groups` WHERE owner_email = ?");
    $stmt->execute([$ownerEmail]);
    $list = $stmt->fetchAll(PDO::FETCH_COLUMN);

    echo json_encode(['success' => true, 'group' => $list]);

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error']);
}
?>
