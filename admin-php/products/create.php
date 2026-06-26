<?php
require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../includes/upload.php";
require_once __DIR__ . "/../includes/auth.php";
requireAdmin();

$errors = [];

$categories = $pdo
    ->query("SELECT id, name FROM categories ORDER BY name ASC")
    ->fetchAll();

function createSlug($text)
{
    $text = trim($text);
    $text = mb_strtolower($text, "UTF-8");

    $unicode = [
        "a" => "áàảãạăắằẳẵặâấầẩẫậ",
        "d" => "đ",
        "e" => "éèẻẽẹêếềểễệ",
        "i" => "íìỉĩị",
        "o" => "óòỏõọôốồổỗộơớờởỡợ",
        "u" => "úùủũụưứừửữự",
        "y" => "ýỳỷỹỵ"
    ];

    foreach ($unicode as $nonUnicode => $unicodeChars) {
        $text = preg_replace("/[$unicodeChars]/u", $nonUnicode, $text);
    }

    $text = preg_replace("/[^a-z0-9\s-]/", "", $text);
    $text = preg_replace("/[\s-]+/", "-", $text);

    return trim($text, "-");
}

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $name = trim($_POST["name"] ?? "");
    $categoryId = $_POST["category_id"] ?? "";
    $description = trim($_POST["description"] ?? "");
    $basePrice = $_POST["base_price"] ?? "";
    $status = $_POST["status"] ?? "ACTIVE";

    $skus = $_POST["sku"] ?? [];
    $sizes = $_POST["size"] ?? [];
    $colors = $_POST["color"] ?? [];
    $prices = $_POST["variant_price"] ?? [];
    $stocks = $_POST["stock"] ?? [];

    if ($name === "") {
        $errors[] = "Vui lòng nhập tên sản phẩm.";
    }

    if ($categoryId === "") {
        $errors[] = "Vui lòng chọn danh mục.";
    }

    if ($basePrice === "" || !is_numeric($basePrice) || $basePrice <= 0) {
        $errors[] = "Giá sản phẩm không hợp lệ.";
    }

    $validVariants = [];

    for ($i = 0; $i < count($skus); $i++) {
        $sku = trim($skus[$i] ?? "");
        $size = trim($sizes[$i] ?? "");
        $color = trim($colors[$i] ?? "");
        $variantPrice = trim($prices[$i] ?? "");
        $stock = trim($stocks[$i] ?? "");

        if (
            $sku === "" &&
            $size === "" &&
            $color === "" &&
            $variantPrice === "" &&
            $stock === ""
        ) {
            continue;
        }

        if ($sku === "") {
            $errors[] = "Vui lòng nhập SKU cho biến thể dòng " . ($i + 1) . ".";
        }

        if ($size === "") {
            $errors[] = "Vui lòng nhập size cho biến thể dòng " . ($i + 1) . ".";
        }

        if ($color === "") {
            $errors[] = "Vui lòng nhập màu cho biến thể dòng " . ($i + 1) . ".";
        }

        if ($variantPrice === "" || !is_numeric($variantPrice) || $variantPrice <= 0) {
            $errors[] = "Giá biến thể dòng " . ($i + 1) . " không hợp lệ.";
        }

        if ($stock === "" || !is_numeric($stock) || $stock < 0) {
            $errors[] = "Tồn kho biến thể dòng " . ($i + 1) . " không hợp lệ.";
        }

        $validVariants[] = [
            "sku" => $sku,
            "size" => $size,
            "color" => $color,
            "price" => $variantPrice,
            "stock" => $stock
        ];
    }

    if (count($validVariants) === 0) {
        $errors[] = "Vui lòng nhập ít nhất 1 biến thể sản phẩm.";
    }

    if (empty($errors)) {
        try {
            $pdo->beginTransaction();

            $slug = createSlug($name) . "-" . time();

            $insertProductStmt = $pdo->prepare("
                INSERT INTO products
                    (category_id, name, slug, description, base_price, status, created_at, updated_at)
                VALUES
                    (:category_id, :name, :slug, :description, :base_price, :status, NOW(), NOW())
            ");

            $insertProductStmt->execute([
                ":category_id" => $categoryId,
                ":name" => $name,
                ":slug" => $slug,
                ":description" => $description,
                ":base_price" => $basePrice,
                ":status" => $status
            ]);

            $productId = $pdo->lastInsertId();

            if (
                isset($_FILES["images"]) &&
                isset($_FILES["images"]["name"]) &&
                is_array($_FILES["images"]["name"])
            ) {
                foreach ($_FILES["images"]["name"] as $index => $fileName) {
                    $fileError = $_FILES["images"]["error"][$index] ?? UPLOAD_ERR_NO_FILE;

                    if ($fileError === UPLOAD_ERR_NO_FILE) {
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
                            ":product_id" => $productId,
                            ":image_url" => $imageUrl
                        ]);
                    }
                }
            }

            $insertVariantStmt = $pdo->prepare("
                INSERT INTO product_variants
                    (product_id, sku, size, color, price, stock, status, created_at, updated_at)
                VALUES
                    (:product_id, :sku, :size, :color, :price, :stock, 'ACTIVE', NOW(), NOW())
            ");

            foreach ($validVariants as $variant) {
                $insertVariantStmt->execute([
                    ":product_id" => $productId,
                    ":sku" => $variant["sku"],
                    ":size" => $variant["size"],
                    ":color" => $variant["color"],
                    ":price" => $variant["price"],
                    ":stock" => $variant["stock"]
                ]);
            }

            $pdo->commit();

            header("Location: index.php");
            exit;
        } catch (Exception $e) {
            $pdo->rollBack();
            $errors[] = "Không thể thêm sản phẩm: " . $e->getMessage();
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

            <h1 class="fw-bold mb-0">Thêm sản phẩm</h1>
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
                <div class="card border-0 shadow-sm mb-4">
                    <div class="card-body p-4">
                        <h2 class="h4 fw-bold mb-4">
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
                                value="<?= htmlspecialchars($_POST["name"] ?? "") ?>"
                                required
                            >
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
                                        <?= (($_POST["category_id"] ?? "") == $category["id"]) ? "selected" : "" ?>
                                    >
                                        <?= htmlspecialchars($category["name"]) ?>
                                    </option>
                                <?php endforeach; ?>
                            </select>
                        </div>

                        <div class="mb-3">
                            <label class="form-label">
                                Mô tả
                            </label>

                            <textarea
                                name="description"
                                class="form-control"
                                rows="5"
                            ><?= htmlspecialchars($_POST["description"] ?? "") ?></textarea>
                        </div>

                        <div class="mb-3">
                            <label class="form-label">
                                Giá hiển thị chính
                            </label>

                            <input
                                type="number"
                                name="base_price"
                                class="form-control"
                                value="<?= htmlspecialchars($_POST["base_price"] ?? "") ?>"
                                min="0"
                                required
                            >
                        </div>

                        <div class="mb-0">
                            <label class="form-label">
                                Trạng thái
                            </label>

                            <select name="status" class="form-select">
                                <option
                                    value="ACTIVE"
                                    <?= (($_POST["status"] ?? "ACTIVE") === "ACTIVE") ? "selected" : "" ?>
                                >
                                    Đang bán
                                </option>

                                <option
                                    value="INACTIVE"
                                    <?= (($_POST["status"] ?? "") === "INACTIVE") ? "selected" : "" ?>
                                >
                                    Ngừng bán
                                </option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="card border-0 shadow-sm">
                    <div class="card-body p-4">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h2 class="h4 fw-bold mb-0">
                                Biến thể sản phẩm
                            </h2>

                            <button
                                type="button"
                                class="btn btn-sm btn-outline-dark"
                                onclick="addVariantRow()"
                            >
                                Thêm biến thể
                            </button>
                        </div>

                        <p class="text-secondary">
                            Mỗi dòng là một màu/size riêng. Ví dụ: Đen - M, Đen - L, Trắng - M.
                        </p>

                        <div class="table-responsive">
                            <table class="table align-middle">
                                <thead class="table-light">
                                    <tr>
                                        <th>SKU</th>
                                        <th>Size</th>
                                        <th>Màu</th>
                                        <th>Giá</th>
                                        <th>Tồn kho</th>
                                        <th></th>
                                    </tr>
                                </thead>

                                <tbody id="variantRows">
                                    <tr>
                                        <td>
                                            <input
                                                type="text"
                                                name="sku[]"
                                                class="form-control"
                                                placeholder="AO-001-DEN-M"
                                                required
                                            >
                                        </td>

                                        <td>
                                            <input
                                                type="text"
                                                name="size[]"
                                                class="form-control"
                                                placeholder="M"
                                                required
                                            >
                                        </td>

                                        <td>
                                            <input
                                                type="text"
                                                name="color[]"
                                                class="form-control"
                                                placeholder="Đen"
                                                required
                                            >
                                        </td>

                                        <td>
                                            <input
                                                type="number"
                                                name="variant_price[]"
                                                class="form-control"
                                                placeholder="199000"
                                                min="0"
                                                required
                                            >
                                        </td>

                                        <td>
                                            <input
                                                type="number"
                                                name="stock[]"
                                                class="form-control"
                                                value="10"
                                                min="0"
                                                required
                                            >
                                        </td>

                                        <td>
                                            <button
                                                type="button"
                                                class="btn btn-sm btn-outline-danger"
                                                onclick="removeVariantRow(this)"
                                            >
                                                Xóa
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div class="d-flex flex-wrap gap-2">
                            <button
                                type="button"
                                class="btn btn-sm btn-light border"
                                onclick="addQuickVariant('M')"
                            >
                                + Size M
                            </button>

                            <button
                                type="button"
                                class="btn btn-sm btn-light border"
                                onclick="addQuickVariant('L')"
                            >
                                + Size L
                            </button>

                            <button
                                type="button"
                                class="btn btn-sm btn-light border"
                                onclick="addQuickVariant('XL')"
                            >
                                + Size XL
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-lg-4">
                <div class="card border-0 shadow-sm">
                    <div class="card-body p-4">
                        <h2 class="h4 fw-bold mb-4">
                            Hình ảnh
                        </h2>

                        <div class="mb-0">
                            <label class="form-label">
                                Chọn ảnh từ máy
                            </label>

                            <div id="imageInputs">
                                <div class="input-group mb-2">
                                    <input
                                        type="file"
                                        name="images[]"
                                        class="form-control"
                                        accept="image/jpeg,image/png,image/webp"
                                    >

                                    <button
                                        type="button"
                                        class="btn btn-outline-danger"
                                        onclick="removeImageInput(this)"
                                    >
                                        Xóa
                                    </button>
                                </div>
                            </div>

                            <button
                                type="button"
                                class="btn btn-sm btn-outline-dark mt-2"
                                onclick="addImageInput()"
                            >
                                Thêm ảnh
                            </button>

                            <div class="form-text mt-2">
                                Mỗi ô chọn 1 ảnh. Bấm “Thêm ảnh” để thêm nhiều hình ảnh cho cùng một sản phẩm.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="mt-4 d-flex gap-2">
            <button type="submit" class="btn btn-dark">
                Lưu sản phẩm
            </button>

            <a href="index.php" class="btn btn-outline-dark">
                Hủy
            </a>
        </div>
    </form>
</main>

<script>
function addVariantRow() {
    const tbody = document.getElementById("variantRows");

    const tr = document.createElement("tr");

    tr.innerHTML = `
        <td>
            <input
                type="text"
                name="sku[]"
                class="form-control"
                placeholder="AO-001-DEN-M"
                required
            >
        </td>

        <td>
            <input
                type="text"
                name="size[]"
                class="form-control"
                placeholder="M"
                required
            >
        </td>

        <td>
            <input
                type="text"
                name="color[]"
                class="form-control"
                placeholder="Đen"
                required
            >
        </td>

        <td>
            <input
                type="number"
                name="variant_price[]"
                class="form-control"
                placeholder="199000"
                min="0"
                required
            >
        </td>

        <td>
            <input
                type="number"
                name="stock[]"
                class="form-control"
                value="10"
                min="0"
                required
            >
        </td>

        <td>
            <button
                type="button"
                class="btn btn-sm btn-outline-danger"
                onclick="removeVariantRow(this)"
            >
                Xóa
            </button>
        </td>
    `;

    tbody.appendChild(tr);
}

function addQuickVariant(size) {
    addVariantRow();

    const rows = document.querySelectorAll("#variantRows tr");
    const lastRow = rows[rows.length - 1];

    lastRow.querySelector('input[name="size[]"]').value = size;
}

function removeVariantRow(button) {
    const tbody = document.getElementById("variantRows");

    if (tbody.children.length <= 1) {
        alert("Sản phẩm phải có ít nhất 1 biến thể.");
        return;
    }

    button.closest("tr").remove();
}

function addImageInput() {
    const imageInputs = document.getElementById("imageInputs");

    const div = document.createElement("div");
    div.className = "input-group mb-2";

    div.innerHTML = `
        <input
            type="file"
            name="images[]"
            class="form-control"
            accept="image/jpeg,image/png,image/webp"
        >

        <button
            type="button"
            class="btn btn-outline-danger"
            onclick="removeImageInput(this)"
        >
            Xóa
        </button>
    `;

    imageInputs.appendChild(div);
}

function removeImageInput(button) {
    const imageInputs = document.getElementById("imageInputs");

    if (imageInputs.children.length <= 1) {
        alert("Phải có ít nhất 1 ô chọn ảnh.");
        return;
    }

    button.closest(".input-group").remove();
}
</script>

<?php require_once __DIR__ . "/../includes/footer.php"; ?>