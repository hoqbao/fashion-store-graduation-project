<?php
require_once __DIR__ . "/../includes/auth.php";
requireAdmin();

require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../includes/upload.php";

$id = $_GET["id"] ?? null;

if (!$id || !is_numeric($id)) {
    header("Location: index.php");
    exit;
}

function createSlug($text)
{
    $text = trim($text);
    $text = mb_strtolower($text, "UTF-8");

    $vietnamese = [
        "à",
        "á",
        "ạ",
        "ả",
        "ã",
        "â",
        "ầ",
        "ấ",
        "ậ",
        "ẩ",
        "ẫ",
        "ă",
        "ằ",
        "ắ",
        "ặ",
        "ẳ",
        "ẵ",
        "è",
        "é",
        "ẹ",
        "ẻ",
        "ẽ",
        "ê",
        "ề",
        "ế",
        "ệ",
        "ể",
        "ễ",
        "ì",
        "í",
        "ị",
        "ỉ",
        "ĩ",
        "ò",
        "ó",
        "ọ",
        "ỏ",
        "õ",
        "ô",
        "ồ",
        "ố",
        "ộ",
        "ổ",
        "ỗ",
        "ơ",
        "ờ",
        "ớ",
        "ợ",
        "ở",
        "ỡ",
        "ù",
        "ú",
        "ụ",
        "ủ",
        "ũ",
        "ư",
        "ừ",
        "ứ",
        "ự",
        "ử",
        "ữ",
        "ỳ",
        "ý",
        "ỵ",
        "ỷ",
        "ỹ",
        "đ"
    ];

    $latin = [
        "a",
        "a",
        "a",
        "a",
        "a",
        "a",
        "a",
        "a",
        "a",
        "a",
        "a",
        "a",
        "a",
        "a",
        "a",
        "a",
        "a",
        "e",
        "e",
        "e",
        "e",
        "e",
        "e",
        "e",
        "e",
        "e",
        "e",
        "e",
        "i",
        "i",
        "i",
        "i",
        "i",
        "o",
        "o",
        "o",
        "o",
        "o",
        "o",
        "o",
        "o",
        "o",
        "o",
        "o",
        "o",
        "o",
        "o",
        "o",
        "o",
        "o",
        "u",
        "u",
        "u",
        "u",
        "u",
        "u",
        "u",
        "u",
        "u",
        "u",
        "u",
        "y",
        "y",
        "y",
        "y",
        "y",
        "d"
    ];

    $text = str_replace($vietnamese, $latin, $text);
    $text = preg_replace("/[^a-z0-9]+/", "-", $text);
    $text = trim($text, "-");

    return $text;
}

function generateSku($productId, $size, $color)
{
    $base = "P" . $productId . "-" . createSlug($size) . "-" . createSlug($color);
    $base = strtoupper($base);

    return $base . "-" . strtoupper(substr(uniqid(), -6));
}

