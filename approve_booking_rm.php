<?php
header("Content-Type: application/json");

include "db_connect.php";

$bookingID = intval($_POST["bookingID"] ?? 0);

if ($bookingID <= 0) {
    echo json_encode([
        "success" => false,
        "message" => "Missing booking ID."
    ]);
    exit;
}

/* Get booking owner */
$getBooking = $conn->prepare("SELECT userID FROM bookings WHERE bookingID = ?");
$getBooking->bind_param("i", $bookingID);
$getBooking->execute();
$result = $getBooking->get_result();

if ($result->num_rows === 0) {
    echo json_encode([
        "success" => false,
        "message" => "Booking not found."
    ]);
    exit;
}

$booking = $result->fetch_assoc();
$userID = $booking["userID"];

/* Update booking status */
$update = $conn->prepare("UPDATE bookings SET status = 'Approved' WHERE bookingID = ?");
$update->bind_param("i", $bookingID);

if ($update->execute()) {

    /* Add notification */
    $message = "Your booking has been approved.";
    $type = "Approval";
    $status = "Unread";

    $notify = $conn->prepare("
        INSERT INTO notifications (userID, bookingID, message, type, dateCreated, status)
        VALUES (?, ?, ?, ?, NOW(), ?)
    ");

    $notify->bind_param("iisss", $userID, $bookingID, $message, $type, $status);
    $notify->execute();

    echo json_encode([
        "success" => true,
        "message" => "Booking approved successfully."
    ]);

} else {
    echo json_encode([
        "success" => false,
        "message" => "Failed to approve booking."
    ]);
}

$conn->close();
?>