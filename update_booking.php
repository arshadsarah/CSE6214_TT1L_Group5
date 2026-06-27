<?php
header("Content-Type: application/json");

include "db_connect.php";

$bookingID = $_POST["bookingID"] ?? "";
$resourceID = $_POST["resourceID"] ?? "";
$bookingDate = $_POST["bookingDate"] ?? "";
$startTime = $_POST["startTime"] ?? "";
$endTime = $_POST["endTime"] ?? "";
$purpose = $_POST["purpose"] ?? "";
$attendees = $_POST["attendees"] ?? "";

if (
    $bookingID == "" ||
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
        "message" => "Updated booking date cannot be earlier than today."
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

$bookingSql = "SELECT * FROM bookings WHERE bookingID = ?";
$bookingStmt = $conn->prepare($bookingSql);
$bookingStmt->bind_param("i", $bookingID);
$bookingStmt->execute();
$bookingResult = $bookingStmt->get_result();

if ($bookingResult->num_rows === 0) {
    echo json_encode([
        "success" => false,
        "message" => "Booking not found."
    ]);
    exit;
}

$booking = $bookingResult->fetch_assoc();

if ($booking["status"] === "Cancelled") {
    echo json_encode([
        "success" => false,
        "message" => "Cancelled bookings cannot be modified."
    ]);
    exit;
}

$bookingDateTime = strtotime($booking["bookingDate"] . " " . $booking["startTime"]);
$now = time();
$hoursDifference = ($bookingDateTime - $now) / 3600;

if ($hoursDifference < 24) {
    echo json_encode([
        "success" => false,
        "message" => "This booking cannot be modified because it is less than 24 hours before the booking start time."
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

$status = $resource["approvalRequired"] === "Yes" ? "Pending Approval" : "Confirmed";

$conflictSql = "
    SELECT * FROM bookings
    WHERE resourceID = ?
    AND bookingDate = ?
    AND bookingID != ?
    AND status != 'Cancelled'
    AND (? < endTime AND ? > startTime)
";

$conflictStmt = $conn->prepare($conflictSql);
$conflictStmt->bind_param("isiss", $resourceID, $bookingDate, $bookingID, $startTime, $endTime);
$conflictStmt->execute();
$conflictResult = $conflictStmt->get_result();

if ($conflictResult->num_rows > 0) {
    echo json_encode([
        "success" => false,
        "message" => "This time slot is already booked. Please choose another time."
    ]);
    exit;
}

$updateSql = "
    UPDATE bookings
    SET resourceID = ?, bookingDate = ?, startTime = ?, endTime = ?, purpose = ?, attendees = ?, status = ?
    WHERE bookingID = ?
";

$updateStmt = $conn->prepare($updateSql);
$updateStmt->bind_param(
    "issssisi",
    $resourceID,
    $bookingDate,
    $startTime,
    $endTime,
    $purpose,
    $attendees,
    $status,
    $bookingID
);

if ($updateStmt->execute()) {
    $message = "Your booking has been updated successfully.";

    $notificationSql = "INSERT INTO notifications (userID, bookingID, message, type, status)
                        VALUES (?, ?, ?, 'info', 'Unread')";

    $notificationStmt = $conn->prepare($notificationSql);
    $notificationStmt->bind_param("iis", $booking["userID"], $bookingID, $message);
    $notificationStmt->execute();

    echo json_encode([
        "success" => true,
        "message" => "Booking updated successfully.",
        "status" => $status
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Failed to update booking."
    ]);
}

$conn->close();
?>