function reloadProductData($pdo, $id)
{
    $productStmt = $pdo->prepare("
        SELECT *
        FROM products
        WHERE id = :id
        LIMIT 1
    ");

    $productStmt->execute([
        ":id" => $id
    ]);

    $product = $productStmt->fetch();

    $imageStmt = $pdo->prepare("
        SELECT *
        FROM product_images
        WHERE product_id = :product_id
        ORDER BY id ASC
    ");

    $imageStmt->execute([
        ":product_id" => $id
    ]);

    $images = $imageStmt->fetchAll();

    $variantsStmt = $pdo->prepare("
        SELECT *
        FROM product_variants
        WHERE product_id = :product_id
        ORDER BY id ASC
    ");

    $variantsStmt->execute([
        ":product_id" => $id
    ]);

    $variants = $variantsStmt->fetchAll();

    return [$product, $images, $variants];
}

$error = "";
$success = "";

$categoriesStmt = $pdo->query("
    SELECT id, name
    FROM categories
    ORDER BY id ASC
");

$categories = $categoriesStmt->fetchAll();

[$product, $images, $variants] = reloadProductData($pdo, $id);

if (!$product) {
    header("Location: index.php");
    exit;
}

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $name = trim($_POST["name"] ?? "");
    $categoryId = $_POST["category_id"] ?? "";
    $description = trim($_POST["description"] ?? "");
    $basePrice = $_POST["base_price"] ?? 0;
    $status = $_POST["status"] ?? "ACTIVE";

    $variantIds = $_POST["variant_id"] ?? [];
    $variantSizes = $_POST["variant_size"] ?? [];
    $variantColors = $_POST["variant_color"] ?? [];
    $variantPrices = $_POST["variant_price"] ?? [];
    $variantStocks = $_POST["variant_stock"] ?? [];
    $variantStatuses = $_POST["variant_status"] ?? [];
    $deleteVariantIds = $_POST["delete_variant"] ?? [];
    $deleteImageIds = $_POST["delete_image"] ?? [];

    if ($name === "") {
        $error = "Vui lòng nhập tên sản phẩm.";
    } elseif ($categoryId === "") {
        $error = "Vui lòng chọn danh mục.";
    } elseif (!is_numeric($basePrice) || $basePrice <= 0) {
        $error = "Giá gốc không hợp lệ.";
    } else {
        try {
            $pdo->beginTransaction();

            $slug = createSlug($name);

            $updateProductStmt = $pdo->prepare("
                UPDATE products
                SET 
                    category_id = :category_id,
                    name = :name,
                    slug = :slug,
                    description = :description,
                    base_price = :base_price,
                    status = :status,
                    updated_at = NOW()
                WHERE id = :id
            ");

            $updateProductStmt->execute([
                ":category_id" => $categoryId,
                ":name" => $name,
                ":slug" => $slug,
                ":description" => $description,
                ":base_price" => $basePrice,
                ":status" => $status,
                ":id" => $id
            ]);

            if (
                isset($_FILES["images"]) &&
                isset($_FILES["images"]["name"]) &&
                is_array($_FILES["images"]["name"])
            ) {
                foreach ($_FILES["images"]["name"] as $index => $fileName) {
                    if ($_FILES["images"]["error"][$index] === UPLOAD_ERR_NO_FILE) {
                        continue;
                    }

                    $singleFile = [
                        "name" => $_FILES["images"]["name"][$index],
                        "type" => $_FILES["images"]["type"][$index],
                        "tmp_name" => $_FILES["images"]["tmp_name"][$index],
                        "error" => $_FILES["images"]["error"][$index],
                        "size" => $_FILES["images"]["size"][$index]
                    ];

                    $imageUrl = uploadProductImage($singleFile);

                    if ($imageUrl) {
                        $insertImageStmt = $pdo->prepare("
                INSERT INTO product_images
                    (product_id, image_url, created_at, updated_at)
                VALUES
                    (:product_id, :image_url, NOW(), NOW())
            ");

                        $insertImageStmt->execute([
                            ":product_id" => $id,
                            ":image_url" => $imageUrl
                        ]);
                    }
                }
            }
            foreach ($deleteImageIds as $deleteImageId) {
                if (!is_numeric($deleteImageId)) {
                    continue;
                }

                $imageSelectStmt = $pdo->prepare("
        SELECT image_url
        FROM product_images
        WHERE id = :id
          AND product_id = :product_id
        LIMIT 1
    ");

                $imageSelectStmt->execute([
                    ":id" => $deleteImageId,
                    ":product_id" => $id
                ]);

                $image = $imageSelectStmt->fetch();

                if ($image) {
                    $deleteImageStmt = $pdo->prepare("
            DELETE FROM product_images
            WHERE id = :id
              AND product_id = :product_id
        ");

                    $deleteImageStmt->execute([
                        ":id" => $deleteImageId,
                        ":product_id" => $id
                    ]);

                    $imageUrl = $image["image_url"];

                    $relativePath = str_replace(
                        "http://localhost/fashion-store-admin/",
                        "",
                        $imageUrl
                    );

                    $filePath = __DIR__ . "/../" . $relativePath;

                    if (is_file($filePath)) {
                        unlink($filePath);
                    }
                }
            }
            foreach ($variantSizes as $index => $size) {
                $variantId = trim($variantIds[$index] ?? "");
                $size = trim($size);
                $color = trim($variantColors[$index] ?? "");
                $price = $variantPrices[$index] ?? 0;
                $stock = $variantStocks[$index] ?? 0;
                $variantStatus = $variantStatuses[$index] ?? "ACTIVE";

                if ($size === "" && $color === "" && $price === "" && $stock === "") {
                    continue;
                }

                if ($size === "") {
                    throw new Exception("Vui lòng nhập size cho tất cả biến thể.");
                }

                if ($color === "") {
                    throw new Exception("Vui lòng nhập màu cho tất cả biến thể.");
                }

                if (!is_numeric($price) || $price <= 0) {
                    throw new Exception("Giá của biến thể không hợp lệ.");
                }

                if (!is_numeric($stock) || $stock < 0) {
                    throw new Exception("Số lượng tồn kho không hợp lệ.");
                }

                if ($variantId !== "") {
                    $updateVariantStmt = $pdo->prepare("
                        UPDATE product_variants
                        SET 
                            size = :size,
                            color = :color,
                            price = :price,
                            stock = :stock,
                            status = :status,
                            updated_at = NOW()
                        WHERE id = :id
                          AND product_id = :product_id
                    ");

                    $updateVariantStmt->execute([
                        ":size" => $size,
                        ":color" => $color,
                        ":price" => $price,
                        ":stock" => $stock,
                        ":status" => $variantStatus,
                        ":id" => $variantId,
                        ":product_id" => $id
                    ]);
                } else {
                    $checkVariantStmt = $pdo->prepare("
                        SELECT id
                        FROM product_variants
                        WHERE product_id = :product_id
                          AND size = :size
                          AND color = :color
                        LIMIT 1
                    ");

                    $checkVariantStmt->execute([
                        ":product_id" => $id,
                        ":size" => $size,
                        ":color" => $color
                    ]);

                    $existingVariant = $checkVariantStmt->fetch();

                    if ($existingVariant) {
                        $updateExistingVariantStmt = $pdo->prepare("
                            UPDATE product_variants
                            SET 
                                price = :price,
                                stock = :stock,
                                status = :status,
                                updated_at = NOW()
                            WHERE id = :id
                              AND product_id = :product_id
                        ");

                        $updateExistingVariantStmt->execute([
                            ":price" => $price,
                            ":stock" => $stock,
                            ":status" => $variantStatus,
                            ":id" => $existingVariant["id"],
                            ":product_id" => $id
                        ]);
                    } else {
                        $sku = generateSku($id, $size, $color);

                        $insertVariantStmt = $pdo->prepare("
                            INSERT INTO product_variants
                                (product_id, sku, size, color, price, stock, status, created_at, updated_at)
                            VALUES
                                (:product_id, :sku, :size, :color, :price, :stock, :status, NOW(), NOW())
                        ");

                        $insertVariantStmt->execute([
                            ":product_id" => $id,
                            ":sku" => $sku,
                            ":size" => $size,
                            ":color" => $color,
                            ":price" => $price,
                            ":stock" => $stock,
                            ":status" => $variantStatus
                        ]);
                    }
                }
            }

            foreach ($deleteVariantIds as $deleteVariantId) {
                $deleteVariantStmt = $pdo->prepare("
                    UPDATE product_variants
                    SET status = 'INACTIVE',
                        updated_at = NOW()
                    WHERE id = :id
                      AND product_id = :product_id
                ");

                $deleteVariantStmt->execute([
                    ":id" => $deleteVariantId,
                    ":product_id" => $id
                ]);
            }

            $pdo->commit();

            header("Location: index.php?success=updated");
            exit;
        } catch (Exception $e) {
            $pdo->rollBack();
            $error = "Không thể cập nhật sản phẩm: " . $e->getMessage();
        }
    }
}

if (isset($_GET["success"]) && $_GET["success"] === "updated") {
    $success = "Cập nhật sản phẩm thành công.";
}

[$product, $images, $variants] = reloadProductData($pdo, $id);

require_once __DIR__ . "/../includes/header.php";
?>

<main class="container py-5">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
            <p class="text-uppercase text-secondary fw-semibold mb-1">
                Sản phẩm
            </p>

            <h1 class="fw-bold mb-0">
                Sửa sản phẩm
            </h1>
        </div>

        <a href="index.php" class="btn btn-outline-dark">
            Quay lại
        </a>
    </div>

    <?php if ($error): ?>
        <div class="alert alert-danger">
            <?= htmlspecialchars($error) ?>
        </div>
    <?php endif; ?>

    <?php if ($success): ?>
        <div class="alert alert-success">
            <?= htmlspecialchars($success) ?>
        </div>

        <script>
            setTimeout(function() {
                window.location.href = "index.php";
            }, 1500);
        </script>
    <?php endif; ?>

    <form method="POST" enctype="multipart/form-data">
        <div class="row g-4">
            <div class="col-lg-8">
                <div class="card border-0 shadow-sm mb-4">
                    <div class="card-body p-4">
                        <h2 class="h5 fw-bold mb-4">
                            Thông tin sản phẩm
                        </h2>

                        <div class="mb-3">
                            <label class="form-label">
                                Tên sản phẩm
                            </label>

                            <input
                                type="text"
                                name="name"
                                class="form-control"
                                value="<?= htmlspecialchars($product["name"]) ?>"
                                required>
                        </div>

                        <div class="mb-3">
                            <label class="form-label">
                                Danh mục
                            </label>

                            <select name="category_id" class="form-select" required>
                                <option value="">-- Chọn danh mục --</option>

                                <?php foreach ($categories as $category): ?>
                                    <option
                                        value="<?= $category["id"] ?>"
                                        <?= $product["category_id"] == $category["id"] ? "selected" : "" ?>>
                                        <?= htmlspecialchars($category["name"]) ?>
                                    </option>
                                <?php endforeach; ?>
                            </select>
                        </div>

                        <div class="mb-3">
                            <label class="form-label">
                                Giá gốc
                            </label>

                            <input
                                type="number"
                                name="base_price"
                                class="form-control"
                                value="<?= htmlspecialchars($product["base_price"]) ?>"
                                min="0"
                                required>
                        </div>

                        <div class="mb-3">
                            <label class="form-label">
                                Mô tả
                            </label>

                            <textarea
                                name="description"
                                class="form-control"
                                rows="5"><?= htmlspecialchars($product["description"]) ?></textarea>
                        </div>

                        <div class="mb-0">
                            <label class="form-label">
                                Trạng thái sản phẩm
                            </label>

                            <select name="status" class="form-select">
                                <option
                                    value="ACTIVE"
                                    <?= $product["status"] === "ACTIVE" ? "selected" : "" ?>>
                                    Đang bán
                                </option>

                                <option
                                    value="INACTIVE"
                                    <?= $product["status"] === "INACTIVE" ? "selected" : "" ?>>
                                    Ngừng bán
                                </option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="card border-0 shadow-sm">
                    <div class="card-body p-4">
                        <div class="d-flex justify-content-between align-items-center mb-4">
                            <div>
                                <h2 class="h5 fw-bold mb-1">
                                    Size, màu, giá và tồn kho
                                </h2>

                                <p class="text-secondary mb-0">
                                    Mỗi dòng là một biến thể sản phẩm. Ví dụ: M - Đen, L - Xanh rêu.
                                </p>
                            </div>

                            <button
                                type="button"
                                class="btn btn-outline-dark btn-sm"
                                onclick="addVariantRow()">
                                Thêm size/màu
                            </button>
                        </div>

                        <div class="table-responsive">
                            <table class="table align-middle">
                                <thead class="table-light">
                                    <tr>
                                        <th style="min-width: 160px;">SKU</th>
                                        <th style="min-width: 110px;">Size</th>
                                        <th style="min-width: 150px;">Màu</th>
                                        <th style="min-width: 140px;">Giá</th>
                                        <th style="min-width: 120px;">Tồn kho</th>
                                        <th style="min-width: 140px;">Trạng thái</th>
                                        <th class="text-center">Ẩn</th>
                                    </tr>
                                </thead>

                                <tbody id="variantRows">
                                    <?php foreach ($variants as $variant): ?>
                                        <tr>
                                            <td>
                                                <span class="badge text-bg-light border">
                                                    <?= htmlspecialchars($variant["sku"]) ?>
                                                </span>

                                                <input
                                                    type="hidden"
                                                    name="variant_id[]"
                                                    value="<?= $variant["id"] ?>">
                                            </td>

                                            <td>
                                                <input
                                                    type="text"
                                                    name="variant_size[]"
                                                    class="form-control"
                                                    value="<?= htmlspecialchars($variant["size"]) ?>"
                                                    required>
                                            </td>

                                            <td>
                                                <input
                                                    type="text"
                                                    name="variant_color[]"
                                                    class="form-control"
                                                    value="<?= htmlspecialchars($variant["color"]) ?>"
                                                    required>
                                            </td>

                                            <td>
                                                <input
                                                    type="number"
                                                    name="variant_price[]"
                                                    class="form-control"
                                                    value="<?= htmlspecialchars($variant["price"]) ?>"
                                                    min="0"
                                                    required>
                                            </td>

                                            <td>
                                                <input
                                                    type="number"
                                                    name="variant_stock[]"
                                                    class="form-control"
                                                    value="<?= htmlspecialchars($variant["stock"]) ?>"
                                                    min="0"
                                                    required>
                                            </td>

                                            <td>
                                                <select name="variant_status[]" class="form-select">
                                                    <option
                                                        value="ACTIVE"
                                                        <?= $variant["status"] === "ACTIVE" ? "selected" : "" ?>>
                                                        Đang bán
                                                    </option>

                                                    <option
                                                        value="INACTIVE"
                                                        <?= $variant["status"] === "INACTIVE" ? "selected" : "" ?>>
                                                        Ngừng bán
                                                    </option>
                                                </select>
                                            </td>

                                            <td class="text-center">
                                                <input
                                                    type="checkbox"
                                                    name="delete_variant[]"
                                                    value="<?= $variant["id"] ?>"
                                                    class="form-check-input">
                                            </td>
                                        </tr>
                                    <?php endforeach; ?>

                                    <?php if (count($variants) === 0): ?>
                                        <tr>
                                            <td>
                                                <span class="badge text-bg-secondary">
                                                    Tự tạo
                                                </span>

                                                <input type="hidden" name="variant_id[]" value="">
                                            </td>

                                            <td>
                                                <input type="text" name="variant_size[]" class="form-control" placeholder="M" required>
                                            </td>

                                            <td>
                                                <input type="text" name="variant_color[]" class="form-control" placeholder="Đen" required>
                                            </td>

                                            <td>
                                                <input type="number" name="variant_price[]" class="form-control" placeholder="250000" min="0" required>
                                            </td>

                                            <td>
                                                <input type="number" name="variant_stock[]" class="form-control" placeholder="10" min="0" required>
                                            </td>

                                            <td>
                                                <select name="variant_status[]" class="form-select">
                                                    <option value="ACTIVE">Đang bán</option>
                                                    <option value="INACTIVE">Ngừng bán</option>
                                                </select>
                                            </td>

                                            <td></td>
                                        </tr>
                                    <?php endif; ?>
                                </tbody>
                            </table>
                        </div>

                        <p class="text-secondary small mb-0">
                            Ghi chú: Không sửa SKU trực tiếp. Muốn thêm L - Xanh rêu thì bấm “Thêm size/màu”, nhập size L, màu Xanh rêu, giá và tồn kho rồi lưu.
                        </p>
                    </div>
                </div>
            </div>

            <div class="col-lg-4">
                <div class="card border-0 shadow-sm mb-4">
                    <div class="card-body p-4">
                        <h2 class="h5 fw-bold mb-4">
                            Hình ảnh sản phẩm
                        </h2>

                        <?php if (count($images) > 0): ?>
                            <div class="row g-2 mb-3">
                                <?php foreach ($images as $image): ?>
                                    <div class="col-6">
                                        <div class="border rounded p-2 h-100">
                                            <img
                                                src="<?= htmlspecialchars($image["image_url"]) ?>"
                                                alt="Product image"
                                                class="img-fluid rounded"
                                                style="height: 150px; width: 100%; object-fit: cover;">

                                            <div class="form-check mt-2">
                                                <input
                                                    class="form-check-input"
                                                    type="checkbox"
                                                    name="delete_image[]"
                                                    value="<?= $image["id"] ?>"
                                                    id="delete_image_<?= $image["id"] ?>">

                                                <label
                                                    class="form-check-label text-danger small"
                                                    for="delete_image_<?= $image["id"] ?>">
                                                    Xóa ảnh này
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                <?php endforeach; ?>
                            </div>
                        <?php else: ?>
                            <p class="text-secondary">
                                Chưa có hình ảnh.
                            </p>
                        <?php endif; ?>

                        <label class="form-label">
                            Thêm hình ảnh mới
                        </label>

                        <input
                            type="file"
                            name="images[]"
                            class="form-control"
                            accept="image/*"
                            multiple> type="file"
                        name="image"
                        class="form-control"
                        accept="image/*">

                        <p class="text-secondary small mb-0 mt-2">
                            Có thể chọn nhiều hình ảnh cùng lúc. Các ảnh mới sẽ được thêm vào danh sách hình ảnh sản phẩm.
                        </p>
                    </div>
                </div>

                <div class="card border-0 shadow-sm">
                    <div class="card-body p-4">
                        <button type="submit" class="btn btn-dark w-100 mb-2">
                            Lưu thay đổi
                        </button>

                        <a href="index.php" class="btn btn-outline-secondary w-100">
                            Hủy
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </form>
</main>

<script>
    function addVariantRow() {
        const tbody = document.getElementById("variantRows");

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>
                <span class="badge text-bg-secondary">Tự tạo</span>
                <input type="hidden" name="variant_id[]" value="">
            </td>

            <td>
                <input type="text" name="variant_size[]" class="form-control" placeholder="L" required>
            </td>

            <td>
                <input type="text" name="variant_color[]" class="form-control" placeholder="Xanh rêu" required>
            </td>

            <td>
                <input type="number" name="variant_price[]" class="form-control" placeholder="189000" min="0" required>
            </td>

            <td>
                <input type="number" name="variant_stock[]" class="form-control" placeholder="50" min="0" required>
            </td>

            <td>
                <select name="variant_status[]" class="form-select">
                    <option value="ACTIVE">Đang bán</option>
                    <option value="INACTIVE">Ngừng bán</option>
                </select>
            </td>

            <td class="text-center">
                <button type="button" class="btn btn-sm btn-outline-danger" onclick="this.closest('tr').remove()">
                    Xóa
                </button>
            </td>
        `;

        tbody.appendChild(tr);
    }
</script>

<?php require_once __DIR__ . "/../includes/footer.php"; ?>