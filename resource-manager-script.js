/* =========================================================
   RESOURCE MANAGER SCRIPT
   Campus Resource Booking System
========================================================= */

let resources = [];
let bookings = [];
let notifications = [];

/* =======================
   FILE PATHS
======================= */
const RESOURCE_API = "get_resources_rm.php";
const PENDING_BOOKINGS_API = "get_pending_bookings_rm.php";
const NOTIFICATIONS_API = "get_notifications_rm.php?userID=1";
const MARK_NOTIFICATIONS_API = "mark_notifications_read_rm.php";
const APPROVE_BOOKING_API = "approve_booking_rm.php";
const REJECT_BOOKING_API = "reject_booking_rm.php";

/* =======================
   SHORTCUT
======================= */
const $ = (id) => document.getElementById(id);

/* =======================
   PAGE NAVIGATION
======================= */
function showPage(pageId, button) {
  document.querySelectorAll(".page").forEach(page => {
    page.classList.remove("active-page");
  });

  document.querySelectorAll(".menu-btn").forEach(btn => {
    btn.classList.remove("active");
  });

  const selectedPage = $(pageId);
  if (selectedPage) {
    selectedPage.classList.add("active-page");
  }

  if (button) {
    button.classList.add("active");
  }

  if (pageId === "dashboard") {
    loadResourceOverview();
  }

  if (pageId === "notifications") {
    loadNotificationsFromDatabase();
  }

  if (pageId === "approveBooking") {
    loadPendingBookings();
  }

  window.scrollTo(0, 0);
}

function showPageById(pageId) {
  showPage(pageId, null);
}

/* =======================
   LOAD RESOURCES FROM DATABASE
======================= */
function loadResourcesFromDatabase() {
  fetch("get_resource.php")
    .then(response => response.json())
    .then(data => {
      let resourceData = [];

      /*
        Supports both formats:
        1. { success: true, resources: [...] }
        2. [...]
      */
      if (Array.isArray(data)) {
        resourceData = data;
      } else if (data.success && Array.isArray(data.resources)) {
        resourceData = data.resources;
      } else {
        console.warn("No resources returned:", data);
        resourceData = [];
      }

      resources = resourceData.map(resource => {
        const databaseId =
          resource.resourceID ||
          resource.resourceId ||
          resource.resource_id ||
          resource.id;

        return {
          id: "R" + databaseId,
          databaseId: databaseId,
          name: resource.resourceName || resource.name || resource.resource_name || "Unnamed Resource",
          type: resource.type || resource.resourceType || resource.resource_type || "-",
          location: resource.location || "-",
          capacity: Number(resource.capacity) || 0,
          facilities: resource.facilities || resource.features || "-",
          status: resource.status || resource.resourceStatus || "Active",
          availability: resource.availability || resource.availabilityStatus || "Available",
          maintenanceStatus: resource.maintenanceStatus || resource.maintenance_status || resource.maintenance || "None",
          approval: resource.approvalRequired === "Yes" ? "Approval required" : "No approval required"
        };
      });

      displayResources(resources);
      loadResourceOptions();
      loadResourceOverview();
    })
    .catch(error => {
      console.error("Error loading resources:", error);
    });
}

/* =======================
   DISPLAY RESOURCE LIST
======================= */
function displayResources(list) {
  const container = $("resourceList");
  const count = $("resultCount");

  if (!container) return;

  container.innerHTML = "";

  if (count) {
    count.textContent = list.length + " resources";
  }

  if (!list || list.length === 0) {
    container.innerHTML = "<p>No resources loaded yet.</p>";
    return;
  }

  list.forEach(resource => {
    container.innerHTML += `
      <div class="resource-card">
        <h3>${resource.name}</h3>
        <p>${resource.type} | ${resource.location}</p>
        <p>Status: ${resource.status}</p>
        <p>Availability: ${resource.availability}</p>

        <button type="button" onclick="viewResourceDetails('${resource.id}')">
          View Details
        </button>
      </div>
    `;
  });
}

/* =======================
   RESOURCE OPTIONS FOR DROPDOWNS
======================= */
function loadResourceOptions() {
  const updateSelect = $("updateResourceSelect");
  const availabilitySelect = $("availabilityResource");

  if (updateSelect) {
    updateSelect.innerHTML = '<option value="">Select Resource</option>';

    resources.forEach(resource => {
      updateSelect.innerHTML += `
        <option value="${resource.databaseId}">
          ${resource.name}
        </option>
      `;
    });
  }

  if (availabilitySelect) {
    availabilitySelect.innerHTML = '<option value="">Select Resource</option>';

    resources.forEach(resource => {
      availabilitySelect.innerHTML += `
        <option value="${resource.databaseId}">
          ${resource.name}
        </option>
      `;
    });
  }
}

