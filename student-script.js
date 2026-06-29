let resources = [
  {
    id: "R001",
    name: "Discussion Room A",
    type: "Room",
    location: "Library",
    capacity: 8,
    features: "Whiteboard, WiFi, HDMI",
    status: "Available"
  },
  {
    id: "R002",
    name: "Computer Lab 2",
    type: "Lab",
    location: "Faculty Block",
    capacity: 35,
    features: "Projector, PC, WiFi",
    status: "Available"
  },
  {
    id: "R003",
    name: "Projector Set",
    type: "Equipment",
    location: "AV Office",
    capacity: 1,
    features: "HDMI, VGA, Remote Control",
    status: "Available"
  },
  {
    id: "R004",
    name: "Meeting Room B",
    type: "Room",
    location: "Admin Building",
    capacity: 12,
    features: "TV Display, WiFi, Whiteboard",
    status: "Maintenance"
  }
];

let bookings = [];

let notifications = [];

document.addEventListener("DOMContentLoaded", function () {
  loadDashboard();
  loadResources(resources);
  loadBookingResourceOptions();
  loadBookingHistory();
  loadQROptions();
  loadNotifications();
});

function showSection(sectionId) {
  const pages = document.querySelectorAll(".page");
  const buttons = document.querySelectorAll(".nav-btn");

  pages.forEach(page => page.classList.remove("active-page"));
  buttons.forEach(button => button.classList.remove("active"));

  document.getElementById(sectionId).classList.add("active-page");

  buttons.forEach(button => {
    const buttonText = button.textContent.trim().toLowerCase();

    if (
      (sectionId === "dashboard" && buttonText.includes("dashboard")) ||
      (sectionId === "search" && buttonText.includes("search")) ||
      (sectionId === "book" && buttonText.includes("book resource")) ||
      (sectionId === "history" && buttonText.includes("history")) ||
      (sectionId === "qr" && buttonText.includes("qr")) ||
      (sectionId === "notifications" && buttonText.includes("notifications"))
    ) {
      button.classList.add("active");
    }
  });

  if (sectionId === "history") {
    loadBookingHistory();
  }

  if (sectionId === "qr") {
    loadQROptions();
  }

  if (sectionId === "notifications") {
    loadNotifications();
  }

  window.scrollTo(0, 0);
}

function loadDashboard() {
  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter(booking => booking.status === "Confirmed").length;
  const cancelledBookings = bookings.filter(booking => booking.status === "Cancelled").length;
  const verifiedBookings = bookings.filter(booking => booking.checkInStatus === "Verified").length;

  document.getElementById("totalBookings").textContent = totalBookings;
  document.getElementById("confirmedBookings").textContent = confirmedBookings;
  document.getElementById("cancelledBookings").textContent = cancelledBookings;
  document.getElementById("verifiedBookings").textContent = verifiedBookings;

  const recentBookingTable = document.getElementById("recentBookingTable");
  recentBookingTable.innerHTML = "";

  if (bookings.length === 0) {
    recentBookingTable.innerHTML = `
      <tr>
        <td colspan="6">No recent bookings found.</td>
      </tr>
    `;
    return;
  }

  bookings.slice(0, 5).forEach(booking => {
    recentBookingTable.innerHTML += `
      <tr>
        <td>${booking.id}</td>
        <td>${booking.resourceName}</td>
        <td>${formatDate(booking.date)}</td>
        <td>${booking.startTime} - ${booking.endTime}</td>
        <td><span class="badge ${getStatusClass(booking.status)}">${booking.status}</span></td>
        <td>${booking.checkInStatus}</td>
      </tr>
    `;
  });
}

