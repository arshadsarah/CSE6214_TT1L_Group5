<?php
require_once "db_connect.php";

$data = json_decode(file_get_contents("php://input"), true);

$username = trim($data["username"] ?? "");
$email = trim($data["email"] ?? "");
$password = trim($data["password"] ?? "");
$role = trim($data["role"] ?? "");

if ($username === "" || $email === "" || $password === "" || $role === "") {
    echo json_encode([
        "success" => false,
        "message" => "Username, email, password and role are required."
    ]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid email address."
    ]);
    exit;
}

$stmt = $conn->prepare(
    "SELECT userID, username, name, email, department, role, password, status 
     FROM users 
     WHERE username = ? AND email = ? AND role = ?"
);

$stmt->bind_param("sss", $username, $email, $role);
$stmt->execute();

$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid username, email or role."
    ]);
    exit;
}

$user = $result->fetch_assoc();

if ($user["password"] !== $password) {
    echo json_encode([
        "success" => false,
        "message" => "Incorrect password."
    ]);
    exit;
}

if ($user["status"] !== "Active") {
    echo json_encode([
        "success" => false,
        "message" => "This account is inactive."
    ]);
    exit;
}

$redirectPage = "";

if ($user["role"] === "Admin") {
    $redirectPage = "admin-dashboard.html";
} else if ($user["role"] === "Student") {
    $redirectPage = "student-dashboard.html";
} else if ($user["role"] === "Staff / Faculty") {
    $redirectPage = "staff-dashboard.html";
} else if ($user["role"] === "Resource Manager") {
    $redirectPage = "resource-manager-dashboard.html";
} else {
    echo json_encode([
        "success" => false,
        "message" => "Unknown role."
    ]);
    exit;
}

unset($user["password"]);

echo json_encode([
    "success" => true,
    "message" => "Login successful.",
    "user" => $user,
    "redirect" => $redirectPage
]);
?>