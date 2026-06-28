<?php
require_once "db_connect.php";

$method = $_SERVER["REQUEST_METHOD"];

if ($method === "OPTIONS") {
    exit;
}

$allowedTypes = [
    "Booking Update",
    "Booking Reminder",
    "Maintenance Notice",
    "General Announcement"
];

$allowedTargets = [
    "All Users",
    "Students",
    "Staff / Faculty",
    "Faculty & Staff",
    "Resource Managers",
    "Administrators"
];

$allowedPriorities = [
    "High",
    "Medium",
    "Low"
];

$allowedStatuses = [
    "Draft",
    "Scheduled",
    "Sent"
];

function sendResponse($success, $message, $extra = []) {
    echo json_encode(array_merge([
        "success" => $success,
        "message" => $message
    ], $extra));
    exit;
}

function validateNotification($data) {
    global $allowedTypes, $allowedTargets, $allowedPriorities, $allowedStatuses;

    $title = trim($data["title"] ?? "");
    $type = trim($data["type"] ?? "");
    $targetUser = trim($data["targetUser"] ?? "");
    $priority = trim($data["priority"] ?? "");
    $status = trim($data["status"] ?? "");
    $scheduleDate = trim($data["scheduleDate"] ?? "");
    $message = trim($data["message"] ?? "");

    if ($title === "") {
        sendResponse(false, "Notification title is required.");
    }

    if (strlen($title) < 3) {
        sendResponse(false, "Notification title must be at least 3 characters.");
    }

    if (strlen($title) > 100) {
        sendResponse(false, "Notification title cannot be more than 100 characters.");
    }

    if (!preg_match("/^[A-Za-z0-9 .,&()_'-]+$/", $title)) {
        sendResponse(false, "Notification title contains invalid characters.");
    }

    if ($type === "" || !in_array($type, $allowedTypes)) {
        sendResponse(false, "Invalid notification type.");
    }

    if ($targetUser === "" || !in_array($targetUser, $allowedTargets)) {
        sendResponse(false, "Invalid target user.");
    }

    if ($priority === "" || !in_array($priority, $allowedPriorities)) {
        sendResponse(false, "Invalid priority.");
    }

    if ($status === "" || !in_array($status, $allowedStatuses)) {
        sendResponse(false, "Invalid notification status.");
    }

    if ($status === "Scheduled" && $scheduleDate === "") {
        sendResponse(false, "Schedule date and time is required for scheduled notification.");
    }

    if ($scheduleDate !== "") {
        $selectedTime = strtotime($scheduleDate);
        $currentTime = time();

        if ($selectedTime === false) {
            sendResponse(false, "Invalid schedule date and time.");
        }

        if ($status === "Scheduled" && $selectedTime <= $currentTime) {
            sendResponse(false, "Scheduled notification must use a future date and time.");
        }
    }

    if ($message === "") {
        sendResponse(false, "Notification message is required.");
    }

    if (strlen($message) < 10) {
        sendResponse(false, "Notification message must be at least 10 characters.");
    }

    if (strlen($message) > 500) {
        sendResponse(false, "Notification message cannot be more than 500 characters.");
    }

    return [
        "title" => $title,
        "type" => $type,
        "targetUser" => $targetUser,
        "priority" => $priority,
        "status" => $status,
        "scheduleDate" => $scheduleDate === "" ? null : $scheduleDate,
        "message" => $message
    ];
}

/* GET ALL NOTIFICATIONS */
if ($method === "GET") {
    $sql = "SELECT * FROM admin_notifications ORDER BY notificationID DESC";
    $result = $conn->query($sql);

    $notifications = [];

    while ($row = $result->fetch_assoc()) {
        $notifications[] = $row;
    }

    sendResponse(true, "Notifications loaded successfully.", [
        "notifications" => $notifications
    ]);
}

/* CREATE NOTIFICATION */
if ($method === "POST") {
    $data = json_decode(file_get_contents("php://input"), true);

    $notification = validateNotification($data);

    $stmt = $conn->prepare(
        "INSERT INTO admin_notifications 
        (title, type, targetUser, priority, status, scheduleDate, message) 
        VALUES (?, ?, ?, ?, ?, ?, ?)"
    );

    $stmt->bind_param(
        "sssssss",
        $notification["title"],
        $notification["type"],
        $notification["targetUser"],
        $notification["priority"],
        $notification["status"],
        $notification["scheduleDate"],
        $notification["message"]
    );

    if ($stmt->execute()) {
        sendResponse(true, "Notification created successfully.");
    } else {
        sendResponse(false, "Failed to create notification.");
    }
}

/* UPDATE NOTIFICATION */
if ($method === "PUT") {
    $data = json_decode(file_get_contents("php://input"), true);

    $notificationID = intval($data["notificationID"] ?? 0);

    if ($notificationID <= 0) {
        sendResponse(false, "Invalid notification ID.");
    }

    $notification = validateNotification($data);

    $stmt = $conn->prepare(
        "UPDATE admin_notifications 
        SET title = ?, type = ?, targetUser = ?, priority = ?, status = ?, scheduleDate = ?, message = ?
        WHERE notificationID = ?"
    );

    $stmt->bind_param(
        "sssssssi",
        $notification["title"],
        $notification["type"],
        $notification["targetUser"],
        $notification["priority"],
        $notification["status"],
        $notification["scheduleDate"],
        $notification["message"],
        $notificationID
    );

    if ($stmt->execute()) {
        sendResponse(true, "Notification updated successfully.");
    } else {
        sendResponse(false, "Failed to update notification.");
    }
}

/* DELETE NOTIFICATION */
if ($method === "DELETE") {
    $notificationID = intval($_GET["id"] ?? 0);

    if ($notificationID <= 0) {
        sendResponse(false, "Invalid notification ID.");
    }

    $stmt = $conn->prepare("DELETE FROM admin_notifications WHERE notificationID = ?");
    $stmt->bind_param("i", $notificationID);

    if ($stmt->execute()) {
        sendResponse(true, "Notification deleted successfully.");
    } else {
        sendResponse(false, "Failed to delete notification.");
    }
}

sendResponse(false, "Invalid request method.");
?>