/* RESOURCE SEARCH */
function loadResources(resourceListData) {
  const resourceList = document.getElementById("resourceList");
  const resourceCount = document.getElementById("resourceCount");

  resourceList.innerHTML = "";
  resourceCount.textContent = `${resourceListData.length} resources`;

  if (resourceListData.length === 0) {
    resourceList.innerHTML = `<p>No matching resources found.</p>`;
    return;
  }

  resourceListData.forEach(resource => {
    const statusClass = resource.status === "Available" ? "available-badge" : "unavailable-badge";

    resourceList.innerHTML += `
      <div class="resource-card">
        <div>
          <div class="resource-card-header">
            <h3>${resource.name}</h3>
            <span class="resource-type">${resource.type}</span>
          </div>

          <div class="resource-info">
            <p><strong>Resource ID:</strong> ${resource.id}</p>
            <p><strong>Location:</strong> ${resource.location}</p>
            <p><strong>Capacity:</strong> ${resource.capacity}</p>
            <p><strong>Features:</strong> ${resource.features}</p>
          </div>
        </div>

        <div class="resource-actions">
          <span class="${statusClass}">${resource.status}</span>
          <button type="button" onclick="viewResourceDetails('${resource.id}')">View Details</button>
          <button type="button" onclick="selectResourceForBooking('${resource.id}')">Book</button>
        </div>
      </div>
    `;
  });
}

function searchResources() {
  const type = document.getElementById("searchType").value;
  const location = document.getElementById("searchLocation").value;
  const capacity = Number(document.getElementById("searchCapacity").value) || 0;
  const feature = document.getElementById("searchFeature").value.trim().toLowerCase();

  const filteredResources = resources.filter(resource => {
    const matchType = type === "" || resource.type === type;
    const matchLocation = location === "" || resource.location === location;
    const matchCapacity = resource.capacity >= capacity;
    const matchFeature = feature === "" || resource.features.toLowerCase().includes(feature);

    return matchType && matchLocation && matchCapacity && matchFeature;
  });

  loadResources(filteredResources);
  document.getElementById("resourceDetails").innerHTML = "Select a resource to view its details.";
}

function resetSearch() {
  document.getElementById("searchType").value = "";
  document.getElementById("searchLocation").value = "";
  document.getElementById("searchCapacity").value = "";
  document.getElementById("searchFeature").value = "";

  loadResources(resources);
  document.getElementById("resourceDetails").innerHTML = "Select a resource to view its details.";
}

function viewResourceDetails(resourceId) {
  const resource = resources.find(item => item.id === resourceId);
  const resourceDetails = document.getElementById("resourceDetails");

  if (!resource) {
    resourceDetails.innerHTML = "Resource not found.";
    return;
  }

  const statusClass = resource.status === "Available" ? "available-badge" : "unavailable-badge";

  resourceDetails.innerHTML = `
    <div class="details-box">
      <h3>${resource.name}</h3>
      <p><strong>Resource ID:</strong> ${resource.id}</p>
      <p><strong>Type:</strong> ${resource.type}</p>
      <p><strong>Location:</strong> ${resource.location}</p>
      <p><strong>Capacity:</strong> ${resource.capacity}</p>
      <p><strong>Features:</strong> ${resource.features}</p>
      <p><strong>Status:</strong> <span class="${statusClass}">${resource.status}</span></p>
    </div>
  `;
}

function selectResourceForBooking(resourceId) {
  const resource = resources.find(item => item.id === resourceId);

  if (!resource) {
    alert("Resource not found.");
    return;
  }

  if (resource.status !== "Available") {
    alert("This resource is currently not available for booking.");
    return;
  }

  document.getElementById("bookingResource").value = resource.id;
  showSection("book");
}

/* BOOK RESOURCE */
function loadBookingResourceOptions() {
  const bookingResource = document.getElementById("bookingResource");

  bookingResource.innerHTML = `<option value="">Select resource</option>`;

  resources.forEach(resource => {
    bookingResource.innerHTML += `
      <option value="${resource.id}">
        ${resource.name}
      </option>
    `;
  });
}

