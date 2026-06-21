<?php
require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../includes/auth.php";
requireAdmin();

$id = $_GET["id"] ?? null;
$status = $_GET["status"] ?? null;

$validStatuses = ["ACTIVE", "INACTIVE"];

if (!$id || !is_numeric($id) || !in_array($status, $validStatuses)) {
    header("Location: index.php");
    exit;
}

$stmt = $pdo->prepare("
    SELECT role
    FROM users
    WHERE id = :id
    LIMIT 1
");

$stmt->execute([
    ":id" => $id
]);

$user = $stmt->fetch();

if (!$user || $user["role"] === "ADMIN") {
    header("Location: index.php");
    exit;
}

$stmt = $pdo->prepare("
    UPDATE users
    SET status = :status,
        updated_at = NOW()
    WHERE id = :id
");

$stmt->execute([
    ":status" => $status,
    ":id" => $id
]);

header("Location: index.php?success=updated");
exit;