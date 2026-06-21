<?php
require_once __DIR__ . "/../config/database.php";

$sql = "
    SELECT 
        o.id,
        o.order_code,
        o.receiver_name,
        o.receiver_phone,
        o.total_amount,
        o.payment_method,
        o.payment_status,
        o.order_status,
        o.created_at,
        u.full_name AS customer_name,
        u.email AS customer_email
    FROM orders o
    LEFT JOIN users u ON u.id = o.user_id
    ORDER BY o.id DESC
";

$stmt = $pdo->query($sql);
$orders = $stmt->fetchAll();

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

require_once __DIR__ . "/../includes/header.php";
?>

<main class="container py-5">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
            <p class="text-uppercase text-secondary fw-semibold mb-1">
                Quản trị
            </p>

            <h1 class="fw-bold mb-0">Quản lý đơn hàng</h1>
        </div>

        <a href="../index.php" class="btn btn-outline-dark">
            Dashboard
        </a>
    </div>

    <div class="card border-0 shadow-sm">
        <div class="table-responsive">
            <table class="table align-middle mb-0">
                <thead class="table-light">
                    <tr>
                        <th class="ps-4">Mã đơn</th>
                        <th>Khách hàng</th>
                        <th>Người nhận</th>
                        <th>Tổng tiền</th>
                        <th>Thanh toán</th>
                        <th>Trạng thái</th>
                        <th>Ngày đặt</th>
                        <th class="text-end pe-4">Thao tác</th>
                    </tr>
                </thead>

                <tbody>
                    <?php if (count($orders) === 0): ?>
                        <tr>
                            <td colspan="8" class="text-center py-5 text-secondary">
                                Chưa có đơn hàng nào.
                            </td>
                        </tr>
                    <?php endif; ?>

                    <?php foreach ($orders as $order): ?>
                        <tr>
                            <td class="ps-4 fw-semibold">
                                <?= htmlspecialchars($order["order_code"]) ?>
                            </td>

                            <td>
                                <div class="fw-semibold">
                                    <?= htmlspecialchars($order["customer_name"] ?? "Khách hàng") ?>
                                </div>

                                <div class="text-secondary small">
                                    <?= htmlspecialchars($order["customer_email"] ?? "") ?>
                                </div>
                            </td>

                            <td>
                                <div class="fw-semibold">
                                    <?= htmlspecialchars($order["receiver_name"]) ?>
                                </div>

                                <div class="text-secondary small">
                                    <?= htmlspecialchars($order["receiver_phone"]) ?>
                                </div>
                            </td>

                            <td class="fw-semibold">
                                <?= number_format($order["total_amount"], 0, ",", ".") ?> đ
                            </td>

                            <td>
                                <?= htmlspecialchars($order["payment_method"]) ?>
                            </td>

                            <td>
                                <span class="badge <?= getOrderStatusClass($order["order_status"]) ?>">
                                    <?= getOrderStatusText($order["order_status"]) ?>
                                </span>
                            </td>

                            <td>
                                <?= date("d/m/Y H:i", strtotime($order["created_at"])) ?>
                            </td>

                            <td class="text-end pe-4">
                                <a
                                    href="detail.php?id=<?= $order["id"] ?>"
                                    class="btn btn-sm btn-outline-dark"
                                >
                                    Xem chi tiết
                                </a>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </div>
</main>

<?php require_once __DIR__ . "/../includes/footer.php"; ?>