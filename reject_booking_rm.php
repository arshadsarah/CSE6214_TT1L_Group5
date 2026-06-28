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
$sql = "UPDATE bookings SET status = 'Rejected' WHERE bookingID = $bookingID";

if ($conn->query($sql)) {

    // optional notification
    $conn->query("
        INSERT INTO notifications (userID, message, dateCreated, isRead)
        VALUES (1, 'Your booking has been REJECTED', NOW(), 0)
    ");

    echo json_encode([
        "success" => true,
        "message" => "Booking rejected"
    ]);

} else {
    echo json_encode([
        "success" => false,
        "message" => "Failed to reject booking"
    ]);
}
?>