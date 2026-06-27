-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:8889
-- Generation Time: Jun 27, 2026 at 11:13 AM
-- Server version: 8.0.44
-- PHP Version: 8.3.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `campus_resource_booking`
--

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `bookingID` int NOT NULL,
  `userID` int NOT NULL,
  `resourceID` int NOT NULL,
  `bookingDate` date NOT NULL,
  `startTime` time NOT NULL,
  `endTime` time NOT NULL,
  `purpose` varchar(100) NOT NULL,
  `attendees` int NOT NULL,
  `requirements` text,
  `status` varchar(30) NOT NULL,
  `qrCode` varchar(255) DEFAULT NULL,
  `checkInStatus` varchar(30) DEFAULT 'Not checked-in',
  `cancellationReason` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`bookingID`, `userID`, `resourceID`, `bookingDate`, `startTime`, `endTime`, `purpose`, `attendees`, `requirements`, `status`, `qrCode`, `checkInStatus`, `cancellationReason`) VALUES
(1, 1, 1, '2026-06-07', '12:00:00', '13:00:00', 'Meeting', 20, '', 'Confirmed', 'FS-VALID-6a3f8fffa6e40', 'Checked-in', NULL),
(2, 1, 2, '2026-06-07', '12:00:00', '13:00:00', 'Meeting', 20, '', 'Pending Approval', NULL, 'Not checked-in', NULL),
(3, 1, 3, '2026-07-01', '02:30:00', '04:30:00', 'Meeting', 10, '', 'Cancelled', 'FS-VALID-6a3f92ace2b32', 'Not checked-in', 'test101');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `notificationID` int NOT NULL,
  `userID` int NOT NULL,
  `bookingID` int DEFAULT NULL,
  `message` varchar(255) NOT NULL,
  `type` varchar(30) NOT NULL,
  `dateCreated` datetime DEFAULT CURRENT_TIMESTAMP,
  `status` varchar(30) DEFAULT 'Unread'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`notificationID`, `userID`, `bookingID`, `message`, `type`, `dateCreated`, `status`) VALUES
(1, 1, 1, 'Your booking for Lecture Hall A is Confirmed.', 'success', '2026-06-27 16:55:27', 'Read'),
(2, 1, 2, 'Your booking for Computer Lab 2 is Pending Approval.', 'warning', '2026-06-27 16:56:50', 'Read'),
(3, 1, 3, 'Your booking for Meeting Room C is Confirmed.', 'success', '2026-06-27 17:06:52', 'Read'),
(4, 1, 3, 'Your booking has been updated successfully.', 'info', '2026-06-27 17:07:49', 'Read'),
(5, 1, 3, 'Your booking has been cancelled. Reason: test101', 'danger', '2026-06-27 17:19:05', 'Read'),
(6, 1, NULL, 'Your recurring booking request for Design Studio is Pending Approval.', 'warning', '2026-06-27 17:25:27', 'Read'),
(7, 1, 1, 'QR check-in successful for Lecture Hall A.', 'success', '2026-06-27 17:54:47', 'Read'),
(8, 1, NULL, 'Your recurring booking request for Lecture Hall A is Pending Approval.', 'warning', '2026-06-27 18:23:04', 'Read');

-- --------------------------------------------------------

--
-- Table structure for table `recurring_bookings`
--

CREATE TABLE `recurring_bookings` (
  `recurringID` int NOT NULL,
  `userID` int NOT NULL,
  `resourceID` int NOT NULL,
  `repeatType` varchar(30) NOT NULL,
  `repeatDay` varchar(30) NOT NULL,
  `startDate` date NOT NULL,
  `endDate` date NOT NULL,
  `startTime` time NOT NULL,
  `endTime` time NOT NULL,
  `purpose` varchar(100) NOT NULL,
  `requirements` text,
  `status` varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `recurring_bookings`
--

INSERT INTO `recurring_bookings` (`recurringID`, `userID`, `resourceID`, `repeatType`, `repeatDay`, `startDate`, `endDate`, `startTime`, `endTime`, `purpose`, `requirements`, `status`) VALUES
(1, 1, 4, 'Weekly', 'Monday', '2026-06-30', '2026-07-26', '12:00:00', '13:00:00', 'Meeting', '', 'Pending Approval'),
(2, 1, 1, 'Weekly', 'Monday', '2026-06-29', '2026-07-26', '12:00:00', '15:00:00', 'Lecture', '', 'Pending Approval');

-- --------------------------------------------------------

--
-- Table structure for table `resources`
--

CREATE TABLE `resources` (
  `resourceID` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `type` varchar(50) NOT NULL,
  `location` varchar(100) NOT NULL,
  `capacity` int NOT NULL,
  `facilities` varchar(255) DEFAULT NULL,
  `status` varchar(30) NOT NULL,
  `approvalRequired` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `resources`
--

INSERT INTO `resources` (`resourceID`, `name`, `type`, `location`, `capacity`, `facilities`, `status`, `approvalRequired`) VALUES
(1, 'Lecture Hall A', 'Classroom', 'Block A', 120, 'Projector, microphone, smart board, WiFi', 'Available', 'No'),
(2, 'Computer Lab 2', 'Computer Lab', 'Block B', 40, '40 computers, projector, WiFi, lab software', 'Available', 'Yes'),
(3, 'Meeting Room C', 'Meeting Room', 'Library Building', 20, 'TV screen, conference table, WiFi', 'Available', 'No'),
(4, 'Design Studio', 'Studio', 'Block C', 35, 'Drawing tables, projector, display boards', 'Available', 'Yes'),
(5, 'Portable Projector Set', 'Equipment', 'Block A', 1, 'Projector, HDMI cable, remote control', 'Unavailable', 'No');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `userID` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `department` varchar(100) DEFAULT NULL,
  `role` varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`userID`, `name`, `email`, `department`, `role`) VALUES
(1, 'Faculty Staff User', 'faculty@example.com', 'Faculty Department', 'Faculty & Staff');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`bookingID`),
  ADD KEY `userID` (`userID`),
  ADD KEY `resourceID` (`resourceID`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`notificationID`),
  ADD KEY `userID` (`userID`);

--
-- Indexes for table `recurring_bookings`
--
ALTER TABLE `recurring_bookings`
  ADD PRIMARY KEY (`recurringID`),
  ADD KEY `userID` (`userID`),
  ADD KEY `resourceID` (`resourceID`);

--
-- Indexes for table `resources`
--
ALTER TABLE `resources`
  ADD PRIMARY KEY (`resourceID`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`userID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `bookingID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `notificationID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `recurring_bookings`
--
ALTER TABLE `recurring_bookings`
  MODIFY `recurringID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `resources`
--
ALTER TABLE `resources`
  MODIFY `resourceID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `userID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`userID`) REFERENCES `users` (`userID`),
  ADD CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`resourceID`) REFERENCES `resources` (`resourceID`);

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`userID`) REFERENCES `users` (`userID`);

--
-- Constraints for table `recurring_bookings`
--
ALTER TABLE `recurring_bookings`
  ADD CONSTRAINT `recurring_bookings_ibfk_1` FOREIGN KEY (`userID`) REFERENCES `users` (`userID`),
  ADD CONSTRAINT `recurring_bookings_ibfk_2` FOREIGN KEY (`resourceID`) REFERENCES `resources` (`resourceID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
