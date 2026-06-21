<?php
require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../includes/auth.php";
requireAdmin();

$sql = "
    SELECT 
        id,
        full_name,
        email,
        phone,
        role,
        status,
        created_at
    FROM users
    ORDER BY id DESC
";

$stmt = $pdo->query($sql);
$users = $stmt->fetchAll();

require_once __DIR__ . "/../includes/header.php";
?>

<main class="container py-5">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
            <p class="text-uppercase text-secondary fw-semibold mb-1">
                Quản trị
            </p>

            <h1 class="fw-bold mb-0">Quản lý người dùng</h1>
        </div>

        <a href="../index.php" class="btn btn-outline-dark">
            Dashboard
        </a>
    </div>

    <?php if (isset($_GET["success"]) && $_GET["success"] === "updated"): ?>
        <div class="alert alert-success alert-dismissible fade show" role="alert">
            Cập nhật trạng thái người dùng thành công.

            <button
                type="button"
                class="btn-close"
                data-bs-dismiss="alert"
                aria-label="Close"
            ></button>
        </div>
    <?php endif; ?>

    <div class="card border-0 shadow-sm">
        <div class="table-responsive">
            <table class="table align-middle mb-0">
                <thead class="table-light">
                    <tr>
                        <th class="ps-4">ID</th>
                        <th>Họ tên</th>
                        <th>Email</th>
                        <th>Số điện thoại</th>
                        <th>Vai trò</th>
                        <th>Trạng thái</th>
                        <th>Ngày tạo</th>
                        <th class="text-end pe-4">Thao tác</th>
                    </tr>
                </thead>

                <tbody>
                    <?php if (count($users) === 0): ?>
                        <tr>
                            <td colspan="8" class="text-center py-5 text-secondary">
                                Chưa có người dùng nào.
                            </td>
                        </tr>
                    <?php endif; ?>

                    <?php foreach ($users as $user): ?>
                        <tr>
                            <td class="ps-4">
                                <?= $user["id"] ?>
                            </td>

                            <td class="fw-semibold">
                                <?= htmlspecialchars($user["full_name"]) ?>
                            </td>

                            <td>
                                <?= htmlspecialchars($user["email"]) ?>
                            </td>

                            <td>
                                <?= htmlspecialchars($user["phone"] ?? "Chưa có") ?>
                            </td>

                            <td>
                                <?php if ($user["role"] === "ADMIN"): ?>
                                    <span class="badge text-bg-dark">Admin</span>
                                <?php else: ?>
                                    <span class="badge text-bg-secondary">Khách hàng</span>
                                <?php endif; ?>
                            </td>

                            <td>
                                <?php if ($user["status"] === "ACTIVE"): ?>
                                    <span class="badge text-bg-success">Đang hoạt động</span>
                                <?php else: ?>
                                    <span class="badge text-bg-danger">Đã khóa</span>
                                <?php endif; ?>
                            </td>

                            <td>
                                <?= date("d/m/Y H:i", strtotime($user["created_at"])) ?>
                            </td>

                            <td class="text-end pe-4">
                                <?php if ($user["role"] === "ADMIN"): ?>
                                    <span class="text-secondary small">
                                        Không thao tác
                                    </span>
                                <?php else: ?>
                                    <?php if ($user["status"] === "ACTIVE"): ?>
                                        <a
                                            href="update-status.php?id=<?= $user["id"] ?>&status=INACTIVE"
                                            class="btn btn-sm btn-outline-danger"
                                            onclick="return confirm('Bạn có chắc muốn khóa tài khoản này?')"
                                        >
                                            Khóa
                                        </a>
                                    <?php else: ?>
                                        <a
                                            href="update-status.php?id=<?= $user["id"] ?>&status=ACTIVE"
                                            class="btn btn-sm btn-outline-success"
                                            onclick="return confirm('Bạn có chắc muốn mở khóa tài khoản này?')"
                                        >
                                            Mở khóa
                                        </a>
                                    <?php endif; ?>
                                <?php endif; ?>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </div>
</main>

<?php require_once __DIR__ . "/../includes/footer.php"; ?>