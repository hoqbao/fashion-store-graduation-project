<?php
require_once __DIR__ . "/config/database.php";

$totalProducts = $pdo->query("SELECT COUNT(*) FROM products")->fetchColumn();
$totalOrders = $pdo->query("SELECT COUNT(*) FROM orders")->fetchColumn();
$totalUsers = $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();

$totalRevenue = $pdo
    ->query("SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE order_status <> 'CANCELLED'")
    ->fetchColumn();
?>

<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>Fashion Store Admin</title>

    <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
        rel="stylesheet"
    >
</head>
<body class="bg-light">
    <nav class="navbar navbar-dark bg-dark">
        <div class="container">
            <span class="navbar-brand fw-bold">FASHION STORE ADMIN</span>
        </div>
    </nav>

    <main class="container py-5">
        <h1 class="fw-bold mb-4">Dashboard</h1>

        <div class="row g-4">
            <div class="col-md-3">
                <div class="card border-0 shadow-sm">
                    <div class="card-body">
                        <p class="text-secondary mb-1">Sản phẩm</p>
                        <h2 class="fw-bold mb-0"><?= $totalProducts ?></h2>
                    </div>
                </div>
            </div>

            <div class="col-md-3">
                <div class="card border-0 shadow-sm">
                    <div class="card-body">
                        <p class="text-secondary mb-1">Đơn hàng</p>
                        <h2 class="fw-bold mb-0"><?= $totalOrders ?></h2>
                    </div>
                </div>
            </div>

            <div class="col-md-3">
                <div class="card border-0 shadow-sm">
                    <div class="card-body">
                        <p class="text-secondary mb-1">Người dùng</p>
                        <h2 class="fw-bold mb-0"><?= $totalUsers ?></h2>
                    </div>
                </div>
            </div>

            <div class="col-md-3">
                <div class="card border-0 shadow-sm">
                    <div class="card-body">
                        <p class="text-secondary mb-1">Doanh thu</p>
                        <h2 class="fw-bold mb-0">
                            <?= number_format($totalRevenue, 0, ",", ".") ?> đ
                        </h2>
                    </div>
                </div>
            </div>
        </div>

        <div class="card border-0 shadow-sm mt-4">
            <div class="card-body">
                <h2 class="h4 fw-bold mb-3">Chức năng quản trị</h2>

                <div class="d-flex flex-wrap gap-2">
                    <a href="products/index.php" class="btn btn-dark">
                        Quản lý sản phẩm
                    </a>

                    <a href="orders/index.php" class="btn btn-outline-dark">
                        Quản lý đơn hàng
                    </a>

                    <a href="users/index.php" class="btn btn-outline-dark">
                        Quản lý người dùng
                    </a>
                </div>
            </div>
        </div>
    </main>
</body>
</html>