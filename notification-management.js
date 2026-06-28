const API_URL = "admin_notifications.php";

const notificationForm = document.getElementById("notificationForm");

const notificationTitle = document.getElementById("notificationTitle");
const notificationType = document.getElementById("notificationType");
const targetUser = document.getElementById("targetUser");
const priority = document.getElementById("priority");
const notificationStatus = document.getElementById("notificationStatus");
const scheduleDate = document.getElementById("scheduleDate");
const notificationMessage = document.getElementById("notificationMessage");

const editIndex = document.getElementById("editIndex");
const formTitle = document.getElementById("formTitle");
const saveNotificationBtn = document.getElementById("saveNotificationBtn");
const clearFormBtn = document.getElementById("clearFormBtn");

const searchInput = document.getElementById("searchInput");
const notificationTableBody = document.getElementById("notificationTableBody");

const notificationModal = document.getElementById("notificationModal");
const closeModal = document.getElementById("closeModal");
const notificationDetails = document.getElementById("notificationDetails");

const dropdownBtn = document.getElementById("dropdownBtn");
const dropdownMenu = document.getElementById("dropdownMenu");
const adminDropdown = document.getElementById("adminDropdown");

let notifications = [];

/* Current date time */
function getCurrentDateTime() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

scheduleDate.min = getCurrentDateTime();

scheduleDate.addEventListener("click", () => {
  scheduleDate.min = getCurrentDateTime();
});

/* Convert datetime-local to MySQL datetime */
function toMysqlDateTime(value) {
  if (!value) return "";

  if (value.includes("T")) {
    return value.replace("T", " ") + ":00";
  }

  return value;
}

/* Convert MySQL datetime to datetime-local */
function toDateTimeLocal(value) {
  if (!value) return "";

  return value.replace(" ", "T").slice(0, 16);
}

function formatDateTime(value) {
  if (!value) return "Not scheduled";

  const date = new Date(value.replace(" ", "T"));

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

function formatNotificationId(id) {
  return "N" + String(id).padStart(3, "0");
}

function escapeHTML(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* Admin dropdown */
if (dropdownBtn && dropdownMenu) {
  dropdownBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    dropdownMenu.classList.toggle("show");
  });
}

document.addEventListener("click", (event) => {
  if (
    adminDropdown &&
    dropdownMenu &&
    !adminDropdown.contains(event.target)
  ) {
    dropdownMenu.classList.remove("show");
  }
});

/* Error functions */
function setError(input, errorId, message) {
  input.classList.add("invalid");
  document.getElementById(errorId).textContent = message;
}

function clearError(input, errorId) {
  input.classList.remove("invalid");
  document.getElementById(errorId).textContent = "";
}

function clearErrors() {
  clearError(notificationTitle, "notificationTitleError");
  clearError(notificationType, "notificationTypeError");
  clearError(targetUser, "targetUserError");
  clearError(priority, "priorityError");
  clearError(notificationStatus, "notificationStatusError");
  clearError(scheduleDate, "scheduleDateError");
  clearError(notificationMessage, "notificationMessageError");
}

/* Form validation */
function validateForm() {
  clearErrors();

  let isValid = true;

  const titleValue = notificationTitle.value.trim();
  const messageValue = notificationMessage.value.trim();

  if (titleValue === "") {
    setError(notificationTitle, "notificationTitleError", "Notification title is required.");
    isValid = false;
  } else if (titleValue.length < 3) {
    setError(notificationTitle, "notificationTitleError", "Title must be at least 3 characters.");
    isValid = false;
  } else if (titleValue.length > 100) {
    setError(notificationTitle, "notificationTitleError", "Title cannot be more than 100 characters.");
    isValid = false;
  } else if (!/^[A-Za-z0-9 .,&()_'-]+$/.test(titleValue)) {
    setError(notificationTitle, "notificationTitleError", "Title contains invalid characters.");
    isValid = false;
  }

  if (notificationType.value === "") {
    setError(notificationType, "notificationTypeError", "Please select notification type.");
    isValid = false;
  }

  if (targetUser.value === "") {
    setError(targetUser, "targetUserError", "Please select target user.");
    isValid = false;
  }

  if (priority.value === "") {
    setError(priority, "priorityError", "Please select priority.");
    isValid = false;
  }

  if (notificationStatus.value === "") {
    setError(notificationStatus, "notificationStatusError", "Please select status.");
    isValid = false;
  }

  if (notificationStatus.value === "Scheduled" && scheduleDate.value === "") {
    setError(
      scheduleDate,
      "scheduleDateError",
      "Schedule date and time is required for scheduled notification."
    );
    isValid = false;
  } else if (
    notificationStatus.value === "Scheduled" &&
    scheduleDate.value !== "" &&
    scheduleDate.value <= getCurrentDateTime()
  ) {
    setError(
      scheduleDate,
      "scheduleDateError",
      "Scheduled notification must use a future date and time."
    );
    isValid = false;
  }

  if (messageValue === "") {
    setError(notificationMessage, "notificationMessageError", "Message is required.");
    isValid = false;
  } else if (messageValue.length < 10) {
    setError(notificationMessage, "notificationMessageError", "Message must be at least 10 characters.");
    isValid = false;
  } else if (messageValue.length > 500) {
    setError(notificationMessage, "notificationMessageError", "Message cannot be more than 500 characters.");
    isValid = false;
  }

  return isValid;
}

/* Load notifications from PHP */
function loadNotifications() {
  fetch(API_URL)
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        notifications = data.notifications || [];
        renderNotifications(searchInput.value.trim());
        updateStats();
        updateNotificationDot();
      } else {
        showToast(data.message || "Failed to load notifications.");
      }
    })
    .catch((error) => {
      console.error("Load error:", error);
      showToast("Backend connection failed.");
    });
}

