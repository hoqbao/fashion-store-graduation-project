<?php

function uploadProductImage($file)
{
    if (!isset($file) || $file["error"] === UPLOAD_ERR_NO_FILE) {
        return null;
    }

    if ($file["error"] !== UPLOAD_ERR_OK) {
        throw new Exception("Upload hình ảnh thất bại.");
    }

    $allowedExtensions = ["jpg", "jpeg", "png", "webp"];
    $maxSize = 20 * 1024 * 1024; // 20MB

    if ($file["size"] > $maxSize) {
        throw new Exception("Hình ảnh không được vượt quá 20MB.");
    }

    $originalName = $file["name"];
    $extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));

    if (!in_array($extension, $allowedExtensions)) {
        throw new Exception("Chỉ cho phép upload ảnh JPG, JPEG, PNG hoặc WEBP.");
    }

    $uploadDir = __DIR__ . "/../uploads/products";

    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    $fileName = "product_" . time() . "_" . rand(1000, 9999) . "." . $extension;
    $targetPath = $uploadDir . "/" . $fileName;

    if (!move_uploaded_file($file["tmp_name"], $targetPath)) {
        throw new Exception("Không thể lưu hình ảnh.");
    }

    return "http://localhost/fashion-store-admin/uploads/products/" . $fileName;
}
