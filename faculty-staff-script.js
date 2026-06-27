let resources = [
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

let bookings = [];
let notifications = [];

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
    loadNotificationsFromDatabase();
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
    loadNotificationsFromDatabase();
  }

  window.scrollTo(0, 0);
}

function statusClass(status) {
  const cleanStatus = status.trim().toLowerCase();

  if (cleanStatus === "confirmed") return "confirmed";
  if (cleanStatus === "pending approval") return "pending";
  if (cleanStatus === "cancelled") return "cancelled";
  if (cleanStatus === "rejected") return "cancelled";

  return "pending";
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

  if (activeBookings.length === 0) {
    table.innerHTML = `
      <tr>
        <td colspan="6">No bookings found.</td>
      </tr>
    `;
    return;
  }

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

  if (bookings.length === 0) {
    table.innerHTML = `
      <tr>
        <td colspan="7">No bookings found.</td>
      </tr>
    `;
    return;
  }

  bookings.forEach(booking => {
    table.innerHTML += `
      <tr>
        <td>${booking.id}</td>
        <td>
          ${booking.resource}<br>
          <small>${booking.bookingType}</small>
        </td>
        <td>
          ${formatDate(booking.date)}
          ${booking.isRecurring ? `<br><small>Until ${formatDate(booking.endDate)}</small>` : ""}
        </td>
        <td>${booking.startTime} - ${booking.endTime}</td>
        <td>${booking.purpose}</td>
        <td>
          <span class="status ${statusClass(booking.status)}">${booking.status}</span>
        </td>
        <td>
          <div class="booking-action-buttons">
            <button class="table-btn" onclick="viewBooking('${booking.id}')">View</button>
            ${
              booking.isRecurring
                ? `
                  <button class="table-btn locked-policy">Recurring</button>
                  <button class="table-btn" onclick="openCancelBooking('${booking.id}')">Cancel</button>
                `
                : `
                  <button class="table-btn" onclick="openEditBooking('${booking.id}')">Modify</button>
                  <button class="table-btn" onclick="openCancelBooking('${booking.id}')">Cancel</button>
                `
            }
          </div>
        </td>
      </tr>
    `;
  });
}

function updateDashboardCounts() {
  const upcoming = bookings.filter(booking => booking.status.trim() === "Confirmed").length;
  const pending = bookings.filter(booking => booking.status.trim() === "Pending Approval").length;
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
}

