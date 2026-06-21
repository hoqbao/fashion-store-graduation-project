<?php
require_once __DIR__ . "/../config/database.php";

$id = $_POST["id"] ?? null;
$orderStatus = $_POST["order_status"] ?? null;

$validStatuses = [
    "PENDING",
    "CONFIRMED",
    "SHIPPING",
    "COMPLETED",
    "CANCELLED"
];

if (!$id || !is_numeric($id) || !in_array($orderStatus, $validStatuses)) {
    header("Location: index.php?error=invalid");
    exit;
}

try {
    $stmt = $pdo->prepare("
        UPDATE orders
        SET order_status = :order_status,
            updated_at = NOW()
        WHERE id = :id
    ");

    $stmt->execute([
        ":order_status" => $orderStatus,
        ":id" => $id
    ]);

    header("Location: detail.php?id=" . $id . "&success=updated");
    exit;
} catch (PDOException $e) {
    header("Location: detail.php?id=" . $id . "&error=update_failed");
    exit;
}