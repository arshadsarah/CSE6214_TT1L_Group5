let resources = [];
let bookings = [];
let notifications = [];

/* =======================
   PAGE NAVIGATION
======================= */
function showPage(pageId, button) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active-page"));
  document.querySelectorAll(".menu-btn").forEach(b => b.classList.remove("active"));

  document.getElementById(pageId).classList.add("active-page");
  if (button) button.classList.add("active");

  if (pageId === "notifications") {
    loadNotificationsFromDatabase();
  }

  window.scrollTo(0, 0);
}

function showPageById(pageId) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active-page"));
  document.querySelectorAll(".menu-btn").forEach(b => b.classList.remove("active"));

  document.getElementById(pageId).classList.add("active-page");
  window.scrollTo(0, 0);
}

/* =======================
   RESOURCE LOADING
======================= */
function loadResourcesFromDatabase() {
  fetch("get_resources_rm.php")
    .then(res => res.json())
    .then(data => {
      if (!data.success) return;

      resources = data.resources.map(r => ({
        id: "R" + r.resourceID,
        databaseId: r.resourceID,
        name: r.name,
        type: r.type,
        location: r.location,
        capacity: Number(r.capacity),
        facilities: r.facilities,
        status: r.status,
        approval: r.approvalRequired === "Yes"
          ? "Approval required"
          : "No approval required"
      }));

      displayResources(resources);
      loadResourceOptions();
    });
}

/* =======================
   DISPLAY RESOURCES
======================= */
function displayResources(list) {
  const container = document.getElementById("resourceList");
  const count = document.getElementById("resultCount");

  if (!container) return;

  container.innerHTML = "";
  if (count) count.textContent = list.length + " resources";

  list.forEach(r => {
    container.innerHTML += `
      <div class="resource-card">
        <h3>${r.name}</h3>
        <p>${r.type} | ${r.location}</p>
        <p>Status: ${r.status}</p>

        <button onclick="viewResourceDetails('${r.id}')">
          View Details
        </button>
      </div>
    `;
  });
}

/* =======================
   RESOURCE DETAILS
======================= */
function viewResourceDetails(id) {
  const r = resources.find(x => x.id === id);
  if (!r) return;

  document.getElementById("resourceDetails").innerHTML = `
    <h3>${r.name}</h3>
    <p>
      Type: ${r.type}<br>
      Location: ${r.location}<br>
      Capacity: ${r.capacity}<br>
      Facilities: ${r.facilities}<br>
      Status: ${r.status}<br>
      Approval: ${r.approval}
    </p>
  `;
}

/* =======================
   APPROVAL SYSTEM
======================= */
function loadPendingBookings() {
  fetch("get_pending_bookings_rm.php")
    .then(res => res.json())
    .then(data => {
      if (!data.success) return;

      const table = document.getElementById("approvalTable");
      if (!table) return;

      table.innerHTML = "";

      data.bookings.forEach(b => {
        table.innerHTML += `
          <tr>
            <td>${b.bookingID}</td>
            <td>${b.applicantName}</td>
            <td>${b.resourceName}</td>
            <td>${b.bookingDate}</td>
            <td>${b.startTime} - ${b.endTime}</td>
            <td>${b.status}</td>
            <td>
              <button onclick="openApproval(${b.bookingID})">
                Review
              </button>
            </td>
          </tr>
        `;
      });
    });
}

/* =======================
   NOTIFICATIONS
======================= */
function loadNotificationsFromDatabase() {
  fetch("get_notifications_rm.php?userID=1")
    .then(res => res.json())
    .then(data => {
      if (!data.success) return;

      notifications = data.notifications || [];
      renderNotifications();
    });
}

function renderNotifications() {
  const list = document.getElementById("notificationList");
  if (!list) return;

  list.innerHTML = "";

  notifications.forEach(n => {
    list.innerHTML += `
      <div class="notification-item">
        <p>${n.message}</p>
        <small>${n.dateCreated}</small>
      </div>
    `;
  });
}

function markAllNotificationsRead() {
  fetch("mark_notifications_read_rm.php", {
    method: "POST",
    body: new FormData()
  }).then(() => loadNotificationsFromDatabase());
}

/* =======================
   UTIL
======================= */
function formatDate(dateText) {
  return new Date(dateText).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function loadResourceOptions() {
  const updateSelect = document.getElementById("updateResourceSelect");
  const availabilitySelect = document.getElementById("availabilityResource");

  if (updateSelect) {
    updateSelect.innerHTML = '<option value="">Select Resource</option>';

    resources.forEach(r => {
      updateSelect.innerHTML += `
        <option value="${r.databaseId}">
          ${r.name}
        </option>
      `;
    });
  }

  if (availabilitySelect) {
    availabilitySelect.innerHTML = '<option value="">Select Resource</option>';

    resources.forEach(r => {
      availabilitySelect.innerHTML += `
        <option value="${r.databaseId}">
          ${r.name}
        </option>
      `;
    });
  }
}

function openApproval(bookingID) {
  alert("Open approval panel for Booking ID: " + bookingID);
}

function approveBooking() {
  const bookingID = document.getElementById("approvalBookingId").value;

  const formData = new FormData();
  formData.append("bookingID", bookingID);

  fetch("approve_booking_rm.php", {
    method: "POST",
    body: formData
  })
  .then(res => res.json())
  .then(data => {
    alert(data.message);
    loadPendingBookings();
  });
}

function rejectBooking() {
  const bookingID = document.getElementById("approvalBookingId").value;

  const formData = new FormData();
  formData.append("bookingID", bookingID);

  fetch("reject_booking_rm.php", {
    method: "POST",
    body: formData
  })
  .then(res => res.json())
  .then(data => {
    alert(data.message);
    loadPendingBookings();
  });
}

function openApproval(id) {
  document.getElementById("approvalBookingId").value = id;
  document.getElementById("approvalPanel").classList.remove("hidden");
}

/* =======================
   INIT
======================= */
loadResourcesFromDatabase();
loadPendingBookings();