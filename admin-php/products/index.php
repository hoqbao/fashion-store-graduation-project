<?php
require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../includes/auth.php";
requireAdmin();

$sql = "
    SELECT 
        p.id,
        p.name,
        p.slug,
        p.base_price,
        p.status,
        p.created_at,
        c.name AS category_name,
        (
            SELECT image_url
            FROM product_images pi
            WHERE pi.product_id = p.id
            ORDER BY pi.id ASC
            LIMIT 1
        ) AS image_url
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    ORDER BY p.id DESC
";

$stmt = $pdo->query($sql);
$products = $stmt->fetchAll();

require_once __DIR__ . "/../includes/header.php";
?>

<main class="container py-5">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
            <p class="text-uppercase text-secondary fw-semibold mb-1">
                Quản trị
            </p>

            <h1 class="fw-bold mb-0">Quản lý sản phẩm</h1>
        </div>

        <a href="create.php" class="btn btn-dark">
            Thêm sản phẩm
        </a>
    </div>

    <div class="card border-0 shadow-sm">
        <div class="table-responsive">
            <table class="table align-middle mb-0">
                <thead class="table-light">
                    <tr>
                        <th class="ps-4">ID</th>
                        <th>Hình</th>
                        <th>Tên sản phẩm</th>
                        <th>Danh mục</th>
                        <th>Giá</th>
                        <th>Trạng thái</th>
                        <th>Ngày tạo</th>
                        <th class="text-end pe-4">Thao tác</th>
                    </tr>
                </thead>

                <tbody>
                    <?php if (count($products) === 0): ?>
                        <tr>
                            <td colspan="8" class="text-center py-5 text-secondary">
                                Chưa có sản phẩm nào.
                            </td>
                        </tr>
                    <?php endif; ?>

                    <?php foreach ($products as $product): ?>
                        <tr>
                            <td class="ps-4">
                                <?= $product["id"] ?>
                            </td>

                            <td>
                                <img
                                    src="<?= htmlspecialchars($product["image_url"] ?: "https://placehold.co/100x130?text=No+Image") ?>"
                                    alt="<?= htmlspecialchars($product["name"]) ?>"
                                    style="width: 70px; height: 90px; object-fit: cover; border-radius: 8px; background: #f1f1f1;">
                            </td>

                            <td class="fw-semibold">
                                <?= htmlspecialchars($product["name"]) ?>
                            </td>

                            <td>
                                <?= htmlspecialchars($product["category_name"] ?: "Chưa có") ?>
                            </td>

                            <td class="fw-semibold">
                                <?= number_format($product["base_price"], 0, ",", ".") ?> đ
                            </td>

                            <td>
                                <?php if ($product["status"] === "ACTIVE"): ?>
                                    <span class="badge text-bg-success">Đang bán</span>
                                <?php else: ?>
                                    <span class="badge text-bg-secondary">Ngừng bán</span>
                                <?php endif; ?>
                            </td>

                            <td>
                                <?= date("d/m/Y H:i", strtotime($product["created_at"])) ?>
                            </td>

                            <td class="text-end pe-4">
                                <a
                                    href="edit.php?id=<?= $product["id"] ?>"
                                    class="btn btn-sm btn-outline-dark">
                                    Sửa
                                </a>

                                <a
                                    href="delete.php?id=<?= $product["id"] ?>"
                                    class="btn btn-sm btn-outline-danger"
                                    onclick="return confirm('Bạn có chắc muốn ngừng bán sản phẩm này?')">
                                    Xóa
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