<?php
require_once __DIR__ . "/includes/auth.php";
requireAdmin();

require_once __DIR__ . "/config/database.php";

$totalProducts = $pdo
    ->query("SELECT COUNT(*) FROM products WHERE status = 'ACTIVE'")
    ->fetchColumn();

$totalOrders = $pdo
    ->query("SELECT COUNT(*) FROM orders")
    ->fetchColumn();

$totalUsers = $pdo
    ->query("SELECT COUNT(*) FROM users WHERE role <> 'ADMIN'")
    ->fetchColumn();

$totalRevenue = $pdo
    ->query("SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE order_status <> 'CANCELLED'")
    ->fetchColumn();

$pendingOrders = $pdo
    ->query("SELECT COUNT(*) FROM orders WHERE order_status = 'PENDING'")
    ->fetchColumn();

$completedOrders = $pdo
    ->query("SELECT COUNT(*) FROM orders WHERE order_status = 'COMPLETED'")
    ->fetchColumn();

$recentOrdersStmt = $pdo->query("
    SELECT 
        o.id,
        o.order_code,
        o.receiver_name,
        o.total_amount,
        o.payment_method,
        o.order_status,
        o.created_at,
        u.full_name AS customer_name
    FROM orders o
    LEFT JOIN users u ON u.id = o.user_id
    ORDER BY o.id DESC
    LIMIT 5
");

$recentOrders = $recentOrdersStmt->fetchAll();

$lowStockStmt = $pdo->query("
    SELECT 
        p.id,
        p.name,
        pv.sku,
        pv.size,
        pv.color,
        pv.stock
    FROM product_variants pv
    INNER JOIN products p ON p.id = pv.product_id
    WHERE pv.status = 'ACTIVE'
      AND p.status = 'ACTIVE'
      AND pv.stock <= 10
    ORDER BY pv.stock ASC
    LIMIT 5
");

$lowStockProducts = $lowStockStmt->fetchAll();

function formatCurrency($amount)
{
    return number_format($amount, 0, ",", ".") . " đ";
}

function getOrderStatusText($status)
{
    $map = [
        "PENDING" => "Chờ xác nhận",
        "CONFIRMED" => "Đã xác nhận",
        "SHIPPING" => "Đang giao hàng",
        "COMPLETED" => "Hoàn thành",
        "CANCELLED" => "Đã hủy"
    ];

    return $map[$status] ?? $status;
}

function getOrderStatusClass($status)
{
    $map = [
        "PENDING" => "text-bg-warning",
        "CONFIRMED" => "text-bg-primary",
        "SHIPPING" => "text-bg-info",
        "COMPLETED" => "text-bg-success",
        "CANCELLED" => "text-bg-danger"
    ];

    return $map[$status] ?? "text-bg-secondary";
}

require_once __DIR__ . "/includes/header.php";
?>

<main class="container py-5">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
            <p class="text-uppercase text-secondary fw-semibold mb-1">
                Tổng quan hệ thống
            </p>

            <h1 class="fw-bold mb-0">
                Dashboard
            </h1>
        </div>

        <div class="d-flex gap-2">
            <a href="products/create.php" class="btn btn-dark">
                Thêm sản phẩm
            </a>

            <a href="orders/index.php" class="btn btn-outline-dark">
                Xem đơn hàng
            </a>
        </div>
    </div>

    <div class="row g-4">
        <div class="col-md-6 col-xl-3">
            <div class="card border-0 shadow-sm h-100">
                <div class="card-body">
                    <p class="text-secondary mb-1">
                        Sản phẩm đang bán
                    </p>

                    <h2 class="fw-bold mb-0">
                        <?= $totalProducts ?>
                    </h2>

                    <p class="text-secondary small mb-0 mt-2">
                        Sản phẩm có trạng thái ACTIVE
                    </p>
                </div>
            </div>
        </div>

        <div class="col-md-6 col-xl-3">
            <div class="card border-0 shadow-sm h-100">
                <div class="card-body">
                    <p class="text-secondary mb-1">
                        Tổng đơn hàng
                    </p>

                    <h2 class="fw-bold mb-0">
                        <?= $totalOrders ?>
                    </h2>

                    <p class="text-secondary small mb-0 mt-2">
                        <?= $pendingOrders ?> đơn đang chờ xác nhận
                    </p>
                </div>
            </div>
        </div>

        <div class="col-md-6 col-xl-3">
            <div class="card border-0 shadow-sm h-100">
                <div class="card-body">
                    <p class="text-secondary mb-1">
                        Khách hàng
                    </p>

                    <h2 class="fw-bold mb-0">
                        <?= $totalUsers ?>
                    </h2>

                    <p class="text-secondary small mb-0 mt-2">
                        Không tính tài khoản admin
                    </p>
                </div>
            </div>
        </div>

        <div class="col-md-6 col-xl-3">
            <div class="card border-0 shadow-sm h-100">
                <div class="card-body">
                    <p class="text-secondary mb-1">
                        Doanh thu tạm tính
                    </p>

                    <h2 class="fw-bold mb-0">
                        <?= formatCurrency($totalRevenue) ?>
                    </h2>

                    <p class="text-secondary small mb-0 mt-2">
                        <?= $completedOrders ?> đơn đã hoàn thành
                    </p>
                </div>
            </div>
        </div>
    </div>

    <div class="card border-0 shadow-sm mt-4">
        <div class="card-body">
            <h2 class="h4 fw-bold mb-3">
                Chức năng quản trị
            </h2>

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

    <div class="row g-4 mt-1">
        <div class="col-lg-8">
            <div class="card border-0 shadow-sm h-100">
                <div class="card-body p-4">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h2 class="h4 fw-bold mb-0">
                            Đơn hàng mới nhất
                        </h2>

                        <a href="orders/index.php" class="btn btn-sm btn-outline-dark">
                            Xem tất cả
                        </a>
                    </div>

                    <div class="table-responsive">
                        <table class="table align-middle mb-0">
                            <thead class="table-light">
                                <tr>
                                    <th>Mã đơn</th>
                                    <th>Khách hàng</th>
                                    <th>Tổng tiền</th>
                                    <th>Trạng thái</th>
                                    <th>Ngày đặt</th>
                                    <th class="text-end">Chi tiết</th>
                                </tr>
                            </thead>

                            <tbody>
                                <?php if (count($recentOrders) === 0): ?>
                                    <tr>
                                        <td colspan="6" class="text-center text-secondary py-4">
                                            Chưa có đơn hàng nào.
                                        </td>
                                    </tr>
                                <?php endif; ?>

                                <?php foreach ($recentOrders as $order): ?>
                                    <tr>
                                        <td class="fw-semibold">
                                            <?= htmlspecialchars($order["order_code"]) ?>
                                        </td>

                                        <td>
                                            <?= htmlspecialchars($order["customer_name"] ?? $order["receiver_name"]) ?>
                                        </td>

                                        <td class="fw-semibold">
                                            <?= formatCurrency($order["total_amount"]) ?>
                                        </td>

                                        <td>
                                            <span class="badge <?= getOrderStatusClass($order["order_status"]) ?>">
                                                <?= getOrderStatusText($order["order_status"]) ?>
                                            </span>
                                        </td>

                                        <td>
                                            <?= date("d/m/Y H:i", strtotime($order["created_at"])) ?>
                                        </td>

                                        <td class="text-end">
                                            <a
                                                href="orders/detail.php?id=<?= $order["id"] ?>"
                                                class="btn btn-sm btn-outline-dark"
                                            >
                                                Xem
                                            </a>
                                        </td>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-lg-4">
            <div class="card border-0 shadow-sm h-100">
                <div class="card-body p-4">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h2 class="h4 fw-bold mb-0">
                            Sắp hết hàng
                        </h2>

                        <a href="products/index.php" class="btn btn-sm btn-outline-dark">
                            Sản phẩm
                        </a>
                    </div>

                    <?php if (count($lowStockProducts) === 0): ?>
                        <p class="text-secondary mb-0">
                            Không có sản phẩm nào sắp hết hàng.
                        </p>
                    <?php endif; ?>

                    <?php foreach ($lowStockProducts as $product): ?>
                        <div class="border-bottom pb-3 mb-3">
                            <p class="fw-semibold mb-1">
                                <?= htmlspecialchars($product["name"]) ?>
                            </p>

                            <p class="text-secondary small mb-1">
                                SKU: <?= htmlspecialchars($product["sku"]) ?>
                            </p>

                            <div class="d-flex justify-content-between">
                                <span class="text-secondary small">
                                    <?= htmlspecialchars($product["color"]) ?> / Size <?= htmlspecialchars($product["size"]) ?>
                                </span>

                                <span class="badge text-bg-warning">
                                    Còn <?= $product["stock"] ?>
                                </span>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            </div>
        </div>
    </div>
</main>

<?php require_once __DIR__ . "/includes/footer.php"; ?>
