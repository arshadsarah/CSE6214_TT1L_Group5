<?php
header("Content-Type: application/json");

include "db_connect.php";

$bookingID = $_POST["bookingID"] ?? "";
$reason = $_POST["reason"] ?? "";

if ($bookingID == "" || $reason == "") {
    echo json_encode([
        "success" => false,
        "message" => "Booking ID and cancellation reason are required."
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
        "message" => "This booking is already cancelled."
    ]);
    exit;
}

$bookingDateTime = strtotime($booking["bookingDate"] . " " . $booking["startTime"]);
$now = time();
$hoursDifference = ($bookingDateTime - $now) / 3600;

if ($hoursDifference < 24) {
    echo json_encode([
        "success" => false,
        "message" => "This booking cannot be cancelled because it is less than 24 hours before the booking start time."
    ]);
    exit;
}

$cancelSql = "
    UPDATE bookings
    SET status = 'Cancelled', cancellationReason = ?
    WHERE bookingID = ?
";

$cancelStmt = $conn->prepare($cancelSql);
$cancelStmt->bind_param("si", $reason, $bookingID);

if ($cancelStmt->execute()) {
    $message = "Your booking has been cancelled. Reason: " . $reason;

    $notificationSql = "INSERT INTO notifications (userID, bookingID, message, type, status)
                        VALUES (?, ?, ?, 'danger', 'Unread')";

    $notificationStmt = $conn->prepare($notificationSql);
    $notificationStmt->bind_param("iis", $booking["userID"], $bookingID, $message);
    $notificationStmt->execute();

    echo json_encode([
        "success" => true,
        "message" => "Booking cancelled successfully."
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Failed to cancel booking."
    ]);
}

$conn->close();
?>