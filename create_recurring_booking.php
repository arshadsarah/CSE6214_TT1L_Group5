<?php
header("Content-Type: application/json");

include "db_connect.php";

$userID = $_POST["userID"] ?? 1;
$resourceID = $_POST["resourceID"] ?? "";
$repeatType = $_POST["repeatType"] ?? "";
$repeatDay = $_POST["repeatDay"] ?? "";
$startDate = $_POST["startDate"] ?? "";
$endDate = $_POST["endDate"] ?? "";
$startTime = $_POST["startTime"] ?? "";
$endTime = $_POST["endTime"] ?? "";
$purpose = $_POST["purpose"] ?? "";
$requirements = $_POST["requirements"] ?? "";

if (
    $resourceID == "" ||
    $repeatType == "" ||
    $repeatDay == "" ||
    $startDate == "" ||
    $endDate == "" ||
    $startTime == "" ||
    $endTime == "" ||
    $purpose == ""
) {
    echo json_encode([
        "success" => false,
        "message" => "Please fill in all required fields."
    ]);
    exit;
}

if ($startDate > $endDate) {
    echo json_encode([
        "success" => false,
        "message" => "End date must be later than start date."
    ]);
    exit;
}

if ($startTime >= $endTime) {
    echo json_encode([
        "success" => false,
        "message" => "End time must be later than start time."
    ]);
    exit;
}

$today = date("Y-m-d");

if ($startDate < $today) {
    echo json_encode([
        "success" => false,
        "message" => "Recurring booking start date cannot be earlier than today."
    ]);
    exit;
}

$resourceSql = "SELECT * FROM resources WHERE resourceID = ?";
$resourceStmt = $conn->prepare($resourceSql);
$resourceStmt->bind_param("i", $resourceID);
$resourceStmt->execute();
$resourceResult = $resourceStmt->get_result();

if ($resourceResult->num_rows === 0) {
    echo json_encode([
        "success" => false,
        "message" => "Resource not found."
    ]);
    exit;
}

$resource = $resourceResult->fetch_assoc();

if ($resource["status"] === "Unavailable") {
    echo json_encode([
        "success" => false,
        "message" => "This resource is currently unavailable."
    ]);
    exit;
}

$status = "Pending Approval";

$sql = "INSERT INTO recurring_bookings 
        (userID, resourceID, repeatType, repeatDay, startDate, endDate, startTime, endTime, purpose, requirements, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

$stmt = $conn->prepare($sql);
$stmt->bind_param(
    "iisssssssss",
    $userID,
    $resourceID,
    $repeatType,
    $repeatDay,
    $startDate,
    $endDate,
    $startTime,
    $endTime,
    $purpose,
    $requirements,
    $status
);

if ($stmt->execute()) {
    $recurringID = $stmt->insert_id;

    $message = "Your recurring booking request for " . $resource["name"] . " is Pending Approval.";

    $notificationSql = "INSERT INTO notifications (userID, bookingID, message, type, status)
                        VALUES (?, NULL, ?, 'warning', 'Unread')";

    $notificationStmt = $conn->prepare($notificationSql);
    $notificationStmt->bind_param("is", $userID, $message);
    $notificationStmt->execute();

    echo json_encode([
        "success" => true,
        "message" => "Recurring booking request submitted successfully.",
        "recurringID" => $recurringID,
        "resourceName" => $resource["name"],
        "status" => $status
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Failed to create recurring booking."
    ]);
}

$conn->close();
?>