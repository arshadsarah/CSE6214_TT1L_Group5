<?php
header("Content-Type: application/json");

include "db_connect.php";

$qrCode = $_POST["qrCode"] ?? "";

if ($qrCode == "") {
    echo json_encode([
        "success" => false,
        "message" => "QR code is required."
    ]);
    exit;
}

$sql = "
    SELECT 
        bookings.bookingID,
        bookings.userID,
        bookings.resourceID,
        bookings.bookingDate,
        bookings.startTime,
        bookings.endTime,
        bookings.status,
        bookings.qrCode,
        bookings.checkInStatus,
        resources.name AS resourceName
    FROM bookings
    INNER JOIN resources ON bookings.resourceID = resources.resourceID
    WHERE bookings.qrCode = ?
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $qrCode);
$stmt->execute();

$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode([
        "success" => false,
        "type" => "invalid",
        "message" => "Invalid QR code. No matching booking found."
    ]);
    exit;
}

$booking = $result->fetch_assoc();

if ($booking["status"] !== "Confirmed") {
    echo json_encode([
        "success" => false,
        "type" => "not_confirmed",
        "message" => "This booking is not confirmed. QR verification is not allowed."
    ]);
    exit;
}

if ($booking["checkInStatus"] === "Checked-in") {
    echo json_encode([
        "success" => false,
        "type" => "already_checked_in",
        "message" => "This booking has already been checked in."
    ]);
    exit;
}

$today = date("Y-m-d");
$currentTime = date("H:i:s");

if ($booking["bookingDate"] !== $today) {
    echo json_encode([
        "success" => false,
        "type" => "wrong_date",
        "message" => "This QR code is valid, but today is not the booking date."
    ]);
    exit;
}

if ($currentTime < $booking["startTime"] || $currentTime > $booking["endTime"]) {
    echo json_encode([
        "success" => false,
        "type" => "wrong_time",
        "message" => "This QR code is valid, but check-in is only allowed during the booking time."
    ]);
    exit;
}

$updateSql = "
    UPDATE bookings
    SET checkInStatus = 'Checked-in'
    WHERE bookingID = ?
";

$updateStmt = $conn->prepare($updateSql);
$updateStmt->bind_param("i", $booking["bookingID"]);

if ($updateStmt->execute()) {
    $message = "QR check-in successful for " . $booking["resourceName"] . ".";

    $notificationSql = "INSERT INTO notifications (userID, bookingID, message, type, status)
                        VALUES (?, ?, ?, 'success', 'Unread')";

    $notificationStmt = $conn->prepare($notificationSql);
    $notificationStmt->bind_param("iis", $booking["userID"], $booking["bookingID"], $message);
    $notificationStmt->execute();

    echo json_encode([
        "success" => true,
        "type" => "success",
        "message" => "Checked in successfully.",
        "bookingID" => $booking["bookingID"],
        "resourceName" => $booking["resourceName"],
        "date" => $booking["bookingDate"],
        "startTime" => $booking["startTime"],
        "endTime" => $booking["endTime"]
    ]);
} else {
    echo json_encode([
        "success" => false,
        "type" => "error",
        "message" => "Failed to update check-in status."
    ]);
}

$conn->close();
?>