const resources = [
  {
    id: "R001",
    name: "Lecture Hall A",
    type: "Classroom",
    location: "Block A",
    capacity: 120,
    facilities: "Projector, microphone, smart board, WiFi",
    status: "Available",
    approval: "No approval required"
  },
  {
    id: "R002",
    name: "Computer Lab 2",
    type: "Computer Lab",
    location: "Block B",
    capacity: 40,
    facilities: "40 computers, projector, WiFi, lab software",
    status: "Available",
    approval: "Approval required"
  },
  {
    id: "R003",
    name: "Meeting Room C",
    type: "Meeting Room",
    location: "Library Building",
    capacity: 20,
    facilities: "TV screen, conference table, WiFi",
    status: "Available",
    approval: "No approval required"
  },
  {
    id: "R004",
    name: "Design Studio",
    type: "Studio",
    location: "Block C",
    capacity: 35,
    facilities: "Drawing tables, projector, display boards",
    status: "Available",
    approval: "Approval required"
  },
  {
    id: "R005",
    name: "Portable Projector Set",
    type: "Equipment",
    location: "Block A",
    capacity: 1,
    facilities: "Projector, HDMI cable, remote control",
    status: "Unavailable",
    approval: "No approval required"
  }
];

let bookings = [
  {
    id: "BK-FS-101",
    resource: "Lecture Hall A",
    date: "2026-06-18",
    startTime: "10:00",
    endTime: "12:00",
    purpose: "Lecture",
    attendees: 80,
    requirements: "Microphone and projector",
    status: "Confirmed"
  },
  {
    id: "BK-FS-102",
    resource: "Computer Lab 2",
    date: "2026-06-19",
    startTime: "14:00",
    endTime: "16:00",
    purpose: "Workshop",
    attendees: 35,
    requirements: "Lab software installed",
    status: "Pending Approval"
  },
  {
    id: "BK-FS-103",
    resource: "Design Studio",
    date: "2026-06-21",
    startTime: "09:00",
    endTime: "11:00",
    purpose: "Seminar",
    attendees: 30,
    requirements: "Display boards",
    status: "Confirmed"
  }
];

let notifications = [
  {
    title: "Booking Confirmed",
    message: "Your booking for Lecture Hall A has been confirmed.",
    type: "success",
    time: "Today, 9:30 AM",
    read: false
  },
  {
    title: "Pending Approval",
    message: "Your booking for Computer Lab 2 is waiting for Resource Manager approval.",
    type: "warning",
    time: "Today, 10:15 AM",
    read: false
  },
  {
    title: "QR Ready",
    message: "QR code is ready for your confirmed booking BK-FS-101.",
    type: "info",
    time: "Yesterday, 4:20 PM",
    read: true
  },
  {
    title: "Booking Updated",
    message: "Your Design Studio booking details were updated successfully.",
    type: "info",
    time: "Yesterday, 2:00 PM",
    read: true
  }
];

function showPage(pageId, button) {
  const pages = document.querySelectorAll(".page");
  const menuButtons = document.querySelectorAll(".menu-btn");

  pages.forEach(page => page.classList.remove("active-page"));
  menuButtons.forEach(btn => btn.classList.remove("active"));

  document.getElementById(pageId).classList.add("active-page");

  if (button) {
    button.classList.add("active");
  }

  if (pageId === "qr") {
    loadQRBookingOptions();
  }

  if (pageId === "notifications") {
    renderNotifications();
  }

  window.scrollTo(0, 0);
}

function showPageById(pageId) {
  const pages = document.querySelectorAll(".page");
  const menuButtons = document.querySelectorAll(".menu-btn");

  pages.forEach(page => page.classList.remove("active-page"));
  menuButtons.forEach(btn => btn.classList.remove("active"));

  document.getElementById(pageId).classList.add("active-page");

  menuButtons.forEach(btn => {
    const text = btn.textContent.toLowerCase();

    if (
      (pageId === "dashboard" && text.includes("dashboard")) ||
      (pageId === "search" && text.includes("search")) ||
      (pageId === "create" && text.includes("create")) ||
      (pageId === "recurring" && text.includes("recurring")) ||
      (pageId === "bookings" && text.includes("bookings")) ||
      (pageId === "qr" && text.includes("qr")) ||
      (pageId === "notifications" && text.includes("notifications"))
    ) {
      btn.classList.add("active");
    }
  });

  if (pageId === "qr") {
    loadQRBookingOptions();
  }

  if (pageId === "notifications") {
    renderNotifications();
  }

  window.scrollTo(0, 0);
}