/* Render notifications table */
function renderNotifications(filterText = "") {
  notificationTableBody.innerHTML = "";

  const filteredNotifications = notifications.filter((item) => {
    const text = `
      ${item.notificationID}
      ${item.title}
      ${item.type}
      ${item.targetUser}
      ${item.priority}
      ${item.status}
      ${item.scheduleDate}
      ${item.message}
    `.toLowerCase();

    return text.includes(filterText.toLowerCase());
  });

  if (filteredNotifications.length === 0) {
    notificationTableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center;">No notifications found</td>
      </tr>
    `;
    return;
  }

  filteredNotifications.forEach((item) => {
    const row = document.createElement("tr");

    const sendButton =
      item.status === "Sent"
        ? `<button class="action-btn disabled-btn" disabled>Sent</button>`
        : `<button class="action-btn send-btn" onclick="sendNotification(${item.notificationID})">Send</button>`;

    row.innerHTML = `
      <td>${formatNotificationId(item.notificationID)}</td>
      <td>${escapeHTML(item.title)}</td>
      <td>${escapeHTML(item.type)}</td>
      <td>${escapeHTML(item.targetUser)}</td>
      <td><span class="priority ${escapeHTML(item.priority)}">${escapeHTML(item.priority)}</span></td>
      <td><span class="status ${escapeHTML(item.status)}">${escapeHTML(item.status)}</span></td>
      <td>
        <button class="action-btn view-btn" onclick="viewNotification(${item.notificationID})">View</button>
        <button class="action-btn edit-btn" onclick="editNotification(${item.notificationID})">Edit</button>
        ${sendButton}
        <button class="action-btn delete-btn" onclick="deleteNotification(${item.notificationID})">Delete</button>
      </td>
    `;

    notificationTableBody.appendChild(row);
  });
}

/* Update stats */
function updateStats() {
  const totalNotifications = document.getElementById("totalNotifications");
  const sentNotifications = document.getElementById("sentNotifications");
  const scheduledNotifications = document.getElementById("scheduledNotifications");
  const draftNotifications = document.getElementById("draftNotifications");

  const sentCount = notifications.filter((item) => item.status === "Sent").length;
  const scheduledCount = notifications.filter((item) => item.status === "Scheduled").length;
  const draftCount = notifications.filter((item) => item.status === "Draft").length;

  totalNotifications.textContent = notifications.length;
  sentNotifications.textContent = sentCount;
  scheduledNotifications.textContent = scheduledCount;
  draftNotifications.textContent = draftCount;
}

/* Submit form: create or update */
notificationForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!validateForm()) {
    showToast("Invalid input. Please fix the form.");
    return;
  }

  const notificationData = {
    title: notificationTitle.value.trim(),
    type: notificationType.value,
    targetUser: targetUser.value,
    priority: priority.value,
    status: notificationStatus.value,
    scheduleDate: toMysqlDateTime(scheduleDate.value),
    message: notificationMessage.value.trim()
  };

  let method = "POST";

  if (editIndex.value !== "") {
    method = "PUT";
    notificationData.notificationID = Number(editIndex.value);
  }

  fetch(API_URL, {
    method: method,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(notificationData)
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        showToast(data.message);
        resetForm();
        loadNotifications();
      } else {
        showToast(data.message || "Failed to save notification.");
      }
    })
    .catch((error) => {
      console.error("Save error:", error);
      showToast("Backend connection failed.");
    });
});

/* View notification */
function viewNotification(id) {
  const item = notifications.find((notification) => {
    return Number(notification.notificationID) === Number(id);
  });

  if (!item) return;

  notificationDetails.innerHTML = `
    <div class="detail-row"><strong>Notification ID:</strong> ${formatNotificationId(item.notificationID)}</div>
    <div class="detail-row"><strong>Title:</strong> ${escapeHTML(item.title)}</div>
    <div class="detail-row"><strong>Type:</strong> ${escapeHTML(item.type)}</div>
    <div class="detail-row"><strong>Target User:</strong> ${escapeHTML(item.targetUser)}</div>
    <div class="detail-row"><strong>Priority:</strong> ${escapeHTML(item.priority)}</div>
    <div class="detail-row"><strong>Status:</strong> ${escapeHTML(item.status)}</div>
    <div class="detail-row"><strong>Schedule Date:</strong> ${formatDateTime(item.scheduleDate)}</div>
    <div class="detail-row"><strong>Message:</strong> ${escapeHTML(item.message)}</div>
  `;

  notificationModal.classList.add("show");
}

/* Edit notification */
function editNotification(id) {
  const item = notifications.find((notification) => {
    return Number(notification.notificationID) === Number(id);
  });

  if (!item) return;

  editIndex.value = item.notificationID;
  notificationTitle.value = item.title;
  notificationType.value = item.type;
  targetUser.value = item.targetUser;
  priority.value = item.priority;
  notificationStatus.value = item.status;
  scheduleDate.value = toDateTimeLocal(item.scheduleDate);
  notificationMessage.value = item.message;

  formTitle.textContent = "Edit Notification";
  saveNotificationBtn.textContent = "Update Notification";

  clearErrors();

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

/* Send notification */
function sendNotification(id) {
  const item = notifications.find((notification) => {
    return Number(notification.notificationID) === Number(id);
  });

  if (!item) return;

  const updatedNotification = {
    notificationID: Number(item.notificationID),
    title: item.title,
    type: item.type,
    targetUser: item.targetUser,
    priority: item.priority,
    status: "Sent",
    scheduleDate: toMysqlDateTime(getCurrentDateTime()),
    message: item.message
  };

  fetch(API_URL, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(updatedNotification)
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        showToast("Notification sent successfully.");
        loadNotifications();
      } else {
        showToast(data.message || "Failed to send notification.");
      }
    })
    .catch((error) => {
      console.error("Send error:", error);
      showToast("Backend connection failed.");
    });
}

/* Delete notification */
function deleteNotification(id) {
  const confirmDelete = confirm("Are you sure you want to delete this notification?");

  if (!confirmDelete) {
    return;
  }

  fetch(`${API_URL}?id=${id}`, {
    method: "DELETE"
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        showToast(data.message);
        loadNotifications();
      } else {
        showToast(data.message || "Failed to delete notification.");
      }
    })
    .catch((error) => {
      console.error("Delete error:", error);
      showToast("Backend connection failed.");
    });
}

/* Reset form */
function resetForm() {
  notificationForm.reset();
  editIndex.value = "";
  formTitle.textContent = "Create New Notification";
  saveNotificationBtn.textContent = "Create Notification";
  clearErrors();
  scheduleDate.min = getCurrentDateTime();
}

clearFormBtn.addEventListener("click", () => {
  resetForm();
  showToast("Form cleared.");
});

searchInput.addEventListener("input", () => {
  renderNotifications(searchInput.value.trim());
});

/* Modal close */
closeModal.addEventListener("click", () => {
  notificationModal.classList.remove("show");
});

notificationModal.addEventListener("click", (event) => {
  if (event.target === notificationModal) {
    notificationModal.classList.remove("show");
  }
});

/* Notification bell */
function openNotificationPage() {
  window.location.href = "notification-management.html";
}

function updateNotificationDot() {
  const notificationDot = document.getElementById("notificationDot");

  if (!notificationDot) return;

  const hasPendingNotification = notifications.some((item) => {
    return item.status === "Draft" || item.status === "Scheduled";
  });

  if (hasPendingNotification) {
    notificationDot.style.display = "block";
  } else {
    notificationDot.style.display = "none";
  }
}

/* Toast */
function showToast(message) {
  const toast = document.getElementById("toast");

  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2300);
}

/* Clear errors while typing */
[
  notificationTitle,
  notificationType,
  targetUser,
  priority,
  notificationStatus,
  scheduleDate,
  notificationMessage
].forEach((input) => {
  input.addEventListener("input", clearErrors);
  input.addEventListener("change", clearErrors);
});

/* Load data from PHP */
loadNotifications();