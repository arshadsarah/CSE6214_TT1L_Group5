<?php
header("Content-Type: application/json");

include "db_connect.php";

$name = trim($_POST["name"] ?? "");
$type = trim($_POST["type"] ?? "");
$capacity = trim($_POST["capacity"] ?? "");
$location = trim($_POST["location"] ?? "");
$facilities = trim($_POST["facilities"] ?? "");
$availability = trim($_POST["availability"] ?? "Available");

$status = "Active";
$approvalRequired = "No";

if ($name === "" || $type === "" || $capacity === "" || $location === "") {
    echo json_encode([
        "success" => false,
        "message" => "Please fill in all required fields."
    ]);
    exit;
}

$sql = "
    INSERT INTO resources 
    (name, type, capacity, location, facilities, status, approvalRequired)
    VALUES (?, ?, ?, ?, ?, ?, ?)
";

$stmt = $conn->prepare($sql);

if (!$stmt) {
    echo json_encode([
        "success" => false,
        "message" => "SQL prepare failed: " . $conn->error
    ]);
    exit;
}

$stmt->bind_param(
    "ssissss",
    $name,
    $type,
    $capacity,
    $location,
    $facilities,
    $status,
    $approvalRequired
);

if ($stmt->execute()) {
    echo json_encode([
        "success" => true,
        "message" => "Resource registered successfully."
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Failed to register resource: " . $stmt->error
    ]);
}

$stmt->close();
$conn->close();
?>