<?php
header("Content-Type: application/json");

include "db_connect.php";

$userID = $_POST["userID"] ?? 1;
$resourceID = $_POST["resourceID"] ?? "";
$bookingDate = $_POST["bookingDate"] ?? "";
$startTime = $_POST["startTime"] ?? "";
$endTime = $_POST["endTime"] ?? "";
$purpose = $_POST["purpose"] ?? "";
$attendees = $_POST["attendees"] ?? "";
$requirements = $_POST["requirements"] ?? "";

if (
    $resourceID == "" ||
    $bookingDate == "" ||
    $startTime == "" ||
    $endTime == "" ||
    $purpose == "" ||
    $attendees == ""
) {
    echo json_encode([
        "success" => false,
        "message" => "Please fill in all required fields."
    ]);
    exit;
}

$today = date("Y-m-d");

if ($bookingDate < $today) {
    echo json_encode([
        "success" => false,
        "message" => "Booking date cannot be earlier than today."
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

$conflictSql = "
    SELECT * FROM bookings
    WHERE resourceID = ?
    AND bookingDate = ?
    AND status != 'Cancelled'
    AND (? < endTime AND ? > startTime)
";

$conflictStmt = $conn->prepare($conflictSql);
$conflictStmt->bind_param("isss", $resourceID, $bookingDate, $startTime, $endTime);
$conflictStmt->execute();
$conflictResult = $conflictStmt->get_result();

if ($conflictResult->num_rows > 0) {
    echo json_encode([
        "success" => false,
        "message" => "This time slot is already booked. Please choose another time."
    ]);
    exit;
}

$status = $resource["approvalRequired"] === "Yes" ? "Pending Approval" : "Confirmed";
$qrCode = $status === "Confirmed" ? "FS-VALID-" . uniqid() : null;

$sql = "INSERT INTO bookings 
        (userID, resourceID, bookingDate, startTime, endTime, purpose, attendees, requirements, status, qrCode)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

$stmt = $conn->prepare($sql);
$stmt->bind_param(
    "iissssisss",
    $userID,
    $resourceID,
    $bookingDate,
    $startTime,
    $endTime,
    $purpose,
    $attendees,
    $requirements,
    $status,
    $qrCode
);

if ($stmt->execute()) {
    $bookingID = $stmt->insert_id;

    $message = "Your booking for " . $resource["name"] . " is " . $status . ".";
    $type = $status === "Confirmed" ? "success" : "warning";

    $notificationSql = "INSERT INTO notifications (userID, bookingID, message, type, status)
                        VALUES (?, ?, ?, ?, 'Unread')";
    $notificationStmt = $conn->prepare($notificationSql);
    $notificationStmt->bind_param("iiss", $userID, $bookingID, $message, $type);
    $notificationStmt->execute();

    echo json_encode([
        "success" => true,
        "message" => "Booking created successfully.",
        "bookingID" => $bookingID,
        "resourceName" => $resource["name"],
        "status" => $status,
        "qrCode" => $qrCode
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Failed to create booking."
    ]);
}

$conn->close();
?>