<?php
require_once "db_connect.php";

$method = $_SERVER["REQUEST_METHOD"];

if ($method === "OPTIONS") {
    exit;
}

$allowedRoles = [
    "Student",
    "Staff / Faculty",
    "Resource Manager",
    "Admin"
];

$allowedStatuses = [
    "Active",
    "Inactive"
];

function sendResponse($success, $message, $extra = []) {
    echo json_encode(array_merge([
        "success" => $success,
        "message" => $message
    ], $extra));
    exit;
}

function validateUser($data, $isUpdate = false) {
    global $allowedRoles, $allowedStatuses;

    $username = trim($data["username"] ?? "");
    $name = trim($data["name"] ?? "");
    $email = trim($data["email"] ?? "");
    $password = trim($data["password"] ?? "");
    $department = trim($data["department"] ?? "");
    $role = trim($data["role"] ?? "");
    $status = trim($data["status"] ?? "");

    if ($username === "") {
        sendResponse(false, "Username is required.");
    }

    if (strlen($username) < 3) {
        sendResponse(false, "Username must be at least 3 characters.");
    }

    if (!preg_match("/^[A-Za-z0-9_]+$/", $username)) {
        sendResponse(false, "Username can contain letters, numbers and underscore only.");
    }

    if ($name === "") {
        sendResponse(false, "Name is required.");
    }

    if (strlen($name) < 3) {
        sendResponse(false, "Name must be at least 3 characters.");
    }

    if (!preg_match("/^[A-Za-z .'-]+$/", $name)) {
        sendResponse(false, "Name can contain letters, spaces, dot, apostrophe and dash only.");
    }

    if ($email === "") {
        sendResponse(false, "Email is required.");
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        sendResponse(false, "Invalid email address.");
    }

    if (!$isUpdate && $password === "") {
        sendResponse(false, "Password is required.");
    }

    if ($password !== "" && strlen($password) < 6) {
        sendResponse(false, "Password must be at least 6 characters.");
    }

    if ($department === "") {
        sendResponse(false, "Department is required.");
    }

    if ($role === "" || !in_array($role, $allowedRoles)) {
        sendResponse(false, "Invalid role selected.");
    }

    if ($status === "" || !in_array($status, $allowedStatuses)) {
        sendResponse(false, "Invalid status selected.");
    }

    return [
        "username" => $username,
        "name" => $name,
        "email" => $email,
        "password" => $password,
        "department" => $department,
        "role" => $role,
        "status" => $status
    ];
}

/* GET USERS */
if ($method === "GET") {
    $type = trim($_GET["type"] ?? "");

    $roleMap = [
        "students" => "Student",
        "faculty" => "Staff / Faculty",
        "managers" => "Resource Manager",
        "admins" => "Admin"
    ];

    if ($type !== "" && isset($roleMap[$type])) {
        $role = $roleMap[$type];

        $stmt = $conn->prepare(
            "SELECT userID, username, name, email, department, role, status 
             FROM users 
             WHERE role = ? 
             ORDER BY userID DESC"
        );

        $stmt->bind_param("s", $role);
        $stmt->execute();
        $result = $stmt->get_result();
    } else {
        $result = $conn->query(
            "SELECT userID, username, name, email, department, role, status 
             FROM users 
             ORDER BY userID DESC"
        );
    }

    $users = [];

    while ($row = $result->fetch_assoc()) {
        $users[] = $row;
    }

    sendResponse(true, "Users loaded successfully.", [
        "users" => $users
    ]);
}

/* CREATE USER */
if ($method === "POST") {
    $data = json_decode(file_get_contents("php://input"), true);

    $user = validateUser($data, false);

    $checkStmt = $conn->prepare(
        "SELECT userID FROM users WHERE username = ? OR email = ?"
    );

    $checkStmt->bind_param("ss", $user["username"], $user["email"]);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();

    if ($checkResult->num_rows > 0) {
        sendResponse(false, "Username or email already exists.");
    }

    $stmt = $conn->prepare(
        "INSERT INTO users 
        (username, name, email, password, department, role, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)"
    );

    $stmt->bind_param(
        "sssssss",
        $user["username"],
        $user["name"],
        $user["email"],
        $user["password"],
        $user["department"],
        $user["role"],
        $user["status"]
    );

    if ($stmt->execute()) {
        sendResponse(true, "User added successfully.");
    } else {
        sendResponse(false, "Failed to add user.");
    }
}

/* UPDATE USER */
if ($method === "PUT") {
    $data = json_decode(file_get_contents("php://input"), true);

    $userID = intval($data["userID"] ?? 0);

    if ($userID <= 0) {
        sendResponse(false, "Invalid user ID.");
    }

    $user = validateUser($data, true);

    $checkStmt = $conn->prepare(
        "SELECT userID FROM users 
         WHERE (username = ? OR email = ?) AND userID != ?"
    );

    $checkStmt->bind_param("ssi", $user["username"], $user["email"], $userID);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();

    if ($checkResult->num_rows > 0) {
        sendResponse(false, "Username or email already exists.");
    }

    if ($user["password"] !== "") {
        $stmt = $conn->prepare(
            "UPDATE users 
             SET username = ?, name = ?, email = ?, password = ?, department = ?, role = ?, status = ?
             WHERE userID = ?"
        );

        $stmt->bind_param(
            "sssssssi",
            $user["username"],
            $user["name"],
            $user["email"],
            $user["password"],
            $user["department"],
            $user["role"],
            $user["status"],
            $userID
        );
    } else {
        $stmt = $conn->prepare(
            "UPDATE users 
             SET username = ?, name = ?, email = ?, department = ?, role = ?, status = ?
             WHERE userID = ?"
        );

        $stmt->bind_param(
            "ssssssi",
            $user["username"],
            $user["name"],
            $user["email"],
            $user["department"],
            $user["role"],
            $user["status"],
            $userID
        );
    }

    if ($stmt->execute()) {
        sendResponse(true, "User updated successfully.");
    } else {
        sendResponse(false, "Failed to update user.");
    }
}

/* DELETE USER */
if ($method === "DELETE") {
    $userID = intval($_GET["id"] ?? 0);

    if ($userID <= 0) {
        sendResponse(false, "Invalid user ID.");
    }

    $stmt = $conn->prepare("DELETE FROM users WHERE userID = ?");
    $stmt->bind_param("i", $userID);

    if ($stmt->execute()) {
        sendResponse(true, "User deleted successfully.");
    } else {
        sendResponse(false, "Failed to delete user.");
    }
}

sendResponse(false, "Invalid request method.");
?>