function createBooking() {
  const form = document.getElementById("bookingForm");

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const resourceId = document.getElementById("bookingResource").value;
  const bookingDate = document.getElementById("bookingDate").value;
  const startTime = document.getElementById("startTime").value;
  const endTime = document.getElementById("endTime").value;
  const attendees = Number(document.getElementById("attendees").value);
  const purpose = document.getElementById("purpose").value;
  const requirement = document.getElementById("requirement").value.trim();

  const selectedResource = resources.find(resource => resource.id === resourceId);
  const bookingMessage = document.getElementById("bookingMessage");

  if (!selectedResource) {
    showMessage(bookingMessage, "Please select a valid resource.", "error");
    return;
  }

  if (selectedResource.status !== "Available") {
    showMessage(bookingMessage, "This resource is not available for booking.", "error");
    return;
  }

  if (attendees > selectedResource.capacity) {
    showMessage(bookingMessage, "Number of attendees exceeds the resource capacity.", "error");
    return;
  }

  if (startTime >= endTime) {
    showMessage(bookingMessage, "End time must be later than start time.", "error");
    return;
  }

  const conflict = bookings.find(booking =>
    booking.resourceId === resourceId &&
    booking.date === bookingDate &&
    booking.status === "Confirmed" &&
    startTime < booking.endTime &&
    endTime > booking.startTime
  );

  if (conflict) {
    showMessage(bookingMessage, "Booking conflict detected. Please choose another time.", "error");
    return;
  }

  const bookingId = generateBookingId();

  const newBooking = {
    id: bookingId,
    resourceId: selectedResource.id,
    resourceName: selectedResource.name,
    date: bookingDate,
    startTime: startTime,
    endTime: endTime,
    purpose: purpose,
    attendees: attendees,
    requirement: requirement,
    status: "Confirmed",
    checkInStatus: "Not Verified",
    qrCode: "QR-" + bookingId
  };

  bookings.push(newBooking);

  notifications.unshift({
    type: "success-note",
    title: "Booking Confirmed",
    message: `Your booking for ${selectedResource.name} on ${formatDate(bookingDate)} has been confirmed.`,
    time: "Just now"
  });

  showMessage(
    bookingMessage,
    `Booking successfully created. Booking ID: ${bookingId}. QR Code: QR-${bookingId}`,
    "success"
  );

  form.reset();

  loadDashboard();
  loadBookingHistory();
  loadQROptions();
  loadNotifications();
}

function clearBookingForm() {
  document.getElementById("bookingForm").reset();

  const bookingMessage = document.getElementById("bookingMessage");
  bookingMessage.textContent = "Booking result will appear here.";
  bookingMessage.className = "message-box";
}

/* BOOKING HISTORY */
function loadBookingHistory() {
  const bookingHistoryTable = document.getElementById("bookingHistoryTable");

  bookingHistoryTable.innerHTML = "";

  if (bookings.length === 0) {
    bookingHistoryTable.innerHTML = `
      <tr>
        <td colspan="8">No booking history found.</td>
      </tr>
    `;
    return;
  }

  bookings.forEach(booking => {
    const cancelButton = booking.status === "Confirmed"
      ? `<button type="button" class="danger-btn table-btn" onclick="cancelBooking('${booking.id}')">Cancel</button>`
      : "-";

    bookingHistoryTable.innerHTML += `
      <tr>
        <td>${booking.id}</td>
        <td>${booking.resourceName}</td>
        <td>${formatDate(booking.date)}</td>
        <td>${booking.startTime} - ${booking.endTime}</td>
        <td>${booking.purpose}</td>
        <td><span class="status ${getStatusClass(booking.status)}">${booking.status}</span></td>
        <td>${booking.checkInStatus}</td>
        <td>
          <button type="button" class="table-btn" onclick="viewBookingDetails('${booking.id}')">View</button>
          ${cancelButton}
        </td>
      </tr>
    `;
  });
}

