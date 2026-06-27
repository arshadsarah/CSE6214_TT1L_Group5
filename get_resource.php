<?php
header("Content-Type: application/json");

include "db_connect.php";

$sql = "SELECT * FROM resources";
$result = $conn->query($sql);

$resources = [];

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $resources[] = $row;
    }

    echo json_encode([
        "success" => true,
        "resources" => $resources
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Failed to load resources."
    ]);
}

$conn->close();
?>