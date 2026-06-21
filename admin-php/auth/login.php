<?php
session_start();

require_once __DIR__ . "/../config/database.php";

$error = "";

if (isset($_SESSION["admin_id"])) {
    header("Location: /fashion-store-admin/index.php");
    exit;
}

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $email = trim($_POST["email"] ?? "");
    $password = $_POST["password"] ?? "";

    if ($email === "" || $password === "") {
        $error = "Vui lòng nhập email và mật khẩu.";
    } else {
        $stmt = $pdo->prepare("
            SELECT *
            FROM users
            WHERE email = :email
              AND role = 'ADMIN'
              AND status = 'ACTIVE'
            LIMIT 1
        ");

        $stmt->execute([
            ":email" => $email
        ]);

        $admin = $stmt->fetch();

        if (!$admin || !password_verify($password, $admin["password"])) {
            $error = "Email hoặc mật khẩu admin không đúng.";
        } else {
            $_SESSION["admin_id"] = $admin["id"];
            $_SESSION["admin_name"] = $admin["full_name"];
            $_SESSION["admin_email"] = $admin["email"];
            $_SESSION["admin_role"] = $admin["role"];

            header("Location: /fashion-store-admin/index.php");
            exit;
        }
    }
}
?>

<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>Đăng nhập Admin</title>

    <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
        rel="stylesheet"
    >
</head>
<body class="bg-light">
    <main class="min-vh-100 d-flex align-items-center">
        <div class="container">
            <div
                class="card border-0 shadow-sm mx-auto"
                style="max-width: 460px;"
            >
                <div class="card-body p-4 p-md-5">
                    <div class="text-center mb-4">
                        <h1 class="h3 fw-bold mb-2">
                            FASHION STORE ADMIN
                        </h1>

                        <p class="text-secondary mb-0">
                            Đăng nhập hệ thống quản trị
                        </p>
                    </div>

                    <?php if ($error): ?>
                        <div class="alert alert-danger">
                            <?= htmlspecialchars($error) ?>
                        </div>
                    <?php endif; ?>

                    <form method="POST">
                        <div class="mb-3">
                            <label class="form-label">
                                Email
                            </label>

                            <input
                                type="email"
                                name="email"
                                class="form-control"
                                value="<?= htmlspecialchars($_POST["email"] ?? "") ?>"
                                required
                            >
                        </div>

                        <div class="mb-4">
                            <label class="form-label">
                                Mật khẩu
                            </label>

                            <input
                                type="password"
                                name="password"
                                class="form-control"
                                required
                            >
                        </div>

                        <button type="submit" class="btn btn-dark w-100">
                            Đăng nhập
                        </button>
                    </form>

                    <p class="text-center text-secondary small mt-4 mb-0">
                        Tài khoản demo: admin@gmail.com / 123456
                    </p>
                </div>
            </div>
        </div>
    </main>
</body>
</html>