function viewBookingDetails(bookingId) {
  const booking = bookings.find(item => item.id === bookingId);

  if (!booking) {
    alert("Booking not found.");
    return;
  }

  const modalContent = document.getElementById("modalContent");

  modalContent.innerHTML = `
    <p><strong>Booking ID:</strong> ${booking.id}</p>
    <p><strong>Resource:</strong> ${booking.resourceName}</p>
    <p><strong>Date:</strong> ${formatDate(booking.date)}</p>
    <p><strong>Time:</strong> ${booking.startTime} - ${booking.endTime}</p>
    <p><strong>Purpose:</strong> ${booking.purpose}</p>
    <p><strong>Attendees:</strong> ${booking.attendees}</p>
    <p><strong>Special Requirement:</strong> ${booking.requirement || "None"}</p>
    <p><strong>Status:</strong> ${booking.status}</p>
    <p><strong>Check-in Status:</strong> ${booking.checkInStatus}</p>
    <p><strong>QR Code:</strong> ${booking.qrCode}</p>
  `;

  document.getElementById("bookingModal").style.display = "flex";
}

function closeModal() {
  document.getElementById("bookingModal").style.display = "none";
}

function cancelBooking(bookingId) {
  const booking = bookings.find(item => item.id === bookingId);

  if (!booking) {
    alert("Booking not found.");
    return;
  }

  const confirmCancel = confirm(`Are you sure you want to cancel booking ${bookingId}?`);

  if (!confirmCancel) {
    return;
  }

  booking.status = "Cancelled";

  notifications.unshift({
    type: "warning-note",
    title: "Booking Cancelled",
    message: `Booking ${bookingId} for ${booking.resourceName} has been cancelled.`,
    time: "Just now"
  });

  loadDashboard();
  loadBookingHistory();
  loadQROptions();
  loadNotifications();
}

/* QR VERIFICATION */
function loadQROptions() {
  const qrBookingSelect = document.getElementById("qrBookingSelect");

  qrBookingSelect.innerHTML = `<option value="">Select booking</option>`;

  const confirmedBookings = bookings.filter(booking => booking.status === "Confirmed");

  if (confirmedBookings.length === 0) {
    qrBookingSelect.innerHTML += `<option value="">No confirmed booking available</option>`;
    return;
  }

  confirmedBookings.forEach(booking => {
    qrBookingSelect.innerHTML += `
      <option value="${booking.id}">
        ${booking.id} - ${booking.resourceName}
      </option>
    `;
  });
}

function generateQR() {
  const bookingId = document.getElementById("qrBookingSelect").value;
  const qrDisplay = document.getElementById("qrDisplay");

  if (!bookingId) {
    qrDisplay.innerHTML = `
      <div class="qr-result-box qr-warning">
        <h3>No Booking Selected</h3>
        <p>Please select a confirmed booking first.</p>
      </div>
    `;
    return;
  }

  const booking = bookings.find(item => item.id === bookingId);

  if (!booking) {
    qrDisplay.innerHTML = `
      <div class="qr-result-box qr-error">
        <h3>Booking Not Found</h3>
        <p>The selected booking record could not be found.</p>
      </div>
    `;
    return;
  }

  qrDisplay.innerHTML = `
    <div class="qr-card">
      <h3>${booking.resourceName}</h3>
      <p><strong>Booking ID:</strong> ${booking.id}</p>
      <p><strong>Date:</strong> ${formatDate(booking.date)}</p>
      <p><strong>Time:</strong> ${booking.startTime} - ${booking.endTime}</p>

      <div class="fake-qr"></div>

      <span class="qr-code-label">${booking.qrCode}</span>

      <p style="margin-top: 14px;">
        <strong>Instruction:</strong> Copy the QR Code Text and paste it in the Verify QR section.
      </p>
    </div>
  `;

  document.getElementById("qrInput").value = booking.qrCode;
}

function clearQR() {
  document.getElementById("qrBookingSelect").value = "";
  document.getElementById("qrDisplay").innerHTML = "QR details will appear here.";
}

