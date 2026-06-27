<?php
error_reporting(E_ALL);
ini_set("display_errors", 1);

header("Content-Type: application/json");

include "db_connect.php";

$recurringID = $_POST["recurringID"] ?? "";
$reason = $_POST["reason"] ?? "";

if ($recurringID == "" || $reason == "") {
    echo json_encode([
        "success" => false,
        "message" => "Recurring booking ID and cancellation reason are required."
    ]);
    exit;
}

$sql = "
    SELECT 
        rb.recurringID,
        rb.userID,
        rb.resourceID,
        rb.startDate,
        rb.startTime,
        rb.status,
        r.name AS resourceName
    FROM recurring_bookings rb
    INNER JOIN resources r ON rb.resourceID = r.resourceID
    WHERE rb.recurringID = ?
";

$stmt = $conn->prepare($sql);

if (!$stmt) {
    echo json_encode([
        "success" => false,
        "message" => "SQL prepare failed: " . $conn->error
    ]);
    exit;
}

$stmt->bind_param("i", $recurringID);
$stmt->execute();

$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode([
        "success" => false,
        "message" => "Recurring booking request not found."
    ]);
    exit;
}

$recurring = $result->fetch_assoc();

if ($recurring["status"] === "Cancelled") {
    echo json_encode([
        "success" => false,
        "message" => "This recurring booking request is already cancelled."
    ]);
    exit;
}

$bookingDateTime = strtotime($recurring["startDate"] . " " . $recurring["startTime"]);
$now = time();
$hoursDifference = ($bookingDateTime - $now) / 3600;

if ($hoursDifference < 24) {
    echo json_encode([
        "success" => false,
        "message" => "This recurring booking request cannot be cancelled because it is less than 24 hours before the first booking start time."
    ]);
    exit;
}

$updateSql = "
    UPDATE recurring_bookings
    SET status = 'Cancelled'
    WHERE recurringID = ?
";

$updateStmt = $conn->prepare($updateSql);

if (!$updateStmt) {
    echo json_encode([
        "success" => false,
        "message" => "Update prepare failed: " . $conn->error
    ]);
    exit;
}

$updateStmt->bind_param("i", $recurringID);

if (!$updateStmt->execute()) {
    echo json_encode([
        "success" => false,
        "message" => "Failed to cancel recurring booking request: " . $updateStmt->error
    ]);
    exit;
}

$message = "Your recurring booking request for " . $recurring["resourceName"] . " has been cancelled. Reason: " . $reason;

$notificationSql = "
    INSERT INTO notifications (userID, bookingID, message, type, status)
    VALUES (?, NULL, ?, 'danger', 'Unread')
";

$notificationStmt = $conn->prepare($notificationSql);

if (!$notificationStmt) {
    echo json_encode([
        "success" => false,
        "message" => "Notification prepare failed: " . $conn->error
    ]);
    exit;
}

$notificationStmt->bind_param("is", $recurring["userID"], $message);
$notificationStmt->execute();

echo json_encode([
    "success" => true,
    "message" => "Recurring booking request cancelled successfully."
]);

$conn->close();
?>