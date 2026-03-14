<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

function loadEnv($path) {
    if (!file_exists($path)) return;
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        list($name, $value) = explode('=', $line, 2);
        $_ENV[trim($name)] = trim($value);
    }
}

loadEnv(__DIR__ . '/../.env');

$host = $_ENV['DB_HOST'] ?? 'localhost';
$port = $_ENV['DB_PORT'] ?? '3306'; 
$user = $_ENV['DB_USER'] ?? 'root';
$pass = $_ENV['DB_PASSWORD'] ?? '';
$charset = 'utf8mb4';

echo "<h2>Initialization</h2>";
echo "Connecting to MySQL at $host:$port as $user...<br>";

$dsn = "mysql:host=$host;port=$port;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
    echo "Connected to MySQL server.<br>";
} catch (PDOException $e) {
    die("Connection failed: " . $e->getMessage());
}

$schemaFile = __DIR__ . '/../schema.sql';
if (!file_exists($schemaFile)) {
    die("Schema file not found at $schemaFile");
}
$sql = file_get_contents($schemaFile);

try {
    $pdo->exec($sql);
    echo "<b>Database 'physics_lab' created/updated successfully!</b><br>";
    echo "Tables should be ready.<br>";
    echo "<br><a href='/' style='font-size:1.5rem;'>Go to Home Page</a>";
} catch (PDOException $e) {
    echo "Error executing schema: " . $e->getMessage();
}
?>
