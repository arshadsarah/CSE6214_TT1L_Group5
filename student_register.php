<?php
require_once "db_connect.php";

$message = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $name = trim($_POST["name"]);
    $email = trim($_POST["email"]);
    $username = trim($_POST["username"]);
    $department = trim($_POST["department"]);
    $password = trim($_POST["password"]);
    $confirmPassword = trim($_POST["confirm_password"]);

    $role = "Student";
    $status = "Active";

    if (
        $name === "" ||
        $email === "" ||
        $username === "" ||
        $department === "" ||
        $password === "" ||
        $confirmPassword === ""
    ) {
        $message = "Please fill in all required fields.";
    } else if (!preg_match('/^[A-Za-z0-9._]{3,30}$/', $username)) {
        $message = "Username must be 3-30 characters and can only contain letters, numbers, dot or underscore.";
    } else if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $message = "Invalid email address.";
    } else if ($password !== $confirmPassword) {
        $message = "Passwords do not match.";
    } else if (strlen($password) < 8) {
        $message = "Password must be at least 8 characters long.";
    } else if (!preg_match('/^(?=.*[A-Za-z])(?=.*\d).+$/', $password)) {
        $message = "Password must include at least one letter and one number.";
    } else {

        $stmtCheck = $conn->prepare(
            "SELECT userID FROM users WHERE email = ? OR username = ?"
        );

        $stmtCheck->bind_param("ss", $email, $username);
        $stmtCheck->execute();
        $result = $stmtCheck->get_result();

        if ($result->num_rows > 0) {
            $message = "Email or username already registered.";
        } else {

            $stmtInsert = $conn->prepare(
                "INSERT INTO users (name, email, department, role, password, status, username)
                 VALUES (?, ?, ?, ?, ?, ?, ?)"
            );

            $stmtInsert->bind_param(
                "sssssss",
                $name,
                $email,
                $department,
                $role,
                $password,
                $status,
                $username
            );

            if ($stmtInsert->execute()) {
                header("Location: login.html?registration=success");
                exit;
            } else {
                $message = "Registration failed. Please try again.";
            }
        }
    }
}

if ($message !== "") {
    header("Location: student-register.html?error=" . urlencode($message));
    exit;
}
?>