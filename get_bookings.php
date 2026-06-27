<?php
header("Content-Type: application/json");

include "db_connect.php";

$userID = $_GET["userID"] ?? 1;

$sql = "
    SELECT 
        bookings.bookingID,
        bookings.userID,
        bookings.resourceID,
        bookings.bookingDate,
        bookings.startTime,
        bookings.endTime,
        bookings.purpose,
        bookings.attendees,
        bookings.requirements,
        bookings.status,
        bookings.qrCode,
        bookings.checkInStatus,
        bookings.cancellationReason,
        resources.name AS resourceName,
        resources.type AS resourceType,
        resources.location AS resourceLocation
    FROM bookings
    INNER JOIN resources ON bookings.resourceID = resources.resourceID
    WHERE bookings.userID = ?
    ORDER BY bookings.bookingDate ASC, bookings.startTime ASC
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $userID);
$stmt->execute();

$result = $stmt->get_result();

$bookings = [];

while ($row = $result->fetch_assoc()) {
    $bookings[] = $row;
}

echo json_encode([
    "success" => true,
    "bookings" => $bookings
]);

$conn->close();
?>