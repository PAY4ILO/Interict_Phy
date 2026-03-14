<?php
require 'api/db.php';

try {
    $stmt = $pdo->query("SHOW COLUMNS FROM tasks");
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "Current columns in tasks:\n" . implode("\n", $columns) . "\n\n";

    echo "Attempting to add new columns...\n";
    $pdo->exec("ALTER TABLE tasks ADD COLUMN is_published TINYINT(1) DEFAULT 0");
    $pdo->exec("ALTER TABLE tasks ADD COLUMN theory_content LONGTEXT");
    $pdo->exec("ALTER TABLE tasks ADD COLUMN image_url VARCHAR(255)");
    echo "Columns added successfully.\n";

} catch (Exception $e) {
    if (strpos($e->getMessage(), 'Duplicate column name') !== false) {
        echo "Columns already exist.\n";
    } else {
        echo "Error: " . $e->getMessage() . "\n";
    }
}
