<?php
require_once "db_connect.php";

$method = $_SERVER["REQUEST_METHOD"];

if ($method === "OPTIONS") {
    exit;
}

$allowedStatuses = ["Online", "Warning", "Offline"];
$allowedSeverities = ["Low", "Medium", "High", "Critical"];

function sendResponse($success, $message, $extra = []) {
    echo json_encode(array_merge([
        "success" => $success,
        "message" => $message
    ], $extra));
    exit;
}

function normalizeDateTime($value) {
    $value = trim($value);
    $value = str_replace("T", " ", $value);

    if (preg_match("/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/", $value)) {
        $value .= ":00";
    }

    return $value;
}

function validateMonitoring($data) {
    global $allowedStatuses, $allowedSeverities;

    $moduleName = trim($data["moduleName"] ?? "");
    $status = trim($data["status"] ?? "");
    $severity = trim($data["severity"] ?? "");
    $responseTimeRaw = strval($data["responseTime"] ?? "");
    $uptimeRaw = strval($data["uptime"] ?? "");
    $lastChecked = normalizeDateTime($data["lastChecked"] ?? "");
    $note = trim($data["note"] ?? "");

    if ($moduleName === "") {
        sendResponse(false, "Module or resource name is required.");
    }

    if (strlen($moduleName) < 3) {
        sendResponse(false, "Module name must be at least 3 characters.");
    }

    if (strlen($moduleName) > 100) {
        sendResponse(false, "Module name cannot be more than 100 characters.");
    }

    if (!preg_match("/^[A-Za-z0-9 &()._-]+$/", $moduleName)) {
        sendResponse(false, "Module name contains invalid characters.");
    }

    if ($status === "" || !in_array($status, $allowedStatuses)) {
        sendResponse(false, "Invalid status selected.");
    }

    if ($severity === "" || !in_array($severity, $allowedSeverities)) {
        sendResponse(false, "Invalid severity selected.");
    }

    if ($responseTimeRaw === "" || !preg_match("/^\d+$/", $responseTimeRaw)) {
        sendResponse(false, "Response time must be a whole number.");
    }

    $responseTime = intval($responseTimeRaw);

    if ($responseTime < 0) {
        sendResponse(false, "Response time cannot be negative.");
    }

    if ($responseTime > 10000) {
        sendResponse(false, "Response time cannot be more than 10000 ms.");
    }

    if ($uptimeRaw === "" || !is_numeric($uptimeRaw)) {
        sendResponse(false, "Uptime must be a number.");
    }

    $uptime = floatval($uptimeRaw);

    if ($uptime < 0 || $uptime > 100) {
        sendResponse(false, "Uptime must be between 0 and 100.");
    }

    if ($lastChecked === "") {
        sendResponse(false, "Last checked date and time is required.");
    }

    $selectedTime = strtotime($lastChecked);
    $currentTime = time();

    if ($selectedTime === false) {
        sendResponse(false, "Invalid last checked date and time.");
    }

    if ($selectedTime > $currentTime) {
        sendResponse(false, "Future date and time is not allowed.");
    }

    if ($note === "") {
        sendResponse(false, "Monitoring note is required.");
    }

    if (strlen($note) < 10) {
        sendResponse(false, "Monitoring note must be at least 10 characters.");
    }

    if (strlen($note) > 250) {
        sendResponse(false, "Monitoring note cannot be more than 250 characters.");
    }

    return [
        "moduleName" => $moduleName,
        "status" => $status,
        "severity" => $severity,
        "responseTime" => $responseTime,
        "uptime" => $uptime,
        "lastChecked" => $lastChecked,
        "note" => $note
    ];
}

/* GET ALL MONITORING RECORDS */
if ($method === "GET") {
    $sql = "SELECT * FROM system_monitoring ORDER BY monitoringID DESC";
    $result = $conn->query($sql);

    $records = [];

    while ($row = $result->fetch_assoc()) {
        $records[] = $row;
    }

    sendResponse(true, "Monitoring records loaded successfully.", [
        "records" => $records
    ]);
}

/* CREATE MONITORING RECORD */
if ($method === "POST") {
    $data = json_decode(file_get_contents("php://input"), true);

    $record = validateMonitoring($data);

    $stmt = $conn->prepare(
        "INSERT INTO system_monitoring 
        (moduleName, status, severity, responseTime, uptime, lastChecked, note)
        VALUES (?, ?, ?, ?, ?, ?, ?)"
    );

    $stmt->bind_param(
        "sssidss",
        $record["moduleName"],
        $record["status"],
        $record["severity"],
        $record["responseTime"],
        $record["uptime"],
        $record["lastChecked"],
        $record["note"]
    );

    if ($stmt->execute()) {
        sendResponse(true, "Monitoring record added successfully.");
    } else {
        sendResponse(false, "Failed to add monitoring record.");
    }
}

/* UPDATE MONITORING RECORD */
if ($method === "PUT") {
    $data = json_decode(file_get_contents("php://input"), true);

    $monitoringID = intval($data["monitoringID"] ?? 0);

    if ($monitoringID <= 0) {
        sendResponse(false, "Invalid monitoring ID.");
    }

    $record = validateMonitoring($data);

    $stmt = $conn->prepare(
        "UPDATE system_monitoring
        SET moduleName = ?, status = ?, severity = ?, responseTime = ?, uptime = ?, lastChecked = ?, note = ?
        WHERE monitoringID = ?"
    );

    $stmt->bind_param(
        "sssidssi",
        $record["moduleName"],
        $record["status"],
        $record["severity"],
        $record["responseTime"],
        $record["uptime"],
        $record["lastChecked"],
        $record["note"],
        $monitoringID
    );

    if ($stmt->execute()) {
        sendResponse(true, "Monitoring record updated successfully.");
    } else {
        sendResponse(false, "Failed to update monitoring record.");
    }
}

/* DELETE MONITORING RECORD */
if ($method === "DELETE") {
    $monitoringID = intval($_GET["id"] ?? 0);

    if ($monitoringID <= 0) {
        sendResponse(false, "Invalid monitoring ID.");
    }

    $stmt = $conn->prepare("DELETE FROM system_monitoring WHERE monitoringID = ?");
    $stmt->bind_param("i", $monitoringID);

    if ($stmt->execute()) {
        sendResponse(true, "Monitoring record deleted successfully.");
    } else {
        sendResponse(false, "Failed to delete monitoring record.");
    }
}

sendResponse(false, "Invalid request method.");
?>