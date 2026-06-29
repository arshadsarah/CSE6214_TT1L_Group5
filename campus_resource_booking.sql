-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Jun 28, 2026 at 09:40 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

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
-- Table structure for table `admin_notifications`
--

CREATE TABLE `admin_notifications` (
  `notificationID` int(11) NOT NULL,
  `title` varchar(100) NOT NULL,
  `type` varchar(50) NOT NULL,
  `targetUser` varchar(50) NOT NULL,
  `priority` varchar(20) NOT NULL,
  `status` varchar(30) NOT NULL,
  `scheduleDate` datetime DEFAULT NULL,
  `message` text NOT NULL,
  `createdAt` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin_notifications`
--

INSERT INTO `admin_notifications` (`notificationID`, `title`, `type`, `targetUser`, `priority`, `status`, `scheduleDate`, `message`, `createdAt`) VALUES
(1, 'Room Booking Approved', 'Booking Update', 'Students', 'Medium', 'Sent', '2026-06-28 09:30:00', 'Your computer lab booking request has been approved successfully.', '2026-06-29 03:39:21'),
(2, 'Library Room Reminder', 'Booking Reminder', 'All Users', 'Low', 'Scheduled', '2026-07-05 10:00:00', 'You have a library discussion room booking scheduled for tomorrow.', '2026-06-29 03:39:21'),
(3, 'Computer Lab Maintenance', 'Maintenance Notice', 'Resource Managers', 'High', 'Draft', NULL, 'Computer Lab 2 will be unavailable due to network maintenance.', '2026-06-29 03:39:21'),
(4, 'Auditorium Booking Rejected', 'Booking Update', 'Faculty & Staff', 'Medium', 'Sent', '2026-06-27 14:20:00', 'Your auditorium booking request was rejected because the venue is unavailable.', '2026-06-29 03:39:21'),
(5, 'System Upgrade Notice', 'General Announcement', 'Administrators', 'High', 'Scheduled', '2026-07-10 22:00:00', 'The campus booking system will be upgraded from 10 PM to 12 AM.', '2026-06-29 03:39:21');

-- --------------------------------------------------------

--
-- Table structure for table `admin_reports`
--

CREATE TABLE `admin_reports` (
  `reportID` int(11) NOT NULL,
  `reportType` varchar(100) NOT NULL,
  `startDate` date NOT NULL,
  `endDate` date NOT NULL,
  `status` varchar(30) NOT NULL,
  `generatedBy` varchar(100) NOT NULL,
  `createdAt` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin_reports`
--

INSERT INTO `admin_reports` (`reportID`, `reportType`, `startDate`, `endDate`, `status`, `generatedBy`, `createdAt`) VALUES
(1, 'Booking Summary', '2026-06-01', '2026-06-30', 'Generated', 'Admin', '2026-06-29 03:39:21'),
(2, 'Resource Usage', '2026-06-01', '2026-06-30', 'Generated', 'Sarah Ahmed', '2026-06-29 03:39:21'),
(3, 'User Activity', '2026-06-10', '2026-06-25', 'Pending', 'Priya Kumar', '2026-06-29 03:39:21'),
(4, 'Notification Summary', '2026-06-01', '2026-06-28', 'Generated', 'Admin', '2026-06-29 03:39:21'),
(5, 'System Monitoring', '2026-06-20', '2026-06-28', 'Pending', 'Sarah Ahmed', '2026-06-29 03:39:21');

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `bookingID` int(11) NOT NULL,
  `userID` int(11) NOT NULL,
  `resourceID` int(11) NOT NULL,
  `bookingDate` date NOT NULL,
  `startTime` time NOT NULL,
  `endTime` time NOT NULL,
  `purpose` varchar(100) NOT NULL,
  `attendees` int(11) NOT NULL,
  `requirements` text DEFAULT NULL,
  `status` varchar(30) NOT NULL,
  `qrCode` varchar(255) DEFAULT NULL,
  `checkInStatus` varchar(30) DEFAULT 'Not checked-in',
  `cancellationReason` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `notificationID` int(11) NOT NULL,
  `userID` int(11) NOT NULL,
  `bookingID` int(11) DEFAULT NULL,
  `message` varchar(255) NOT NULL,
  `type` varchar(30) NOT NULL,
  `dateCreated` datetime DEFAULT current_timestamp(),
  `status` varchar(30) DEFAULT 'Unread'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `recurringID` int(11) NOT NULL,
  `userID` int(11) NOT NULL,
  `resourceID` int(11) NOT NULL,
  `repeatType` varchar(30) NOT NULL,
  `repeatDay` varchar(30) NOT NULL,
  `startDate` date NOT NULL,
  `endDate` date NOT NULL,
  `startTime` time NOT NULL,
  `endTime` time NOT NULL,
  `purpose` varchar(100) NOT NULL,
  `requirements` text DEFAULT NULL,
  `status` varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `resourceID` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `type` varchar(50) NOT NULL,
  `location` varchar(100) NOT NULL,
  `capacity` int(11) NOT NULL,
  `facilities` varchar(255) DEFAULT NULL,
  `status` varchar(30) NOT NULL,
  `approvalRequired` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
-- Table structure for table `system_monitoring`
--

CREATE TABLE `system_monitoring` (
  `monitoringID` int(11) NOT NULL,
  `moduleName` varchar(100) NOT NULL,
  `status` varchar(30) NOT NULL,
  `severity` varchar(30) NOT NULL,
  `responseTime` int(11) NOT NULL,
  `uptime` decimal(5,2) NOT NULL,
  `lastChecked` datetime NOT NULL,
  `note` text NOT NULL,
  `createdAt` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `system_monitoring`
--

INSERT INTO `system_monitoring` (`monitoringID`, `moduleName`, `status`, `severity`, `responseTime`, `uptime`, `lastChecked`, `note`, `createdAt`) VALUES
(1, 'Booking Server', 'Online', 'Low', 210, 99.80, '2026-06-28 10:30:00', 'Booking server is working normally without major issues.', '2026-06-29 03:39:21'),
(2, 'Notification Service', 'Warning', 'Medium', 780, 96.40, '2026-06-28 11:15:00', 'Notification service response time is slower than usual.', '2026-06-29 03:39:21'),
(3, 'Resource Database', 'Offline', 'Critical', 0, 88.20, '2026-06-28 12:00:00', 'Database connection failed and requires immediate checking.', '2026-06-29 03:39:21'),
(4, 'Login Authentication', 'Online', 'Low', 180, 99.90, '2026-06-28 13:20:00', 'Login authentication module is running successfully.', '2026-06-29 03:39:21'),
(5, 'Report Generator', 'Warning', 'High', 1200, 94.50, '2026-06-28 15:45:00', 'Report generation is working but taking longer than expected.', '2026-06-29 03:39:21');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `userID` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `department` varchar(100) DEFAULT NULL,
  `role` varchar(30) NOT NULL,
  `password` varchar(100) DEFAULT NULL,
  `status` varchar(30) DEFAULT 'Active',
  `username` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`userID`, `name`, `email`, `department`, `role`, `password`, `status`, `username`) VALUES
(1, 'Faculty Staff User', 'faculty@example.com', 'Faculty Department', 'Faculty & Staff', NULL, 'Active', NULL),
(2, 'Admin', 'admin@gmail.com', 'Administration', 'Admin', 'Admin123', 'Active', NULL),
(3, 'Admin', 'admin@gmail.com', 'Administration', 'Admin', 'Admin123', 'Active', NULL),
(4, 'Student User', 'student@gmail.com', 'Computer Science', 'Student', 'Student123', 'Active', NULL),
(5, 'Faculty User', 'faculty@gmail.com', 'Computer Science', 'Faculty & Staff', 'Faculty123', 'Active', NULL),
(6, 'Resource Manager', 'manager@gmail.com', 'Facilities', 'Resource Manager', 'Manager123', 'Active', NULL),
(7, 'Admin', 'admin@gmail.com', 'Administration', 'Admin', 'Admin123', 'Active', 'admin'),
(8, 'Student User', 'student@gmail.com', 'Computer Science', 'Student', 'Student123', 'Active', 'student'),
(9, 'Staff User', 'staff@gmail.com', 'Computer Science', 'Staff / Faculty', 'Staff123', 'Active', 'staff'),
(10, 'Resource Manager', 'manager@gmail.com', 'Facilities', 'Resource Manager', 'Manager123', 'Active', 'manager'),
(11, 'Aisha Rahman', 'aisha.rahman@student.edu', 'Faculty of Computing', 'Student', 'User123', 'Active', 'student01'),
(12, 'Daniel Lim', 'daniel.lim@student.edu', 'Faculty of Business', 'Student', 'User123', 'Active', 'student02'),
(13, 'Nur Farhana', 'nur.farhana@student.edu', 'Faculty of Engineering', 'Student', 'User123', 'Inactive', 'student03'),
(14, 'Jason Lee', 'jason.lee@student.edu', 'Faculty of Creative Multimedia', 'Student', 'User123', 'Active', 'student04'),
(15, 'Omar Hassan', 'omar.hassan@student.edu', 'Faculty of Information Science', 'Student', 'User123', 'Active', 'student05'),
(16, 'Dr. Ahmad Zain', 'ahmad.zain@campus.edu', 'Computer Science Department', 'Staff / Faculty', 'User123', 'Active', 'staff01'),
(17, 'Ms. Linda Tan', 'linda.tan@campus.edu', 'Library Department', 'Staff / Faculty', 'User123', 'Active', 'staff02'),
(18, 'Mr. Ravi Kumar', 'ravi.kumar@campus.edu', 'Student Affairs Department', 'Staff / Faculty', 'User123', 'Inactive', 'staff03'),
(19, 'Dr. Emily Wong', 'emily.wong@campus.edu', 'Engineering Department', 'Staff / Faculty', 'User123', 'Active', 'staff04'),
(20, 'Farhan Malik', 'farhan.manager@campus.edu', 'Computer Labs', 'Resource Manager', 'User123', 'Active', 'manager01'),
(21, 'Mei Ling', 'mei.manager@campus.edu', 'Seminar Halls', 'Resource Manager', 'User123', 'Active', 'manager02'),
(22, 'Sarah Abdullah', 'sarah.manager@campus.edu', 'Auditorium and Event Spaces', 'Resource Manager', 'User123', 'Inactive', 'manager03'),
(23, 'Sarah Ahmed', 'sarah.admin@campus.edu', 'Super Admin', 'Admin', 'User123', 'Active', 'admin01'),
(24, 'Priya Kumar', 'priya.admin@campus.edu', 'System Administrator', 'Admin', 'User123', 'Active', 'admin02');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin_notifications`
--
ALTER TABLE `admin_notifications`
  ADD PRIMARY KEY (`notificationID`);

--
-- Indexes for table `admin_reports`
--
ALTER TABLE `admin_reports`
  ADD PRIMARY KEY (`reportID`);

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
-- Indexes for table `system_monitoring`
--
ALTER TABLE `system_monitoring`
  ADD PRIMARY KEY (`monitoringID`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`userID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin_notifications`
--
ALTER TABLE `admin_notifications`
  MODIFY `notificationID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `admin_reports`
--
ALTER TABLE `admin_reports`
  MODIFY `reportID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `bookingID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `notificationID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `recurring_bookings`
--
ALTER TABLE `recurring_bookings`
  MODIFY `recurringID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `resources`
--
ALTER TABLE `resources`
  MODIFY `resourceID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `system_monitoring`
--
ALTER TABLE `system_monitoring`
  MODIFY `monitoringID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `userID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

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
