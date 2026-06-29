<?php
header("Content-Type: application/json");

include "db_connect.php";

$resourceID = intval($_POST["resourceID"] ?? 0);
$availability = trim($_POST["availability"] ?? "");
$status = trim($_POST["status"] ?? "");
$availableDate = trim($_POST["availableDate"] ?? "");
$availableStart = trim($_POST["availableStart"] ?? "");
$availableEnd = trim($_POST["availableEnd"] ?? "");

if ($resourceID <= 0 || $availability === "" || $status === "") {
    echo json_encode([
        "success" => false,
        "message" => "Please select a resource and fill in the required fields."
    ]);
    exit;
}

$maintenanceStatus = "None";

if ($status === "Under Maintenance") {
    $maintenanceStatus = "Under Maintenance";
}

$sql = "
    UPDATE resources
    SET 
        availability = ?,
        status = ?,
        maintenanceStatus = ?,
        availableDate = ?,
        availableStart = ?,
        availableEnd = ?
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
    "ssssssi",
    $availability,
    $status,
    $maintenanceStatus,
    $availableDate,
    $availableStart,
    $availableEnd,
    $resourceID
);

if ($stmt->execute()) {
    echo json_encode([
        "success" => true,
        "message" => "Availability updated successfully."
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Failed to update availability: " . $stmt->error
    ]);
}

$stmt->close();
$conn->close();
?>