function statusClass(status) {
  const cleanStatus = status.trim().toLowerCase();

  if (cleanStatus === "confirmed") return "confirmed";
  if (cleanStatus === "pending approval") return "pending";
  return "cancelled";
}

function formatDate(dateText) {
  const date = new Date(dateText);

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function renderDashboardBookings() {
  const table = document.getElementById("dashboardBookingTable");

  if (!table) return;

  const activeBookings = bookings
    .filter(booking => booking.status !== "Cancelled")
    .slice(0, 3);

  table.innerHTML = "";

  activeBookings.forEach(booking => {
    table.innerHTML += `
      <tr>
        <td>${booking.id}</td>
        <td>${booking.resource}</td>
        <td>${formatDate(booking.date)}</td>
        <td>${booking.startTime} - ${booking.endTime}</td>
        <td><span class="status ${statusClass(booking.status)}">${booking.status}</span></td>
        <td>
          <button class="table-btn" onclick="viewBooking('${booking.id}')">View</button>
          <button class="table-btn" onclick="showPageById('bookings')">Manage</button>
        </td>
      </tr>
    `;
  });
}

function renderMyBookings() {
  const table = document.getElementById("myBookingsTable");

  if (!table) return;

  table.innerHTML = "";

  bookings.forEach(booking => {
    table.innerHTML += `
      <tr>
        <td>${booking.id}</td>
        <td>${booking.resource}</td>
        <td>${formatDate(booking.date)}</td>
        <td>${booking.startTime} - ${booking.endTime}</td>
        <td>${booking.purpose}</td>
        <td>
          <span class="status ${statusClass(booking.status)}">${booking.status}</span>
        </td>
        <td>
          <div class="booking-action-buttons">
            <button class="table-btn" onclick="viewBooking('${booking.id}')">View</button>
            <button class="table-btn" onclick="openEditBooking('${booking.id}')">Modify</button>
            <button class="table-btn" onclick="openCancelBooking('${booking.id}')">Cancel</button>
          </div>
        </td>
      </tr>
    `;
  });
}

function updateDashboardCounts() {
  const upcoming = bookings.filter(booking => booking.status === "Confirmed").length;
  const pending = bookings.filter(booking => booking.status === "Pending Approval").length;
  const unreadNotifications = notifications.filter(notification => !notification.read).length;

  const upcomingCount = document.getElementById("upcomingCount");
  const pendingCount = document.getElementById("pendingCount");
  const notificationCount = document.getElementById("notificationCount");

  if (upcomingCount) upcomingCount.textContent = upcoming;
  if (pendingCount) pendingCount.textContent = pending;
  if (notificationCount) notificationCount.textContent = unreadNotifications;
}

function refreshTables() {
  renderDashboardBookings();
  renderMyBookings();
  updateDashboardCounts();
  loadQRBookingOptions();
  renderNotifications();
}

function viewBooking(bookingId) {
  const booking = bookings.find(item => item.id === bookingId);
  const modal = document.getElementById("bookingModal");
  const details = document.getElementById("bookingDetails");

  if (!booking) return;

  details.innerHTML = `
    <strong>Booking ID:</strong> ${booking.id}<br>
    <strong>Resource:</strong> ${booking.resource}<br>
    <strong>Date:</strong> ${formatDate(booking.date)}<br>
    <strong>Time:</strong> ${booking.startTime} - ${booking.endTime}<br>
    <strong>Purpose:</strong> ${booking.purpose}<br>
    <strong>Attendees:</strong> ${booking.attendees}<br>
    <strong>Status:</strong> ${booking.status}<br>
    <strong>Requirements:</strong> ${booking.requirements || "None"}<br>
    <strong>QR Status:</strong> ${
      booking.status === "Confirmed"
        ? "Ready for verification"
        : "Not generated until approval"
    }
  `;

  modal.style.display = "flex";
}

function closeModal() {
  document.getElementById("bookingModal").style.display = "none";
}

function searchItem() {
  const value = document.getElementById("searchInput").value.trim();

  if (value === "") {
    alert("Please enter a booking ID, resource name, or room to search.");
    return;
  }

  const found = bookings.find(booking =>
    booking.id.toLowerCase().includes(value.toLowerCase()) ||
    booking.resource.toLowerCase().includes(value.toLowerCase())
  );

  if (found) {
    viewBooking(found.id);
  } else {
    alert("No booking found for: " + value);
  }
}

function logoutUser() {
  alert("You have logged out. This will later connect to the shared login module.");
}

function displayResources(resourceArray) {
  const resourceList = document.getElementById("resourceList");
  const resultCount = document.getElementById("resultCount");

  if (!resourceList || !resultCount) return;

  resourceList.innerHTML = "";

  if (resourceArray.length === 0) {
    resourceList.innerHTML = "<p>No matching resources found. Try changing your search criteria.</p>";
    resultCount.textContent = "0 resources found";
    return;
  }

  resultCount.textContent = resourceArray.length + " resources found";

  resourceArray.forEach(resource => {
    const badgeClass = resource.status === "Available" ? "available-badge" : "unavailable-badge";

    resourceList.innerHTML += `
      <div class="resource-card">
        <div class="resource-card-header">
          <div>
            <h3>${resource.name}</h3>
            <span class="resource-type">${resource.type}</span>
          </div>
          <span class="${badgeClass}">${resource.status}</span>
        </div>

        <div class="resource-info">
          <strong>Location:</strong> ${resource.location}<br>
          <strong>Capacity:</strong> ${resource.capacity}<br>
          <strong>Facilities:</strong> ${resource.facilities}
        </div>

        <div class="resource-actions">
          <button onclick="viewResourceDetails('${resource.id}')">View Details</button>
          <button onclick="checkAvailability('${resource.id}')">Check Availability</button>
          <button onclick="bookResource('${resource.id}')">Book Resource</button>
        </div>
      </div>
    `;
  });
}

function searchResources() {
  const type = document.getElementById("resourceType").value;
  const location = document.getElementById("resourceLocation").value;
  const capacity = document.getElementById("capacity").value;
  const facility = document.getElementById("facility").value.toLowerCase();

  const filteredResources = resources.filter(resource => {
    const matchType = type === "" || resource.type === type;
    const matchLocation = location === "" || resource.location === location;
    const matchCapacity = capacity === "" || resource.capacity >= Number(capacity);
    const matchFacility = facility === "" || resource.facilities.toLowerCase().includes(facility);

    return matchType && matchLocation && matchCapacity && matchFacility;
  });

  displayResources(filteredResources);
}

function resetSearch() {
  document.getElementById("resourceType").value = "";
  document.getElementById("resourceLocation").value = "";
  document.getElementById("searchDate").value = "";
  document.getElementById("searchTime").value = "";
  document.getElementById("capacity").value = "";
  document.getElementById("facility").value = "";

  displayResources(resources);

  document.getElementById("resourceDetails").innerHTML =
    "<p>Select a resource and click View Details.</p>";
}

function viewResourceDetails(resourceId) {
  const resource = resources.find(item => item.id === resourceId);
  const details = document.getElementById("resourceDetails");

  details.innerHTML = `
    <div class="details-box">
      <h3>${resource.name}</h3>
      <p>
        <strong>Resource ID:</strong> ${resource.id}<br>
        <strong>Type:</strong> ${resource.type}<br>
        <strong>Location:</strong> ${resource.location}<br>
        <strong>Capacity:</strong> ${resource.capacity}<br>
        <strong>Facilities:</strong> ${resource.facilities}<br>
        <strong>Status:</strong> ${resource.status}<br>
        <strong>Approval Requirement:</strong> ${resource.approval}
      </p>
    </div>
  `;
}

function checkAvailability(resourceId) {
  const resource = resources.find(item => item.id === resourceId);
  const details = document.getElementById("resourceDetails");
  const date = document.getElementById("searchDate").value;
  const time = document.getElementById("searchTime").value;

  if (date === "" || time === "") {
    details.innerHTML = `
      <div class="details-box">
        <h3>Availability Check</h3>
        <p>Please choose a date and time before checking availability for <strong>${resource.name}</strong>.</p>
      </div>
    `;
    return;
  }

  if (resource.status === "Unavailable") {
    details.innerHTML = `
      <div class="details-box">
        <h3>Availability Result</h3>
        <p>
          <strong>${resource.name}</strong> is not available on ${date} at ${time}.<br>
          Please choose another resource or time slot.
        </p>
        <span class="unavailable-badge">Unavailable</span>
      </div>
    `;
  } else {
    details.innerHTML = `
      <div class="details-box">
        <h3>Availability Result</h3>
        <p>
          <strong>${resource.name}</strong> is available on ${date} at ${time}.<br>
          You can continue to create a booking request.
        </p>
        <span class="available-badge">Available</span>
      </div>
    `;
  }
}

function bookResource(resourceId) {
  const resource = resources.find(item => item.id === resourceId);

  if (resource.status === "Unavailable") {
    alert(resource.name + " is currently unavailable. Please choose another resource.");
    return;
  }

  document.getElementById("bookingResource").value = resource.name;
  showPageById("create");
}

function submitBooking(event) {
  event.preventDefault();

  const resourceName = document.getElementById("bookingResource").value;
  const bookingDate = document.getElementById("bookingDate").value;
  const startTime = document.getElementById("startTime").value;
  const endTime = document.getElementById("endTime").value;
  const attendees = document.getElementById("attendees").value;
  const purpose = document.getElementById("purpose").value;
  const requirements = document.getElementById("requirements").value.trim();
  const result = document.getElementById("bookingResult");

  if (startTime >= endTime) {
    result.innerHTML = `
      <div class="result-box">
        <h3>Invalid Time</h3>
        <p>End time must be later than start time.</p>
      </div>
    `;
    return;
  }

  const selectedResource = resources.find(resource => resource.name === resourceName);

  if (selectedResource && selectedResource.status === "Unavailable") {
    result.innerHTML = `
      <div class="result-box">
        <h3>Booking Failed</h3>
        <p>${resourceName} is currently unavailable. Please choose another resource.</p>
      </div>
    `;
    return;
  }

  const bookingId = "BK-FS-" + Math.floor(Math.random() * 900 + 100);
  const needsApproval = selectedResource && selectedResource.approval === "Approval required";
  const statusText = needsApproval ? "Pending Approval" : "Confirmed";
  const resultClass = needsApproval ? "pending-result" : "success-result";

  const newBooking = {
    id: bookingId,
    resource: resourceName,
    date: bookingDate,
    startTime: startTime,
    endTime: endTime,
    purpose: purpose,
    attendees: attendees,
    requirements: requirements,
    status: statusText
  };

  bookings.push(newBooking);
  refreshTables();

  result.innerHTML = `
    <div class="result-box ${resultClass}">
      <h3>${needsApproval ? "Booking Submitted for Approval" : "Booking Confirmed"}</h3>
      <p>
        <strong>Booking ID:</strong> ${bookingId}<br>
        <strong>Resource:</strong> ${resourceName}<br>
        <strong>Date:</strong> ${formatDate(bookingDate)}<br>
        <strong>Time:</strong> ${startTime} - ${endTime}<br>
        <strong>Purpose:</strong> ${purpose}<br>
        <strong>Attendees:</strong> ${attendees}<br>
        <strong>Status:</strong> ${statusText}<br>
        <strong>Special Requirements:</strong> ${requirements || "None"}
      </p>
    </div>
  `;

  if (needsApproval) {
    addNotification(
      "Booking Pending Approval",
      `${bookingId} for ${resourceName} is waiting for approval.`,
      "warning"
    );

    alert("Booking submitted and waiting for approval.");
  } else {
    addNotification(
      "Booking Confirmed",
      `${bookingId} for ${resourceName} has been confirmed.`,
      "success"
    );

    alert("Booking confirmed successfully.");
  }
}

function clearBookingForm() {
  document.getElementById("bookingForm").reset();

  document.getElementById("bookingResult").innerHTML =
    "<p>Submit the form to see booking confirmation or pending approval status.</p>";
}

function openEditBooking(bookingId) {
  const booking = bookings.find(item => item.id === bookingId);

  if (!booking) return;

  if (booking.status === "Cancelled") {
    alert("Cancelled bookings cannot be modified.");
    return;
  }

  document.getElementById("cancelBookingPanel").classList.add("hidden");
  document.getElementById("editBookingPanel").classList.remove("hidden");

  document.getElementById("editBookingId").value = booking.id;
  document.getElementById("editResource").value = booking.resource;
  document.getElementById("editDate").value = booking.date;
  document.getElementById("editStartTime").value = booking.startTime;
  document.getElementById("editEndTime").value = booking.endTime;
  document.getElementById("editPurpose").value = booking.purpose;
  document.getElementById("editAttendees").value = booking.attendees;

  document.getElementById("editBookingPanel").scrollIntoView({ behavior: "smooth" });
}

function saveBookingChanges(event) {
  event.preventDefault();

  const bookingId = document.getElementById("editBookingId").value;
  const booking = bookings.find(item => item.id === bookingId);

  const newStartTime = document.getElementById("editStartTime").value;
  const newEndTime = document.getElementById("editEndTime").value;

  if (newStartTime >= newEndTime) {
    alert("End time must be later than start time.");
    return;
  }

  booking.resource = document.getElementById("editResource").value;
  booking.date = document.getElementById("editDate").value;
  booking.startTime = newStartTime;
  booking.endTime = newEndTime;
  booking.purpose = document.getElementById("editPurpose").value;
  booking.attendees = document.getElementById("editAttendees").value;

  const selectedResource = resources.find(resource => resource.name === booking.resource);

  if (selectedResource && selectedResource.approval === "Approval required") {
    booking.status = "Pending Approval";
  } else {
    booking.status = "Confirmed";
  }

  refreshTables();
  closeEditPanel();

  addNotification(
    "Booking Updated",
    `${booking.id} has been updated successfully.`,
    "info"
  );

  alert("Booking updated successfully.");
}

function closeEditPanel() {
  document.getElementById("editBookingPanel").classList.add("hidden");
}

function openCancelBooking(bookingId) {
  const booking = bookings.find(item => item.id === bookingId);

  if (!booking) return;

  if (booking.status === "Cancelled") {
    alert("This booking is already cancelled.");
    return;
  }

  document.getElementById("editBookingPanel").classList.add("hidden");
  document.getElementById("cancelBookingPanel").classList.remove("hidden");

  document.getElementById("cancelBookingId").value = bookingId;
  document.getElementById("cancelReason").value = "";

  document.getElementById("cancelBookingPanel").scrollIntoView({ behavior: "smooth" });
}

function confirmCancelBooking() {
  const bookingId = document.getElementById("cancelBookingId").value;
  const reason = document.getElementById("cancelReason").value.trim();
  const booking = bookings.find(item => item.id === bookingId);

  if (reason === "") {
    alert("Please enter a cancellation reason.");
    return;
  }

  booking.status = "Cancelled";
  booking.requirements = (booking.requirements || "") + " | Cancellation reason: " + reason;

  refreshTables();
  closeCancelPanel();

  addNotification(
    "Booking Cancelled",
    `${booking.id} has been cancelled. Reason: ${reason}`,
    "danger"
  );

  alert("Booking cancelled successfully.");
}

function closeCancelPanel() {
  document.getElementById("cancelBookingPanel").classList.add("hidden");
}

function loadQRBookingOptions() {
  const select = document.getElementById("qrBookingSelect");

  if (!select) return;

  select.innerHTML = `<option value="">Select confirmed booking</option>`;

  const confirmedBookings = bookings.filter(booking =>
    booking.status.trim().toLowerCase() === "confirmed"
  );

  if (confirmedBookings.length === 0) {
    select.innerHTML += `<option value="">No confirmed bookings available</option>`;
    return;
  }

  confirmedBookings.forEach(booking => {
    select.innerHTML += `
      <option value="${booking.id}">
        ${booking.id} - ${booking.resource} (${formatDate(booking.date)})
      </option>
    `;
  });
}

function generateQR() {
  const bookingId = document.getElementById("qrBookingSelect").value;
  const display = document.getElementById("qrDisplayArea");

  if (bookingId === "") {
    display.innerHTML = `<p>Please select a confirmed booking first.</p>`;
    return;
  }

  const booking = bookings.find(item => item.id === bookingId);

  display.innerHTML = `
    <div class="qr-card">
      <h3>${booking.resource}</h3>
      <p>
        <strong>Booking ID:</strong> ${booking.id}<br>
        <strong>Date:</strong> ${formatDate(booking.date)}<br>
        <strong>Time:</strong> ${booking.startTime} - ${booking.endTime}
      </p>

      <div class="fake-qr"></div>

      <span class="qr-code-label">QR Code: FS-VALID</span>
      <p style="margin-top: 12px;">
        Use <strong>FS-VALID</strong> in the verification box to simulate a successful check-in.
      </p>
    </div>
  `;
}

function clearQR() {
  document.getElementById("qrBookingSelect").value = "";
  document.getElementById("qrDisplayArea").innerHTML =
    "<p>Select a confirmed booking and click Generate QR.</p>";
}

function verifyQR() {
  const qrCode = document.getElementById("qrCodeInput").value.trim().toUpperCase();
  const result = document.getElementById("qrResult");

  if (qrCode === "") {
    result.innerHTML = `
      <div class="qr-result-box qr-warning">
        <h3>No QR Code Entered</h3>
        <p>Please enter a QR code before verification.</p>
      </div>
    `;
    return;
  }

  if (qrCode === "FS-VALID") {
    result.innerHTML = `
      <div class="qr-result-box qr-success">
        <h3>Checked In Successfully</h3>
        <p>QR code is valid. The booking has been verified and the Faculty & Staff user is checked in.</p>
      </div>
    `;

    addNotification(
      "QR Check-In Successful",
      "A confirmed booking has been verified successfully using QR code.",
      "success"
    );
  } else if (qrCode === "FS-INVALID") {
    result.innerHTML = `
      <div class="qr-result-box qr-error">
        <h3>Invalid QR Code</h3>
        <p>The QR code does not match any valid confirmed booking.</p>
      </div>
    `;
  } else if (qrCode === "FS-TIME") {
    result.innerHTML = `
      <div class="qr-result-box qr-warning">
        <h3>Invalid Check-In Time</h3>
        <p>The QR code is valid, but the user is trying to check in outside the allowed booking time.</p>
      </div>
    `;
  } else if (qrCode === "FS-DONE") {
    result.innerHTML = `
      <div class="qr-result-box qr-warning">
        <h3>Already Checked In</h3>
        <p>This booking has already been verified earlier.</p>
      </div>
    `;
  } else {
    result.innerHTML = `
      <div class="qr-result-box qr-error">
        <h3>Verification Failed</h3>
        <p>Unknown QR code. Please try one of the sample codes.</p>
      </div>
    `;
  }
}

function clearQRResult() {
  document.getElementById("qrCodeInput").value = "";
  document.getElementById("qrResult").innerHTML =
    "<p>Verification result will appear here.</p>";
}

function submitRecurringBooking(event) {
  event.preventDefault();

  const resource = document.getElementById("recurringResource").value;
  const repeatType = document.getElementById("repeatType").value;
  const repeatDay = document.getElementById("repeatDay").value;
  const startDate = document.getElementById("recurringStartDate").value;
  const endDate = document.getElementById("recurringEndDate").value;
  const startTime = document.getElementById("recurringStartTime").value;
  const endTime = document.getElementById("recurringEndTime").value;
  const purpose = document.getElementById("recurringPurpose").value;
  const requirements = document.getElementById("recurringRequirements").value.trim();
  const result = document.getElementById("recurringResult");

  if (startDate > endDate) {
    result.innerHTML = `
      <div class="recurring-preview-box">
        <h3>Invalid Date Range</h3>
        <p>The end date must be later than the start date.</p>
      </div>
    `;
    return;
  }

  if (startTime >= endTime) {
    result.innerHTML = `
      <div class="recurring-preview-box">
        <h3>Invalid Time</h3>
        <p>The end time must be later than the start time.</p>
      </div>
    `;
    return;
  }

  const recurringId = "RB-FS-" + Math.floor(Math.random() * 900 + 100);

  result.innerHTML = `
    <div class="recurring-preview-box">
      <h3>Recurring Booking Submitted</h3>
      <p>
        <strong>Request ID:</strong> ${recurringId}<br>
        <strong>Resource:</strong> ${resource}<br>
        <strong>Repeat Type:</strong> ${repeatType}<br>
        <strong>Day:</strong> ${repeatDay}<br>
        <strong>Date Range:</strong> ${formatDate(startDate)} - ${formatDate(endDate)}<br>
        <strong>Time:</strong> ${startTime} - ${endTime}<br>
        <strong>Purpose:</strong> ${purpose}<br>
        <strong>Status:</strong> Pending Approval<br>
        <strong>Special Requirements:</strong> ${requirements || "None"}
      </p>
    </div>
  `;

  addNotification(
    "Recurring Booking Submitted",
    `${recurringId} for ${resource} is waiting for approval.`,
    "warning"
  );

  alert("Recurring booking request submitted for approval.");
}

function clearRecurringForm() {
  document.getElementById("recurringForm").reset();

  document.getElementById("recurringResult").innerHTML =
    "<p>Submit the recurring booking form to preview the repeated schedule request.</p>";
}

function notificationIcon(type) {
  if (type === "success") return "✓";
  if (type === "warning") return "!";
  if (type === "danger") return "×";
  return "i";
}

function notificationClass(type) {
  if (type === "success") return "notify-success";
  if (type === "warning") return "notify-warning";
  if (type === "danger") return "notify-danger";
  return "notify-info";
}

function updateNotificationDot() {
  const dot = document.querySelector(".notification-dot");
  const unreadCount = notifications.filter(notification => !notification.read).length;

  if (!dot) return;

  if (unreadCount > 0) {
    dot.style.display = "block";
  } else {
    dot.style.display = "none";
  }
}

function renderNotifications() {
  const list = document.getElementById("notificationList");

  if (!list) {
    updateNotificationDot();
    return;
  }

  list.innerHTML = "";

  if (notifications.length === 0) {
    list.innerHTML = "<p>No notifications available.</p>";
    updateNotificationDot();
    return;
  }

  notifications.forEach(notification => {
    const readClass = notification.read ? "notification-read" : "notification-unread";

    list.innerHTML += `
      <div class="notification-item ${readClass}">
        <div class="notification-icon ${notificationClass(notification.type)}">
          ${notificationIcon(notification.type)}
        </div>

        <div class="notification-content">
          <h3>${notification.title}</h3>
          <p>${notification.message}</p>
          <span class="notification-time">${notification.time}</span>
        </div>
      </div>
    `;
  });

  updateNotificationDot();
}

function addNotification(title, message, type) {
  notifications.unshift({
    title: title,
    message: message,
    type: type,
    time: "Just now",
    read: false
  });

  renderNotifications();
  updateDashboardCounts();
  updateNotificationDot();
}

function markAllNotificationsRead() {
  notifications.forEach(notification => {
    notification.read = true;
  });

  renderNotifications();
  updateDashboardCounts();
  updateNotificationDot();

  alert("All notifications marked as read.");
}

displayResources(resources);
refreshTables();
loadQRBookingOptions();
renderNotifications();
updateNotificationDot();