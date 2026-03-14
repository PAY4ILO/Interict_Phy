<?php
require '../db.php';

$input = json_decode(file_get_contents('php://input'), true);
$adminEmail = $input['adminEmail'] ?? '';
$targetEmail = $input['targetEmail'] ?? '';
$newPlan = $input['newPlan'] ?? 'basic';
$months = intval($input['months'] ?? 0);

if ($adminEmail !== $admin_email) {
    http_response_code(403);
    echo json_encode(['success' => false]);
    exit;
}

try {
    $expires = null;
    if ($months > 0) {
        $expires = date('Y-m-d H:i:s', strtotime("+$months months"));
    }

    $stmt = $pdo->prepare("UPDATE users SET plan = ?, expires = ? WHERE email = ?");
    $stmt->execute([$newPlan, $expires, $targetEmail]);

    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    echo json_encode(['success' => false]);
}
?>
