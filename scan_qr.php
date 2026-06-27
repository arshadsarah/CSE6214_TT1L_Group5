<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
include "db_connect.php";

$qrCode = $_GET["code"] ?? "";

$resultTitle = "QR Verification";
$resultMessage = "";
$resultClass = "";

if ($qrCode == "") {
    $resultTitle = "Invalid QR Code";
    $resultMessage = "No QR code was provided.";
    $resultClass = "error";
} else {
    $sql = "
        SELECT 
            bookings.bookingID,
            bookings.userID,
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
        $resultTitle = "Invalid QR Code";
        $resultMessage = "No matching booking was found.";
        $resultClass = "error";
    } else {
        $booking = $result->fetch_assoc();

        if ($booking["status"] !== "Confirmed") {
            $resultTitle = "Booking Not Confirmed";
            $resultMessage = "This booking is not confirmed yet.";
            $resultClass = "warning";
        } else if ($booking["checkInStatus"] === "Checked-in") {
            $resultTitle = "Already Checked In";
            $resultMessage = "This booking has already been checked in.";
            $resultClass = "warning";
        } else {
            $updateSql = "
                UPDATE bookings
                SET checkInStatus = 'Checked-in'
                WHERE bookingID = ?
            ";

            $updateStmt = $conn->prepare($updateSql);
            $updateStmt->bind_param("i", $booking["bookingID"]);
            $updateStmt->execute();

            $message = "QR check-in successful for " . $booking["resourceName"] . ".";

            $notificationSql = "INSERT INTO notifications (userID, bookingID, message, type, status)
                                VALUES (?, ?, ?, 'success', 'Unread')";

            $notificationStmt = $conn->prepare($notificationSql);
            $notificationStmt->bind_param("iis", $booking["userID"], $booking["bookingID"], $message);
            $notificationStmt->execute();

            $resultTitle = "Checked In Successfully";
            $resultMessage = "
                Booking ID: BK-FS-" . $booking["bookingID"] . "<br>
                Resource: " . $booking["resourceName"] . "<br>
                Date: " . $booking["bookingDate"] . "<br>
                Time: " . substr($booking["startTime"], 0, 5) . " - " . substr($booking["endTime"], 0, 5) . "
            ";
            $resultClass = "success";
        }
    }
}

$conn->close();
?>

<!DOCTYPE html>
<html>
<head>
    <title>QR Verification Result</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <style>
        body {
            font-family: Arial, sans-serif;
            background: #f4f4f4;
            padding: 30px;
        }

        .result-card {
            max-width: 420px;
            margin: 60px auto;
            background: white;
            padding: 30px;
            border-radius: 18px;
            text-align: center;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        }

        .success {
            border-top: 8px solid #2e7d32;
        }

        .warning {
            border-top: 8px solid #f9a825;
        }

        .error {
            border-top: 8px solid #c62828;
        }

        h1 {
            color: #5a0b0b;
            font-size: 26px;
        }

        p {
            font-size: 17px;
            line-height: 1.7;
            color: #333;
        }
    </style>
</head>
<body>
    <div class="result-card <?php echo $resultClass; ?>">
        <h1><?php echo $resultTitle; ?></h1>
        <p><?php echo $resultMessage; ?></p>
    </div>
</body>
</html>