/* =======================
   RESOURCE DETAILS
======================= */
function viewResourceDetails(id) {
  const resource = resources.find(item => item.id === id);

  if (!resource) return;

  const detailBox = $("resourceDetails");

  if (!detailBox) {
    alert(
      `Resource: ${resource.name}\n` +
      `Type: ${resource.type}\n` +
      `Location: ${resource.location}\n` +
      `Capacity: ${resource.capacity}\n` +
      `Status: ${resource.status}\n` +
      `Availability: ${resource.availability}`
    );
    return;
  }

  detailBox.innerHTML = `
    <h3>${resource.name}</h3>
    <p>
      <strong>Resource ID:</strong> ${resource.id}<br>
      <strong>Type:</strong> ${resource.type}<br>
      <strong>Location:</strong> ${resource.location}<br>
      <strong>Capacity:</strong> ${resource.capacity}<br>
      <strong>Facilities:</strong> ${resource.facilities}<br>
      <strong>Status:</strong> ${resource.status}<br>
      <strong>Availability:</strong> ${resource.availability}<br>
      <strong>Maintenance:</strong> ${resource.maintenanceStatus}<br>
      <strong>Approval:</strong> ${resource.approval}
    </p>
  `;
}

/* =======================
   RESOURCE OVERVIEW TABLE
======================= */
function loadResourceOverview() {
  const table = $("resourceOverviewTable");

  if (!table) return;

  table.innerHTML = "";

  if (!resources || resources.length === 0) {
    table.innerHTML = `
      <tr>
        <td colspan="6">No resources loaded yet.</td>
      </tr>
    `;
    return;
  }

  resources.forEach(resource => {
    table.innerHTML += `
      <tr>
        <td>${resource.id}</td>
        <td>${resource.name}</td>
        <td>${resource.status}</td>
        <td>${resource.availability}</td>
        <td>${resource.maintenanceStatus}</td>
        <td>
          <button type="button" onclick="viewResourceDetails('${resource.id}')">
            View
          </button>
        </td>
      </tr>
    `;
  });
}

/* =======================
   MANAGE AVAILABILITY
======================= */
function saveAvailabilityChanges() {
  const resourceSelect = $("availabilityResource");
  const availabilitySelect = $("availabilityStatus");
  const statusSelect = $("resourceStatus");
  const availableDate = $("availableDate");
  const startTime = $("startTime");
  const endTime = $("endTime");

  if (!resourceSelect || !availabilitySelect || !statusSelect) {
    alert("Availability form input ID is missing. Please check the HTML IDs.");
    return;
  }

  const selectedResourceId = resourceSelect.value;

  if (selectedResourceId === "") {
    alert("Please select a resource.");
    return;
  }

  const resource = resources.find(item => String(item.databaseId) === String(selectedResourceId));

  if (!resource) {
    alert("Selected resource was not found.");
    return;
  }

  resource.availability = availabilitySelect.value;
  resource.status = statusSelect.value;
  resource.maintenanceStatus =
    statusSelect.value === "Under Maintenance" ? "Under Maintenance" : "None";

  loadResourceOverview();

  const statusUpdate = $("statusUpdate");

  if (statusUpdate) {
    statusUpdate.innerHTML = `
      <div class="success-result">
        <h3>Availability Updated</h3>
        <p>
          <strong>${resource.name}</strong> has been updated successfully.<br>
          Availability: ${resource.availability}<br>
          Status: ${resource.status}<br>
          Date: ${availableDate ? availableDate.value : "-"}<br>
          Time: ${startTime ? startTime.value : "-"} - ${endTime ? endTime.value : "-"}
        </p>
      </div>
    `;
  } else {
    alert("Availability updated successfully.");
  }
}

/* Alternative function name, in case HTML uses this */
function saveChanges() {
  saveAvailabilityChanges();
}

