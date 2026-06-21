<?php
$currentPage = basename($_SERVER["PHP_SELF"]);
?>

<!DOCTYPE html>
<html lang="vi">

<head>
    <meta charset="UTF-8">
    <title>Fashion Store Admin</title>

    <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
        rel="stylesheet">

    <link rel="stylesheet" href="/fashion-store-admin/assets/css/style.css">
</head>

<body class="bg-light">
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <div class="container">
            <a class="navbar-brand fw-bold" href="/fashion-store-admin/index.php">
                FASHION STORE ADMIN
            </a>

            <div class="navbar-nav ms-auto">
                <a class="nav-link" href="/fashion-store-admin/index.php">
                    Dashboard
                </a>

                <a class="nav-link" href="/fashion-store-admin/products/index.php">
                    Sản phẩm
                </a>

                <a class="nav-link" href="/fashion-store-admin/orders/index.php">
                    Đơn hàng
                </a>

                <a class="nav-link" href="/fashion-store-admin/users/index.php">
                    Người dùng
                </a>
                <span class="navbar-text text-white-50 ms-3">
                    Xin chào, <?= htmlspecialchars($_SESSION["admin_name"] ?? "Admin") ?>
                </span>

                <a class="btn btn-outline-light btn-sm ms-3" href="/fashion-store-admin/auth/logout.php">
                    Đăng xuất
                </a>
            </div>
        </div>
    </nav>