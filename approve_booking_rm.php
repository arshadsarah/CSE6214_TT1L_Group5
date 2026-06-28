<?php
header("Content-Type: application/json");
require "config/db.php";

$bookingID = $_POST['bookingID'] ?? null;

if (!$bookingID) {
    echo json_encode([
        "success" => false,
        "message" => "Missing bookingID"
    ]);
    exit;
}

// update booking status
$sql = "UPDATE bookings SET status = 'Approved' WHERE bookingID = $bookingID";

if ($conn->query($sql)) {

    // optional notification
    $conn->query("
        INSERT INTO notifications (userID, message, dateCreated, isRead)
        VALUES (1, 'Your booking has been APPROVED', NOW(), 0)
    ");

    echo json_encode([
        "success" => true,
        "message" => "Booking approved"
    ]);

} else {
    echo json_encode([
        "success" => false,
        "message" => "Failed to approve booking"
    ]);
}
?>