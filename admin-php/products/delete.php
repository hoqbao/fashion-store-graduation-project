<?php
require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../includes/auth.php";
requireAdmin();

$id = $_GET["id"] ?? null;

if (!$id || !is_numeric($id)) {
    header("Location: index.php");
    exit;
}

try {
    $pdo->beginTransaction();

    $stmt = $pdo->prepare("
        UPDATE products
        SET status = 'INACTIVE',
            updated_at = NOW()
        WHERE id = :id
    ");

    $stmt->execute([
        ":id" => $id
    ]);

    $stmt = $pdo->prepare("
        UPDATE product_variants
        SET status = 'INACTIVE',
            updated_at = NOW()
        WHERE product_id = :product_id
    ");

    $stmt->execute([
        ":product_id" => $id
    ]);

    $pdo->commit();
} catch (PDOException $e) {
    $pdo->rollBack();
}

header("Location: index.php");
exit;
