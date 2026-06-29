<?php
header("Content-Type: application/json");

include "db_connect.php";

$resourceID = intval($_POST["resourceID"] ?? 0);
$name = trim($_POST["name"] ?? "");
$capacity = intval($_POST["capacity"] ?? 0);
$location = trim($_POST["location"] ?? "");
$facilities = trim($_POST["facilities"] ?? "");

if ($resourceID <= 0 || $name === "" || $capacity <= 0 || $location === "") {
    echo json_encode([
        "success" => false,
        "message" => "Please fill in all required fields."
    ]);
    exit;
}

$sql = "
    UPDATE resources
    SET name = ?, capacity = ?, location = ?, facilities = ?
    WHERE resourceID = ?
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
    "sissi",
    $name,
    $capacity,
    $location,
    $facilities,
    $resourceID
);

if ($stmt->execute()) {
    echo json_encode([
        "success" => true,
        "message" => "Resource updated successfully."
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Failed to update resource: " . $stmt->error
    ]);
}

$stmt->close();
$conn->close();
?>