function viewBooking(bookingId) {
  const booking = bookings.find(item => item.id === bookingId);
  const modal = document.getElementById("bookingModal");
  const details = document.getElementById("bookingDetails");

  if (!booking) return;

  if (booking.isRecurring) {
    details.innerHTML = `
      <strong>Request ID:</strong> ${booking.id}<br>
      <strong>Booking Type:</strong> Recurring Booking<br>
      <strong>Resource:</strong> ${booking.resource}<br>
      <strong>Repeat Type:</strong> ${booking.repeatType}<br>
      <strong>Repeat Day:</strong> ${booking.repeatDay}<br>
      <strong>Date Range:</strong> ${formatDate(booking.date)} - ${formatDate(booking.endDate)}<br>
      <strong>Time:</strong> ${booking.startTime} - ${booking.endTime}<br>
      <strong>Purpose:</strong> ${booking.purpose}<br>
      <strong>Status:</strong> ${booking.status}<br>
      <strong>Requirements:</strong> ${booking.requirements || "None"}<br>
      <strong>QR Code:</strong> Not available until recurring request is approved
    `;
  } else {
    details.innerHTML = `
      <strong>Booking ID:</strong> ${booking.id}<br>
      <strong>Booking Type:</strong> Normal Booking<br>
      <strong>Resource:</strong> ${booking.resource}<br>
      <strong>Date:</strong> ${formatDate(booking.date)}<br>
      <strong>Time:</strong> ${booking.startTime} - ${booking.endTime}<br>
      <strong>Purpose:</strong> ${booking.purpose}<br>
      <strong>Attendees:</strong> ${booking.attendees}<br>
      <strong>Status:</strong> ${booking.status}<br>
      <strong>Requirements:</strong> ${booking.requirements || "None"}<br>
      <strong>QR Code:</strong> ${booking.qrCode || "Not generated yet"}<br>
      <strong>Check-in Status:</strong> ${booking.checkInStatus || "Not checked-in"}
    `;
  }

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

function loadResourcesFromDatabase() {
  fetch("get_resource.php")
    .then(response => response.json())
    .then(data => {
      if (data.success === true) {
        resources = data.resources.map(item => ({
          id: "R" + item.resourceID,
          databaseId: item.resourceID,
          name: item.name,
          type: item.type,
          location: item.location,
          capacity: Number(item.capacity),
          facilities: item.facilities,
          status: item.status,
          approval: item.approvalRequired === "Yes" ? "Approval required" : "No approval required"
        }));

        displayResources(resources);
        loadResourceOptions();
      } else {
        console.error(data.message);
        displayResources(resources);
        loadResourceOptions();
      }
    })
    .catch(error => {
      console.error("Resource loading error:", error);
      displayResources(resources);
      loadResourceOptions();
    });
}

function loadBookingsFromDatabase() {
  Promise.all([
    fetch("get_bookings.php?userID=1").then(response => response.json()),
    fetch("get_recurring_bookings.php?userID=1").then(response => response.json())
  ])
    .then(([normalData, recurringData]) => {
      let normalBookings = [];
      let recurringBookings = [];

      if (normalData.success === true) {
        normalBookings = normalData.bookings.map(item => ({
          id: "BK-FS-" + item.bookingID,
          databaseId: item.bookingID,
          bookingType: "Normal Booking",
          resourceID: item.resourceID,
          resource: item.resourceName,
          date: item.bookingDate,
          startTime: item.startTime.substring(0, 5),
          endTime: item.endTime.substring(0, 5),
          purpose: item.purpose,
          attendees: item.attendees,
          requirements: item.requirements,
          status: item.status,
          qrCode: item.qrCode,
          checkInStatus: item.checkInStatus,
          cancellationReason: item.cancellationReason,
          isRecurring: false
        }));
      }

      if (recurringData.success === true) {
        recurringBookings = recurringData.recurringBookings.map(item => ({
          id: "RB-FS-" + item.recurringID,
          databaseId: item.recurringID,
          bookingType: "Recurring Booking",
          resourceID: item.resourceID,
          resource: item.resourceName,
          date: item.startDate,
          endDate: item.endDate,
          repeatType: item.repeatType,
          repeatDay: item.repeatDay,
          startTime: item.startTime.substring(0, 5),
          endTime: item.endTime.substring(0, 5),
          purpose: item.purpose,
          attendees: "-",
          requirements: item.requirements,
          status: item.status,
          qrCode: null,
          checkInStatus: "Not available for recurring request",
          cancellationReason: "",
          isRecurring: true
        }));
      }

      bookings = [...normalBookings, ...recurringBookings];

      bookings.sort((a, b) => new Date(a.date) - new Date(b.date));

      console.log("All bookings loaded:", bookings);

      refreshTables();
    })
    .catch(error => {
      console.error("Booking loading error:", error);
    });
}

function loadResourceOptions() {
  const bookingResource = document.getElementById("bookingResource");
  const editResource = document.getElementById("editResource");
  const recurringResource = document.getElementById("recurringResource");

  const selects = [bookingResource, editResource, recurringResource];

  selects.forEach(select => {
    if (!select) return;

    select.innerHTML = `<option value="">Select resource</option>`;

    resources.forEach(resource => {
      select.innerHTML += `
        <option value="${resource.name}">${resource.name}</option>
      `;
    });
  });
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

  if (!resource || !details) return;

  details.innerHTML = `
    <div class="details-box">
      <h3>${resource.name}</h3>
      <p>
        <strong>Resource ID:</strong> ${resource.id}<br>
        <strong>Database Resource ID:</strong> ${resource.databaseId}<br>
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

  if (!resource || !details) return;

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

  if (!resource) return;

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

  const selectedResource = resources.find(resource => resource.name === resourceName);

  if (!selectedResource) {
    result.innerHTML = `
      <div class="result-box">
        <h3>Booking Failed</h3>
        <p>Please select a valid resource.</p>
      </div>
    `;
    return;
  }

  if (startTime >= endTime) {
    result.innerHTML = `
      <div class="result-box">
        <h3>Invalid Time</h3>
        <p>End time must be later than start time.</p>
      </div>
    `;
    return;
  }

  const formData = new FormData();
  formData.append("userID", "1");
  formData.append("resourceID", selectedResource.databaseId);
  formData.append("bookingDate", bookingDate);
  formData.append("startTime", startTime);
  formData.append("endTime", endTime);
  formData.append("purpose", purpose);
  formData.append("attendees", attendees);
  formData.append("requirements", requirements);

  fetch("create_booking.php", {
    method: "POST",
    body: formData
  })
    .then(response => response.json())
    .then(data => {
      if (data.success === true) {
        result.innerHTML = `
          <div class="result-box ${data.status === "Confirmed" ? "success-result" : "pending-result"}">
            <h3>${data.status === "Confirmed" ? "Booking Confirmed" : "Booking Submitted for Approval"}</h3>
            <p>
              <strong>Booking Type:</strong> Normal Booking<br>
              <strong>Booking ID:</strong> BK-FS-${data.bookingID}<br>
              <strong>Resource:</strong> ${data.resourceName}<br>
              <strong>Date:</strong> ${formatDate(bookingDate)}<br>
              <strong>Time:</strong> ${startTime} - ${endTime}<br>
              <strong>Purpose:</strong> ${purpose}<br>
              <strong>Attendees:</strong> ${attendees}<br>
              <strong>Status:</strong> ${data.status}<br>
              <strong>Special Requirements:</strong> ${requirements || "None"}<br>
              <strong>QR Code:</strong> ${data.qrCode || "Will be generated after approval"}
            </p>
          </div>
        `;

        alert(data.message);

        loadBookingsFromDatabase();
        loadNotificationsFromDatabase();
      } else {
        result.innerHTML = `
          <div class="result-box">
            <h3>Booking Failed</h3>
            <p>${data.message}</p>
          </div>
        `;
      }
    })
    .catch(error => {
      console.error("Booking error:", error);

      result.innerHTML = `
        <div class="result-box">
          <h3>Booking Error</h3>
          <p>Something went wrong while creating the booking.</p>
        </div>
      `;
    });
}

function clearBookingForm() {
  document.getElementById("bookingForm").reset();

  document.getElementById("bookingResult").innerHTML =
    "<p>Submit the form to see booking confirmation or pending approval status.</p>";
}

function isWithinPolicyPeriod(bookingDate, startTime) {
  const bookingDateTime = new Date(`${bookingDate}T${startTime}`);
  const now = new Date();

  const differenceInMs = bookingDateTime - now;
  const differenceInHours = differenceInMs / (1000 * 60 * 60);

  return differenceInHours >= 24;
}

function showPolicyModal(actionType) {
  const modal = document.getElementById("policyModal");
  const message = document.getElementById("policyMessage");

  if (!modal || !message) return;

  message.textContent = `This booking cannot be ${actionType} because it is less than 24 hours before the booking start time.`;

  modal.style.display = "flex";
}

function closePolicyModal() {
  const modal = document.getElementById("policyModal");

  if (!modal) return;

  modal.style.display = "none";
}

function openEditBooking(bookingId) {
  const booking = bookings.find(item => item.id === bookingId);

  if (!booking) return;

  if (booking.isRecurring) {
    alert("Recurring booking requests cannot be modified here.");
    return;
  }

  if (booking.status === "Cancelled") {
    alert("Cancelled bookings cannot be modified.");
    return;
  }

  if (!isWithinPolicyPeriod(booking.date, booking.startTime)) {
    showPolicyModal("modified");
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

  const bookingIdText = document.getElementById("editBookingId").value;
  const booking = bookings.find(item => item.id === bookingIdText);

  if (!booking) return;

  const resourceName = document.getElementById("editResource").value;
  const selectedResource = resources.find(resource => resource.name === resourceName);

  if (!selectedResource) {
    alert("Please select a valid resource.");
    return;
  }

  const newDate = document.getElementById("editDate").value;
  const newStartTime = document.getElementById("editStartTime").value;
  const newEndTime = document.getElementById("editEndTime").value;
  const newPurpose = document.getElementById("editPurpose").value;
  const newAttendees = document.getElementById("editAttendees").value;

  if (newStartTime >= newEndTime) {
    alert("End time must be later than start time.");
    return;
  }

  const formData = new FormData();
  formData.append("bookingID", booking.databaseId);
  formData.append("resourceID", selectedResource.databaseId);
  formData.append("bookingDate", newDate);
  formData.append("startTime", newStartTime);
  formData.append("endTime", newEndTime);
  formData.append("purpose", newPurpose);
  formData.append("attendees", newAttendees);

  fetch("update_booking.php", {
    method: "POST",
    body: formData
  })
    .then(response => response.json())
    .then(data => {
      if (data.success === true) {
        alert(data.message);

        closeEditPanel();
        loadBookingsFromDatabase();
        loadNotificationsFromDatabase();
      } else {
        showPolicyModal("modified");
        document.getElementById("policyMessage").textContent = data.message;
      }
    })
    .catch(error => {
      console.error("Update booking error:", error);
      alert("Something went wrong while updating the booking.");
    });
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

  if (!isWithinPolicyPeriod(booking.date, booking.startTime)) {
    showPolicyModal("cancelled");
    return;
  }

  document.getElementById("editBookingPanel").classList.add("hidden");
  document.getElementById("cancelBookingPanel").classList.remove("hidden");

  document.getElementById("cancelBookingId").value = bookingId;
  document.getElementById("cancelReason").value = "";

  document.getElementById("cancelBookingPanel").scrollIntoView({ behavior: "smooth" });
}

function confirmCancelBooking() {
  const bookingIdText = document.getElementById("cancelBookingId").value;
  const reason = document.getElementById("cancelReason").value.trim();
  const booking = bookings.find(item => item.id === bookingIdText);

  if (reason === "") {
    alert("Please enter a cancellation reason.");
    return;
  }

  if (!booking) return;

  const formData = new FormData();
  let phpFile = "";

  if (booking.isRecurring) {
    phpFile = "cancel_recurring_booking.php";
    formData.append("recurringID", booking.databaseId);
    formData.append("reason", reason);
  } else {
    phpFile = "cancel_booking.php";
    formData.append("bookingID", booking.databaseId);
    formData.append("reason", reason);
  }

  fetch(phpFile, {
    method: "POST",
    body: formData
  })
    .then(response => response.json())
    .then(data => {
      if (data.success === true) {
        alert(data.message);

        closeCancelPanel();
        loadBookingsFromDatabase();
        loadNotificationsFromDatabase();
      } else {
        showPolicyModal("cancelled");
        document.getElementById("policyMessage").textContent = data.message;
      }
    })
    .catch(error => {
      console.error("Cancel booking error:", error);
      alert("Something went wrong while cancelling the booking.");
    });
}

function closeCancelPanel() {
  document.getElementById("cancelBookingPanel").classList.add("hidden");
}

function loadQRBookingOptions() {
  const select = document.getElementById("qrBookingSelect");

  if (!select) return;

  select.innerHTML = `<option value="">Select confirmed booking</option>`;

  const confirmedBookings = bookings.filter(booking =>
    !booking.isRecurring &&
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

  if (!booking) return;

  if (!booking.qrCode) {
    display.innerHTML = `
      <div class="qr-card">
        <h3>QR Code Not Available</h3>
        <p>This booking does not have a QR code yet.</p>
      </div>
    `;
    return;
  }

  const verificationUrl =
    window.location.origin +
    "/crbs/scan_qr.php?code=" +
    encodeURIComponent(booking.qrCode);

  const qrImageUrl =
    "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" +
    encodeURIComponent(verificationUrl);

  display.innerHTML = `
    <div class="qr-card">
      <h3>${booking.resource}</h3>
      <p>
        <strong>Booking ID:</strong> ${booking.id}<br>
        <strong>Booking Type:</strong> ${booking.bookingType || "Normal Booking"}<br>
        <strong>Date:</strong> ${formatDate(booking.date)}<br>
        <strong>Time:</strong> ${booking.startTime} - ${booking.endTime}
      </p>

      <img src="${qrImageUrl}" alt="QR Code" class="real-qr-image">

      <span class="qr-code-label">QR Link: ${verificationUrl}</span>

      <p style="margin-top: 12px;">
        Scan this QR using a QR scanner app. You can also copy the QR code text from My Bookings details.
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
  const qrCode = document.getElementById("qrCodeInput").value.trim();
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

  const formData = new FormData();
  formData.append("qrCode", qrCode);

  fetch("verify_qr.php", {
    method: "POST",
    body: formData
  })
    .then(response => response.json())
    .then(data => {
      if (data.success === true) {
        result.innerHTML = `
          <div class="qr-result-box qr-success">
            <h3>Checked In Successfully</h3>
            <p>
              ${data.message}<br>
              <strong>Booking ID:</strong> BK-FS-${data.bookingID}<br>
              <strong>Booking Type:</strong> Normal Booking<br>
              <strong>Resource:</strong> ${data.resourceName}<br>
              <strong>Date:</strong> ${formatDate(data.date)}<br>
              <strong>Time:</strong> ${data.startTime.substring(0, 5)} - ${data.endTime.substring(0, 5)}
            </p>
          </div>
        `;

        loadBookingsFromDatabase();
        loadNotificationsFromDatabase();
      } else {
        let boxClass = "qr-error";
        let title = "Verification Failed";

        if (data.type === "wrong_time" || data.type === "wrong_date") {
          boxClass = "qr-warning";
          title = "Invalid Check-In Time";
        }

        if (data.type === "already_checked_in") {
          boxClass = "qr-warning";
          title = "Already Checked In";
        }

        if (data.type === "invalid") {
          boxClass = "qr-error";
          title = "Invalid QR Code";
        }

        if (data.type === "not_confirmed") {
          boxClass = "qr-warning";
          title = "Booking Not Confirmed";
        }

        result.innerHTML = `
          <div class="qr-result-box ${boxClass}">
            <h3>${title}</h3>
            <p>${data.message}</p>
          </div>
        `;
      }
    })
    .catch(error => {
      console.error("QR verification error:", error);

      result.innerHTML = `
        <div class="qr-result-box qr-error">
          <h3>Verification Error</h3>
          <p>Something went wrong while verifying the QR code.</p>
        </div>
      `;
    });
}

function clearQRResult() {
  document.getElementById("qrCodeInput").value = "";
  document.getElementById("qrResult").innerHTML =
    "<p>Verification result will appear here.</p>";
}

function submitRecurringBooking(event) {
  event.preventDefault();

  const resourceName = document.getElementById("recurringResource").value;
  const repeatType = document.getElementById("repeatType").value;
  const repeatDay = document.getElementById("repeatDay").value;
  const startDate = document.getElementById("recurringStartDate").value;
  const endDate = document.getElementById("recurringEndDate").value;
  const startTime = document.getElementById("recurringStartTime").value;
  const endTime = document.getElementById("recurringEndTime").value;
  const purpose = document.getElementById("recurringPurpose").value;
  const requirements = document.getElementById("recurringRequirements").value.trim();
  const result = document.getElementById("recurringResult");

  const selectedResource = resources.find(resource => resource.name === resourceName);

  if (!selectedResource) {
    result.innerHTML = `
      <div class="recurring-preview-box">
        <h3>Recurring Booking Failed</h3>
        <p>Please select a valid resource.</p>
      </div>
    `;
    return;
  }

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

  const formData = new FormData();
  formData.append("userID", "1");
  formData.append("resourceID", selectedResource.databaseId);
  formData.append("repeatType", repeatType);
  formData.append("repeatDay", repeatDay);
  formData.append("startDate", startDate);
  formData.append("endDate", endDate);
  formData.append("startTime", startTime);
  formData.append("endTime", endTime);
  formData.append("purpose", purpose);
  formData.append("requirements", requirements);

  fetch("create_recurring_booking.php", {
    method: "POST",
    body: formData
  })
    .then(response => response.json())
    .then(data => {
      if (data.success === true) {
        result.innerHTML = `
          <div class="recurring-preview-box">
            <h3>Recurring Booking Submitted</h3>
            <p>
              <strong>Booking Type:</strong> Recurring Booking<br>
              <strong>Request ID:</strong> RB-FS-${data.recurringID}<br>
              <strong>Resource:</strong> ${data.resourceName}<br>
              <strong>Repeat Type:</strong> ${repeatType}<br>
              <strong>Day:</strong> ${repeatDay}<br>
              <strong>Date Range:</strong> ${formatDate(startDate)} - ${formatDate(endDate)}<br>
              <strong>Time:</strong> ${startTime} - ${endTime}<br>
              <strong>Purpose:</strong> ${purpose}<br>
              <strong>Status:</strong> ${data.status}<br>
              <strong>Special Requirements:</strong> ${requirements || "None"}
            </p>
          </div>
        `;

        alert(data.message);

        loadBookingsFromDatabase();
        loadNotificationsFromDatabase();
      } else {
        result.innerHTML = `
          <div class="recurring-preview-box">
            <h3>Recurring Booking Failed</h3>
            <p>${data.message}</p>
          </div>
        `;
      }
    })
    .catch(error => {
      console.error("Recurring booking error:", error);

      result.innerHTML = `
        <div class="recurring-preview-box">
          <h3>Recurring Booking Error</h3>
          <p>Something went wrong while submitting the recurring booking.</p>
        </div>
      `;
    });
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

  dot.style.display = unreadCount > 0 ? "block" : "none";
}

function loadNotificationsFromDatabase() {
  fetch("get_notifications.php?userID=1")
    .then(response => response.json())
    .then(data => {
      if (data.success === true) {
        notifications = data.notifications.map(item => ({
          id: item.notificationID,
          title:
            item.type === "success"
              ? "Booking Confirmed"
              : item.type === "warning"
              ? "Pending Approval"
              : item.type === "danger"
              ? "Booking Cancelled"
              : "Booking Update",
          message: item.message,
          type: item.type,
          time: item.dateCreated,
          read: item.status === "Read"
        }));

        renderNotifications();
        updateDashboardCounts();
        updateNotificationDot();
      } else {
        console.error(data.message);
      }
    })
    .catch(error => {
      console.error("Notification loading error:", error);
    });
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

function markAllNotificationsRead() {
  const formData = new FormData();
  formData.append("userID", "1");

  fetch("mark_notifications_read.php", {
    method: "POST",
    body: formData
  })
    .then(response => response.json())
    .then(data => {
      if (data.success === true) {
        alert(data.message);
        loadNotificationsFromDatabase();
      } else {
        alert(data.message);
      }
    })
    .catch(error => {
      console.error("Mark notifications read error:", error);
      alert("Something went wrong while marking notifications as read.");
    });
}

loadResourcesFromDatabase();
loadBookingsFromDatabase();
loadNotificationsFromDatabase();
