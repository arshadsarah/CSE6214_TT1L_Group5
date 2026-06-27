<?php
header("Content-Type: application/json");

include "db_connect.php";

$userID = $_GET["userID"] ?? 1;

$sql = "
    SELECT 
        notificationID,
        userID,
        bookingID,
        message,
        type,
        dateCreated,
        status
    FROM notifications
    WHERE userID = ?
    ORDER BY dateCreated DESC
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $userID);
$stmt->execute();

$result = $stmt->get_result();

$notifications = [];

while ($row = $result->fetch_assoc()) {
    $notifications[] = $row;
}

echo json_encode([
    "success" => true,
    "notifications" => $notifications
]);

$conn->close();
?>