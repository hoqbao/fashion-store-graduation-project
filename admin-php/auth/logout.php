<?php
session_start();

session_unset();
session_destroy();

header("Location: /fashion-store-admin/auth/login.php");
exit;