/* =======================
   PENDING BOOKINGS
======================= */
function loadPendingBookings() {
  fetch("get_bookings.php")
    .then(response => response.json())
    .then(data => {
      if (!data.success) return;

      bookings = data.bookings || [];

      const table = $("approvalTable");
      if (!table) return;

      table.innerHTML = "";

      if (bookings.length === 0) {
        table.innerHTML = `
          <tr>
            <td colspan="7">No pending bookings found.</td>
          </tr>
        `;
        return;
      }

      bookings.forEach(booking => {
        table.innerHTML += `
          <tr>
            <td>${booking.bookingID}</td>
            <td>${booking.applicantName}</td>
            <td>${booking.resourceName}</td>
            <td>${booking.bookingDate}</td>
            <td>${booking.startTime} - ${booking.endTime}</td>
            <td>${booking.status}</td>
            <td>
              <button type="button" onclick="openApproval(${booking.bookingID})">
                Review
              </button>
            </td>
          </tr>
        `;
      });
    })
    .catch(error => {
      console.error("Error loading pending bookings:", error);
    });
}

function openApproval(bookingID) {
  const approvalBookingId = $("approvalBookingId");
  const approvalPanel = $("approvalPanel");

  if (approvalBookingId) {
    approvalBookingId.value = bookingID;
  }

  if (approvalPanel) {
    approvalPanel.classList.remove("hidden");
  } else {
    alert("Open approval panel for Booking ID: " + bookingID);
  }
}

function approveBooking() {
  const bookingID = $("approvalBookingId") ? $("approvalBookingId").value : "";

  if (bookingID === "") {
    alert("No booking selected.");
    return;
  }

  const formData = new FormData();
  formData.append("bookingID", bookingID);

  fetch("approve_booking_rm.php", {
    method: "POST",
    body: formData
  })
    .then(response => response.json())
    .then(data => {
      alert(data.message);
      loadPendingBookings();
    })
    .catch(error => {
      console.error("Error approving booking:", error);
    });
}

function rejectBooking() {
  const bookingID = $("approvalBookingId") ? $("approvalBookingId").value : "";

  if (bookingID === "") {
    alert("No booking selected.");
    return;
  }

  const formData = new FormData();
  formData.append("bookingID", bookingID);

  fetch("reject_booking_rm.php", {
    method: "POST",
    body: formData
  })
    .then(response => response.json())
    .then(data => {
      alert(data.message);
      loadPendingBookings();
    })
    .catch(error => {
      console.error("Error rejecting booking:", error);
    });
}

/* =======================
   NOTIFICATIONS
======================= */
function loadNotificationsFromDatabase() {
  fetch("get_notifications.php")
    .then(response => response.json())
    .then(data => {
      if (!data.success) return;

      notifications = data.notifications || [];
      renderNotifications();
    })
    .catch(error => {
      console.error("Error loading notifications:", error);
    });
}

function renderNotifications() {
  const list = $("notificationList");

  if (!list) return;

  list.innerHTML = "";

  if (!notifications || notifications.length === 0) {
    list.innerHTML = "<p>No notifications found.</p>";
    return;
  }

  notifications.forEach(notification => {
    list.innerHTML += `
      <div class="notification-item">
        <p>${notification.message}</p>
        <small>${notification.dateCreated || notification.created_at || ""}</small>
      </div>
    `;
  });
}

function markAllNotificationsRead() {
  fetch("mark_notifications_read.php", {
    method: "POST",
    body: new FormData()
  })
    .then(() => loadNotificationsFromDatabase())
    .catch(error => {
      console.error("Error marking notifications as read:", error);
    });
}

/* =======================
   SEARCH RESOURCE
======================= */
function searchResources() {
  const searchInput =
    $("searchInput") ||
    $("resourceSearchInput") ||
    $("searchBox");

  if (!searchInput) return;

  const keyword = searchInput.value.trim().toLowerCase();

  const filteredResources = resources.filter(resource =>
    resource.name.toLowerCase().includes(keyword) ||
    resource.id.toLowerCase().includes(keyword) ||
    resource.type.toLowerCase().includes(keyword) ||
    resource.location.toLowerCase().includes(keyword)
  );

  displayResources(filteredResources);
}

/* =======================
   LOGOUT
======================= */
function logoutResourceManager() {
  alert("Logged out successfully.");
  window.location.href = "login.html";
}

/* =======================
   UTIL
======================= */
function formatDate(dateText) {
  if (!dateText) return "-";

  return new Date(dateText).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

/* =======================
   INIT
======================= */
document.addEventListener("DOMContentLoaded", function () {
  loadResourcesFromDatabase();
  loadPendingBookings();

  const saveAvailabilityBtn = $("saveAvailabilityBtn");

  if (saveAvailabilityBtn) {
    saveAvailabilityBtn.addEventListener("click", saveAvailabilityChanges);
  }
});

