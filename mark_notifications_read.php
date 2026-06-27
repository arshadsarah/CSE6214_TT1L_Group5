<?php
header("Content-Type: application/json");

include "db_connect.php";

$userID = $_POST["userID"] ?? 1;

$sql = "
    UPDATE notifications
    SET status = 'Read'
    WHERE userID = ?
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $userID);

if ($stmt->execute()) {
    echo json_encode([
        "success" => true,
        "message" => "All notifications marked as read."
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Failed to mark notifications as read."
    ]);
}

$conn->close();
?>