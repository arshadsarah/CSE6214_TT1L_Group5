<?php
header("Content-Type: application/json");
require "config/db.php";

$sql = "SELECT * FROM bookings WHERE status = 'Pending'";
$result = $conn->query($sql);

$bookings = [];

while ($row = $result->fetch_assoc()) {
    $bookings[] = $row;
}

echo json_encode([
    "success" => true,
    "bookings" => $bookings
]);
?>