function verifyQR() {
  const qrInput = document.getElementById("qrInput").value.trim();
  const qrResult = document.getElementById("qrResult");

  if (!qrInput) {
    qrResult.innerHTML = `
      <div class="qr-result-box qr-warning">
        <h3>No QR Code Entered</h3>
        <p>Please enter a QR code before verification.</p>
      </div>
    `;
    return;
  }

  const booking = bookings.find(item => item.qrCode === qrInput);

  if (!booking) {
    qrResult.innerHTML = `
      <div class="qr-result-box qr-error">
        <h3>Verification Failed</h3>
        <p>Invalid QR code. Booking record was not found.</p>
      </div>
    `;
    return;
  }

  if (booking.status !== "Confirmed") {
    qrResult.innerHTML = `
      <div class="qr-result-box qr-error">
        <h3>Verification Failed</h3>
        <p>QR cannot be verified because the booking is not confirmed.</p>
      </div>
    `;
    return;
  }

  if (booking.checkInStatus === "Verified") {
    qrResult.innerHTML = `
      <div class="qr-result-box qr-warning">
        <h3>Already Verified</h3>
        <p>This booking has already been verified.</p>
      </div>
    `;
    return;
  }

  booking.checkInStatus = "Verified";

  notifications.unshift({
    type: "success-note",
    title: "QR Verified",
    message: `QR verification completed for booking ${booking.id}.`,
    time: "Just now"
  });

  qrResult.innerHTML = `
    <div class="qr-result-box qr-success">
      <h3>Check-in Successful</h3>
      <p>QR verification successful for booking ${booking.id}.</p>
      <p><strong>Resource:</strong> ${booking.resourceName}</p>
      <p><strong>Date:</strong> ${formatDate(booking.date)}</p>
      <p><strong>Time:</strong> ${booking.startTime} - ${booking.endTime}</p>
      <p><strong>Check-in Status:</strong> Verified</p>
    </div>
  `;

  loadDashboard();
  loadBookingHistory();
  loadNotifications();
}

function clearQRResult() {
  const qrInput = document.getElementById("qrInput");
  const qrResult = document.getElementById("qrResult");

  qrInput.value = "";
  qrResult.innerHTML = `
    <div class="qr-result-box">
      <p>Verification result will appear here.</p>
    </div>
  `;
}

/* NOTIFICATIONS */
function loadNotifications() {
  const notificationList = document.getElementById("notificationList");

  notificationList.innerHTML = "";

  if (notifications.length === 0) {
    notificationList.innerHTML = "<p>No notifications found.</p>";
    return;
  }

  notifications.forEach(notification => {
    let iconClass = "notify-info";
    let iconText = "i";

    if (notification.type === "success-note") {
      iconClass = "notify-success";
      iconText = "✓";
    } else if (notification.type === "warning-note") {
      iconClass = "notify-warning";
      iconText = "!";
    } else if (notification.type === "danger-note") {
      iconClass = "notify-danger";
      iconText = "×";
    }

    notificationList.innerHTML += `
      <div class="notification-item notification-unread">
        <div class="notification-icon ${iconClass}">
          ${iconText}
        </div>

        <div class="notification-content">
          <h3>${notification.title}</h3>
          <p>${notification.message}</p>
          <span class="notification-time">${notification.time}</span>
        </div>
      </div>
    `;
  });
}

function generateBookingId() {
  const nextNumber = bookings.length + 1;
  return "B" + String(nextNumber).padStart(3, "0");
}

function formatDate(dateText) {
  if (!dateText) {
    return "-";
  }

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const parts = dateText.split("-");

  if (parts.length !== 3) {
    return dateText;
  }

  const year = parts[0];
  const month = months[Number(parts[1]) - 1];
  const day = parts[2];

  return `${day} ${month} ${year}`;
}

function getStatusClass(status) {
  const lowerStatus = status.toLowerCase();

  if (lowerStatus.includes("confirm")) {
    return "confirmed";
  }

  if (lowerStatus.includes("cancel")) {
    return "cancelled";
  }

  return "pending";
}

function showMessage(element, text, type) {
  element.textContent = text;

  if (type === "success") {
    element.className = "message-box message-success";
  } else {
    element.className = "message-box message-error";
  }
}

function logoutStudent() {
  alert("Logged out successfully.");
  window.location.href = "login.html";
}