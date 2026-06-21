<?php
require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../includes/upload.php";
require_once __DIR__ . "/../includes/auth.php";
requireAdmin();

$errors = [];

$id = $_GET["id"] ?? null;

if (!$id || !is_numeric($id)) {
    header("Location: index.php");
    exit;
}

$categories = $pdo
    ->query("SELECT id, name FROM categories ORDER BY name ASC")
    ->fetchAll();

$stmt = $pdo->prepare("
    SELECT *
    FROM products
    WHERE id = :id
    LIMIT 1
");
$stmt->execute([":id" => $id]);
$product = $stmt->fetch();

if (!$product) {
    header("Location: index.php");
    exit;
}

$stmt = $pdo->prepare("
    SELECT *
    FROM product_images
    WHERE product_id = :product_id
    ORDER BY id ASC
    LIMIT 1
");
$stmt->execute([":product_id" => $id]);
$productImage = $stmt->fetch();

$stmt = $pdo->prepare("
    SELECT *
    FROM product_variants
    WHERE product_id = :product_id
    ORDER BY id ASC
    LIMIT 1
");
$stmt->execute([":product_id" => $id]);
$productVariant = $stmt->fetch();

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $name = trim($_POST["name"] ?? "");
    $categoryId = $_POST["category_id"] ?? "";
    $description = trim($_POST["description"] ?? "");
    $basePrice = $_POST["base_price"] ?? "";
    $status = $_POST["status"] ?? "ACTIVE";

    $imageUrl = null;

    try {
        $imageUrl = uploadProductImage($_FILES["image"] ?? null);
    } catch (Exception $e) {
        $errors[] = $e->getMessage();
    }

    $sku = trim($_POST["sku"] ?? "");
    $size = trim($_POST["size"] ?? "");
    $color = trim($_POST["color"] ?? "");
    $stock = $_POST["stock"] ?? 0;

    if ($name === "") {
        $errors[] = "Vui lòng nhập tên sản phẩm.";
    }

    if ($categoryId === "") {
        $errors[] = "Vui lòng chọn danh mục.";
    }

    if ($basePrice === "" || !is_numeric($basePrice) || $basePrice <= 0) {
        $errors[] = "Giá sản phẩm không hợp lệ.";
    }

    if ($sku === "") {
        $errors[] = "Vui lòng nhập mã SKU.";
    }

    if ($size === "") {
        $errors[] = "Vui lòng nhập size.";
    }

    if ($color === "") {
        $errors[] = "Vui lòng nhập màu sắc.";
    }

    if (!is_numeric($stock) || $stock < 0) {
        $errors[] = "Số lượng tồn kho không hợp lệ.";
    }

    if (empty($errors)) {
        try {
            $pdo->beginTransaction();

            $stmt = $pdo->prepare("
                UPDATE products
                SET
                    category_id = :category_id,
                    name = :name,
                    description = :description,
                    base_price = :base_price,
                    status = :status,
                    updated_at = NOW()
                WHERE id = :id
            ");

            $stmt->execute([
                ":category_id" => $categoryId,
                ":name" => $name,
                ":description" => $description,
                ":base_price" => $basePrice,
                ":status" => $status,
                ":id" => $id
            ]);

            if ($imageUrl) {
                if ($productImage) {
                    $stmt = $pdo->prepare("
                        UPDATE product_images
                        SET image_url = :image_url,
                            updated_at = NOW()
                        WHERE id = :id
                    ");

                    $stmt->execute([
                        ":image_url" => $imageUrl,
                        ":id" => $productImage["id"]
                    ]);
                } else {
                    $stmt = $pdo->prepare("
                        INSERT INTO product_images
                            (product_id, image_url, created_at, updated_at)
                        VALUES
                            (:product_id, :image_url, NOW(), NOW())
                    ");

                    $stmt->execute([
                        ":product_id" => $id,
                        ":image_url" => $imageUrl
                    ]);
                }
            }

            if ($productVariant) {
                $stmt = $pdo->prepare("
                    UPDATE product_variants
                    SET
                        sku = :sku,
                        size = :size,
                        color = :color,
                        price = :price,
                        stock = :stock,
                        status = :status,
                        updated_at = NOW()
                    WHERE id = :id
                ");

                $stmt->execute([
                    ":sku" => $sku,
                    ":size" => $size,
                    ":color" => $color,
                    ":price" => $basePrice,
                    ":stock" => $stock,
                    ":status" => $status,
                    ":id" => $productVariant["id"]
                ]);
            } else {
                $stmt = $pdo->prepare("
                    INSERT INTO product_variants
                        (product_id, sku, size, color, price, stock, status, created_at, updated_at)
                    VALUES
                        (:product_id, :sku, :size, :color, :price, :stock, :status, NOW(), NOW())
                ");

                $stmt->execute([
                    ":product_id" => $id,
                    ":sku" => $sku,
                    ":size" => $size,
                    ":color" => $color,
                    ":price" => $basePrice,
                    ":stock" => $stock,
                    ":status" => $status
                ]);
            }

            $pdo->commit();

            header("Location: index.php");
            exit;
        } catch (PDOException $e) {
            $pdo->rollBack();
            $errors[] = "Không thể cập nhật sản phẩm: " . $e->getMessage();
        }
    }
}

require_once __DIR__ . "/../includes/header.php";
?>

<main class="container py-5">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
            <p class="text-uppercase text-secondary fw-semibold mb-1">
                Quản trị sản phẩm
            </p>

            <h1 class="fw-bold mb-0">Sửa sản phẩm</h1>
        </div>

        <a href="index.php" class="btn btn-outline-dark">
            Quay lại
        </a>
    </div>

    <?php if (!empty($errors)): ?>
        <div class="alert alert-danger">
            <ul class="mb-0">
                <?php foreach ($errors as $error): ?>
                    <li><?= htmlspecialchars($error) ?></li>
                <?php endforeach; ?>
            </ul>
        </div>
    <?php endif; ?>

    <form method="POST" enctype="multipart/form-data">
        <div class="row g-4">
            <div class="col-lg-8">
                <div class="card border-0 shadow-sm">
                    <div class="card-body p-4">
                        <h2 class="h4 fw-bold mb-4">Thông tin sản phẩm</h2>

                        <div class="mb-3">
                            <label class="form-label">Tên sản phẩm</label>

                            <input
                                type="text"
                                name="name"
                                class="form-control"
                                value="<?= htmlspecialchars($_POST["name"] ?? $product["name"]) ?>"
                                required>
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Danh mục</label>

                            <select name="category_id" class="form-select" required>
                                <option value="">-- Chọn danh mục --</option>

                                <?php foreach ($categories as $category): ?>
                                    <option
                                        value="<?= $category["id"] ?>"
                                        <?= (($_POST["category_id"] ?? $product["category_id"]) == $category["id"]) ? "selected" : "" ?>>
                                        <?= htmlspecialchars($category["name"]) ?>
                                    </option>
                                <?php endforeach; ?>
                            </select>
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Mô tả</label>

                            <textarea
                                name="description"
                                class="form-control"
                                rows="5"><?= htmlspecialchars($_POST["description"] ?? $product["description"] ?? "") ?></textarea>
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Giá bán</label>

                            <input
                                type="number"
                                name="base_price"
                                class="form-control"
                                value="<?= htmlspecialchars($_POST["base_price"] ?? $product["base_price"]) ?>"
                                min="0"
                                required>
                        </div>

                        <div class="mb-0">
                            <label class="form-label">Trạng thái</label>

                            <?php $currentStatus = $_POST["status"] ?? $product["status"]; ?>

                            <select name="status" class="form-select">
                                <option value="ACTIVE" <?= $currentStatus === "ACTIVE" ? "selected" : "" ?>>
                                    Đang bán
                                </option>

                                <option value="INACTIVE" <?= $currentStatus === "INACTIVE" ? "selected" : "" ?>>
                                    Ngừng bán
                                </option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-lg-4">
                <div class="card border-0 shadow-sm mb-4">
                    <div class="card-body p-4">
                        <h2 class="h4 fw-bold mb-4">Hình ảnh</h2>

                        <div class="mb-3">
                            <label class="form-label">Link hình ảnh</label>

                            <input
                                type="file"
                                name="image"
                                class="form-control"
                                accept="image/jpeg,image/png,image/webp">

                            <div class="form-text">
                                Chọn ảnh mới nếu muốn thay đổi hình sản phẩm.
                            </div>
                        </div>

                        <img
                            src="<?= htmlspecialchars($productImage["image_url"] ?? "https://placehold.co/400x520?text=No+Image") ?>"
                            alt="Product image"
                            style="width: 100%; max-height: 320px; object-fit: cover; border-radius: 10px; background: #f1f1f1;">
                    </div>
                </div>

                <div class="card border-0 shadow-sm">
                    <div class="card-body p-4">
                        <h2 class="h4 fw-bold mb-4">Biến thể chính</h2>

                        <div class="mb-3">
                            <label class="form-label">SKU</label>

                            <input
                                type="text"
                                name="sku"
                                class="form-control"
                                value="<?= htmlspecialchars($_POST["sku"] ?? $productVariant["sku"] ?? "") ?>"
                                required>
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Size</label>

                            <input
                                type="text"
                                name="size"
                                class="form-control"
                                value="<?= htmlspecialchars($_POST["size"] ?? $productVariant["size"] ?? "") ?>"
                                required>
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Màu sắc</label>

                            <input
                                type="text"
                                name="color"
                                class="form-control"
                                value="<?= htmlspecialchars($_POST["color"] ?? $productVariant["color"] ?? "") ?>"
                                required>
                        </div>

                        <div class="mb-0">
                            <label class="form-label">Tồn kho</label>

                            <input
                                type="number"
                                name="stock"
                                class="form-control"
                                value="<?= htmlspecialchars($_POST["stock"] ?? $productVariant["stock"] ?? 0) ?>"
                                min="0"
                                required>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="mt-4 d-flex gap-2">
            <button type="submit" class="btn btn-dark">
                Cập nhật sản phẩm
            </button>

            <a href="index.php" class="btn btn-outline-dark">
                Hủy
            </a>
        </div>
    </form>
</main>

<?php require_once __DIR__ . "/../includes/footer.php"; ?>