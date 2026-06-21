<?php
require_once __DIR__ . "/../config/database.php";

$id = $_GET["id"] ?? null;

if (!$id || !is_numeric($id)) {
    header("Location: index.php");
    exit;
}

$stmt = $pdo->prepare("
    SELECT 
        o.*,
        u.full_name AS customer_name,
        u.email AS customer_email
    FROM orders o
    LEFT JOIN users u ON u.id = o.user_id
    WHERE o.id = :id
    LIMIT 1
");

$stmt->execute([":id" => $id]);
$order = $stmt->fetch();

if (!$order) {
    header("Location: index.php");
    exit;
}

$stmt = $pdo->prepare("
    SELECT *
    FROM order_items
    WHERE order_id = :order_id
    ORDER BY id ASC
");

$stmt->execute([":order_id" => $id]);
$orderItems = $stmt->fetchAll();

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

require_once __DIR__ . "/../includes/header.php";
?>

<main class="container py-5">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
            <p class="text-uppercase text-secondary fw-semibold mb-1">
                Chi tiết đơn hàng
            </p>

            <h1 class="fw-bold mb-0">
                <?= htmlspecialchars($order["order_code"]) ?>
            </h1>
        </div>

        <a href="index.php" class="btn btn-outline-dark">
            Quay lại
        </a>
    </div>
    <?php if (isset($_GET["success"]) && $_GET["success"] === "updated"): ?>
        <div class="alert alert-success alert-dismissible fade show" role="alert">
            Cập nhật trạng thái đơn hàng thành công.

            <button
                type="button"
                class="btn-close"
                data-bs-dismiss="alert"
                aria-label="Close"></button>
        </div>
    <?php endif; ?>

    <?php if (isset($_GET["error"]) && $_GET["error"] === "update_failed"): ?>
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
            Không thể cập nhật trạng thái đơn hàng. Vui lòng thử lại.

            <button
                type="button"
                class="btn-close"
                data-bs-dismiss="alert"
                aria-label="Close"></button>
        </div>
    <?php endif; ?>
    <div class="row g-4">
        <div class="col-lg-8">
            <div class="card border-0 shadow-sm mb-4">
                <div class="card-body p-4">
                    <h2 class="h4 fw-bold mb-4">
                        Sản phẩm trong đơn
                    </h2>

                    <div class="table-responsive">
                        <table class="table align-middle">
                            <thead class="table-light">
                                <tr>
                                    <th>Sản phẩm</th>
                                    <th>Size</th>
                                    <th>Màu</th>
                                    <th>Giá</th>
                                    <th>Số lượng</th>
                                    <th class="text-end">Thành tiền</th>
                                </tr>
                            </thead>

                            <tbody>
                                <?php foreach ($orderItems as $item): ?>
                                    <tr>
                                        <td class="fw-semibold">
                                            <?= htmlspecialchars($item["product_name"]) ?>
                                        </td>

                                        <td>
                                            <?= htmlspecialchars($item["size"]) ?>
                                        </td>

                                        <td>
                                            <?= htmlspecialchars($item["color"]) ?>
                                        </td>

                                        <td>
                                            <?= number_format($item["price"], 0, ",", ".") ?> đ
                                        </td>

                                        <td>
                                            <?= $item["quantity"] ?>
                                        </td>

                                        <td class="text-end fw-semibold">
                                            <?= number_format($item["subtotal"], 0, ",", ".") ?> đ
                                        </td>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>

                    <div class="d-flex justify-content-between border-top pt-3 mt-3">
                        <span class="fw-bold fs-5">
                            Tổng tiền
                        </span>

                        <span class="fw-bold fs-5">
                            <?= number_format($order["total_amount"], 0, ",", ".") ?> đ
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-lg-4">
            <div class="card border-0 shadow-sm mb-4">
                <div class="card-body p-4">
                    <h2 class="h4 fw-bold mb-4">
                        Cập nhật trạng thái
                    </h2>

                    <form method="POST" action="update-status.php">
                        <input
                            type="hidden"
                            name="id"
                            value="<?= $order["id"] ?>">

                        <div class="mb-3">
                            <label class="form-label">
                                Trạng thái đơn hàng
                            </label>

                            <select name="order_status" class="form-select">
                                <?php
                                $statuses = [
                                    "PENDING" => "Chờ xác nhận",
                                    "CONFIRMED" => "Đã xác nhận",
                                    "SHIPPING" => "Đang giao hàng",
                                    "COMPLETED" => "Hoàn thành",
                                    "CANCELLED" => "Đã hủy"
                                ];
                                ?>

                                <?php foreach ($statuses as $key => $label): ?>
                                    <option
                                        value="<?= $key ?>"
                                        <?= $order["order_status"] === $key ? "selected" : "" ?>>
                                        <?= $label ?>
                                    </option>
                                <?php endforeach; ?>
                            </select>
                        </div>

                        <button type="submit" class="btn btn-dark w-100">
                            Cập nhật
                        </button>
                    </form>
                </div>
            </div>

            <div class="card border-0 shadow-sm mb-4">
                <div class="card-body p-4">
                    <h2 class="h4 fw-bold mb-4">
                        Thông tin khách hàng
                    </h2>

                    <p class="mb-2">
                        <span class="text-secondary">Tài khoản:</span>
                        <br>
                        <strong><?= htmlspecialchars($order["customer_name"] ?? "Khách hàng") ?></strong>
                    </p>

                    <p class="mb-0">
                        <span class="text-secondary">Email:</span>
                        <br>
                        <strong><?= htmlspecialchars($order["customer_email"] ?? "") ?></strong>
                    </p>
                </div>
            </div>

            <div class="card border-0 shadow-sm">
                <div class="card-body p-4">
                    <h2 class="h4 fw-bold mb-4">
                        Thông tin nhận hàng
                    </h2>

                    <p class="mb-2">
                        <span class="text-secondary">Người nhận:</span>
                        <br>
                        <strong><?= htmlspecialchars($order["receiver_name"]) ?></strong>
                    </p>

                    <p class="mb-2">
                        <span class="text-secondary">Số điện thoại:</span>
                        <br>
                        <strong><?= htmlspecialchars($order["receiver_phone"]) ?></strong>
                    </p>

                    <p class="mb-2">
                        <span class="text-secondary">Địa chỉ:</span>
                        <br>
                        <strong><?= htmlspecialchars($order["receiver_address"]) ?></strong>
                    </p>

                    <?php if (!empty($order["note"])): ?>
                        <p class="mb-0">
                            <span class="text-secondary">Ghi chú:</span>
                            <br>
                            <strong><?= htmlspecialchars($order["note"]) ?></strong>
                        </p>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </div>
</main>

<?php require_once __DIR__ . "/../includes/footer.php"; ?>