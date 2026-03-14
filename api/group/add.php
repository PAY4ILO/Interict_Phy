<?php
require '../db.php';

$input = json_decode(file_get_contents('php://input'), true);
$ownerEmail = $input['ownerEmail'] ?? '';
$memberEmail = $input['memberEmail'] ?? '';

try {
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$ownerEmail]);
    $owner = $stmt->fetch();
    if (!$owner || $owner['plan'] !== 'advanced') {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Нужен тариф Продвинутый']);
        exit;
    }

    $stmt->execute([$memberEmail]);
    $member = $stmt->fetch();
    if (!$member) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Пользователь не найден']);
        exit;
    }
    if ($member['plan'] !== 'basic') {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'У пользователя уже есть активный тариф']);
        exit;
    }

    $stmtGroup = $pdo->prepare("SELECT member_email FROM `groups` WHERE owner_email = ?");
    $stmtGroup->execute([$ownerEmail]);
    $currentGroup = $stmtGroup->fetchAll(PDO::FETCH_COLUMN);

    if (count($currentGroup) >= 30) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Группа переполнена (макс 30)']);
        exit;
    }
    if (in_array($memberEmail, $currentGroup)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Уже в группе']);
        exit;
    }

    $pdo->prepare("INSERT INTO `groups` (owner_email, member_email) VALUES (?, ?)")->execute([$ownerEmail, $memberEmail]);
    $pdo->prepare("UPDATE users SET plan = 'advanced' WHERE email = ?")->execute([$memberEmail]);

    $currentGroup[] = $memberEmail;
    echo json_encode(['success' => true, 'group' => $currentGroup]);

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error']);
}
?>
