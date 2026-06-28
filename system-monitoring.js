const API_URL = "system_monitoring.php";
const NOTIFICATION_API_URL = "admin_notifications.php";

const monitoringForm = document.getElementById("monitoringForm");

const moduleName = document.getElementById("moduleName");
const moduleStatus = document.getElementById("moduleStatus");
const severity = document.getElementById("severity");
const responseTime = document.getElementById("responseTime");
const uptime = document.getElementById("uptime");
const lastChecked = document.getElementById("lastChecked");
const monitoringNote = document.getElementById("monitoringNote");

const editIndex = document.getElementById("editIndex");
const formTitle = document.getElementById("formTitle");
const saveMonitoringBtn = document.getElementById("saveMonitoringBtn");
const clearFormBtn = document.getElementById("clearFormBtn");

const searchInput = document.getElementById("searchInput");
const monitoringTableBody = document.getElementById("monitoringTableBody");

const monitoringModal = document.getElementById("monitoringModal");
const closeModal = document.getElementById("closeModal");
const monitoringDetails = document.getElementById("monitoringDetails");

const dropdownBtn = document.getElementById("dropdownBtn");
const dropdownMenu = document.getElementById("dropdownMenu");
const adminDropdown = document.getElementById("adminDropdown");

let monitoringRecords = [];

/* Admin dropdown */
if (dropdownBtn && dropdownMenu) {
  dropdownBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    dropdownMenu.classList.toggle("show");
  });
}

/* Close dropdown when clicking outside */
document.addEventListener("click", (event) => {
  if (
    adminDropdown &&
    dropdownMenu &&
    !adminDropdown.contains(event.target)
  ) {
    dropdownMenu.classList.remove("show");
  }
});

/* Date time helper */
function getCurrentDateTime() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

lastChecked.max = getCurrentDateTime();

lastChecked.addEventListener("click", () => {
  lastChecked.max = getCurrentDateTime();
});

lastChecked.addEventListener("change", () => {
  if (lastChecked.value > getCurrentDateTime()) {
    setError(lastChecked, "lastCheckedError", "Future date and time is not allowed.");
  } else {
    clearError(lastChecked, "lastCheckedError");
  }
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
  if (!value) return "Not checked";

  const date = new Date(value.replace(" ", "T"));

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

function formatMonitoringId(id) {
  return "M" + String(id).padStart(3, "0");
}

function escapeHTML(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setError(input, errorId, message) {
  input.classList.add("invalid");
  document.getElementById(errorId).textContent = message;
}

function clearError(input, errorId) {
  input.classList.remove("invalid");
  document.getElementById(errorId).textContent = "";
}

function clearErrors() {
  clearError(moduleName, "moduleNameError");
  clearError(moduleStatus, "moduleStatusError");
  clearError(severity, "severityError");
  clearError(responseTime, "responseTimeError");
  clearError(uptime, "uptimeError");
  clearError(lastChecked, "lastCheckedError");
  clearError(monitoringNote, "monitoringNoteError");
}

function validateForm() {
  clearErrors();

  let isValid = true;

  const moduleNameValue = moduleName.value.trim();
  const responseTimeValue = Number(responseTime.value);
  const uptimeValue = Number(uptime.value);
  const noteValue = monitoringNote.value.trim();

  if (moduleNameValue === "") {
    setError(moduleName, "moduleNameError", "Module or resource name is required.");
    isValid = false;
  } else if (moduleNameValue.length < 3) {
    setError(moduleName, "moduleNameError", "Name must be at least 3 characters.");
    isValid = false;
  } else if (moduleNameValue.length > 100) {
    setError(moduleName, "moduleNameError", "Name cannot be more than 100 characters.");
    isValid = false;
  } else if (!/^[A-Za-z0-9 &()._-]+$/.test(moduleNameValue)) {
    setError(
      moduleName,
      "moduleNameError",
      "Only letters, numbers, spaces, &, -, _, dot and brackets are allowed."
    );
    isValid = false;
  }

  if (moduleStatus.value === "") {
    setError(moduleStatus, "moduleStatusError", "Please select status.");
    isValid = false;
  }

  if (severity.value === "") {
    setError(severity, "severityError", "Please select severity.");
    isValid = false;
  }

  if (responseTime.value.trim() === "") {
    setError(responseTime, "responseTimeError", "Response time is required.");
    isValid = false;
  } else if (!Number.isFinite(responseTimeValue)) {
    setError(responseTime, "responseTimeError", "Response time must be a number.");
    isValid = false;
  } else if (responseTimeValue < 0) {
    setError(responseTime, "responseTimeError", "Response time cannot be negative.");
    isValid = false;
  } else if (responseTimeValue > 10000) {
    setError(responseTime, "responseTimeError", "Response time cannot be more than 10000 ms.");
    isValid = false;
  } else if (!Number.isInteger(responseTimeValue)) {
    setError(responseTime, "responseTimeError", "Response time must be a whole number.");
    isValid = false;
  }

  if (uptime.value.trim() === "") {
    setError(uptime, "uptimeError", "Uptime percentage is required.");
    isValid = false;
  } else if (!Number.isFinite(uptimeValue)) {
    setError(uptime, "uptimeError", "Uptime must be a number.");
    isValid = false;
  } else if (uptimeValue < 0 || uptimeValue > 100) {
    setError(uptime, "uptimeError", "Uptime must be between 0 and 100.");
    isValid = false;
  }

  if (lastChecked.value === "") {
    setError(lastChecked, "lastCheckedError", "Last checked date and time is required.");
    isValid = false;
  } else if (lastChecked.value > getCurrentDateTime()) {
    setError(lastChecked, "lastCheckedError", "Future date and time is not allowed.");
    isValid = false;
  }

  if (noteValue === "") {
    setError(monitoringNote, "monitoringNoteError", "Monitoring note is required.");
    isValid = false;
  } else if (noteValue.length < 10) {
    setError(monitoringNote, "monitoringNoteError", "Note must be at least 10 characters.");
    isValid = false;
  } else if (noteValue.length > 250) {
    setError(monitoringNote, "monitoringNoteError", "Note cannot be more than 250 characters.");
    isValid = false;
  }

  return isValid;
}

/* Load monitoring records from PHP */
function loadMonitoringRecords() {
  fetch(API_URL)
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        monitoringRecords = data.records || [];
        renderMonitoringRecords(searchInput.value.trim());
        updateStats();
      } else {
        showToast(data.message || "Failed to load monitoring records.");
      }
    })
    .catch((error) => {
      console.error("Load monitoring error:", error);
      showToast("Backend connection failed.");
    });
}

function renderMonitoringRecords(filterText = "") {
  monitoringTableBody.innerHTML = "";

  const filteredRecords = monitoringRecords.filter((item) => {
    const text = `
      ${item.monitoringID}
      ${item.moduleName}
      ${item.status}
      ${item.severity}
      ${item.responseTime}
      ${item.uptime}
      ${item.lastChecked}
      ${item.note}
    `.toLowerCase();

    return text.includes(filterText.toLowerCase());
  });

  if (filteredRecords.length === 0) {
    monitoringTableBody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align:center;">No monitoring records found</td>
      </tr>
    `;

    updateStats();
    return;
  }

  filteredRecords.forEach((item) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${formatMonitoringId(item.monitoringID)}</td>
      <td>${escapeHTML(item.moduleName)}</td>
      <td><span class="status ${escapeHTML(item.status)}">${escapeHTML(item.status)}</span></td>
      <td><span class="severity ${escapeHTML(item.severity)}">${escapeHTML(item.severity)}</span></td>
      <td>${escapeHTML(item.responseTime)} ms</td>
      <td>${escapeHTML(item.uptime)}%</td>
      <td>${formatDateTime(item.lastChecked)}</td>
      <td>
        <button class="action-btn view-btn" onclick="viewRecord(${item.monitoringID})">View</button>
        <button class="action-btn edit-btn" onclick="editRecord(${item.monitoringID})">Edit</button>
        <button class="action-btn delete-btn" onclick="deleteRecord(${item.monitoringID})">Delete</button>
      </td>
    `;

    monitoringTableBody.appendChild(row);
  });

  updateStats();
}

function updateStats() {
  const totalModules = document.getElementById("totalModules");
  const onlineModules = document.getElementById("onlineModules");
  const warningModules = document.getElementById("warningModules");
  const offlineModules = document.getElementById("offlineModules");

  const onlineCount = monitoringRecords.filter((item) => item.status === "Online").length;
  const warningCount = monitoringRecords.filter((item) => item.status === "Warning").length;
  const offlineCount = monitoringRecords.filter((item) => item.status === "Offline").length;

  totalModules.textContent = monitoringRecords.length;
  onlineModules.textContent = onlineCount;
  warningModules.textContent = warningCount;
  offlineModules.textContent = offlineCount;
}

function resetForm() {
  monitoringForm.reset();
  editIndex.value = "";
  formTitle.textContent = "Add Monitoring Record";
  saveMonitoringBtn.textContent = "Save Record";
  clearErrors();
  lastChecked.max = getCurrentDateTime();
}

/* Submit form */
monitoringForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!validateForm()) {
    showToast("Invalid input. Please fix the form.");
    return;
  }

  const recordData = {
    moduleName: moduleName.value.trim(),
    status: moduleStatus.value,
    severity: severity.value,
    responseTime: Number(responseTime.value),
    uptime: Number(uptime.value),
    lastChecked: toMysqlDateTime(lastChecked.value),
    note: monitoringNote.value.trim()
  };

  let method = "POST";

  if (editIndex.value !== "") {
    method = "PUT";
    recordData.monitoringID = Number(editIndex.value);
  }

  fetch(API_URL, {
    method: method,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(recordData)
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        showToast(data.message);
        resetForm();
        loadMonitoringRecords();
      } else {
        showToast(data.message || "Failed to save monitoring record.");
      }
    })
    .catch((error) => {
      console.error("Save monitoring error:", error);
      showToast("Backend connection failed.");
    });
});

clearFormBtn.addEventListener("click", () => {
  resetForm();
  showToast("Form cleared.");
});

searchInput.addEventListener("input", () => {
  renderMonitoringRecords(searchInput.value.trim());
});

function viewRecord(id) {
  const item = monitoringRecords.find((record) => {
    return Number(record.monitoringID) === Number(id);
  });

  if (!item) return;

  monitoringDetails.innerHTML = `
    <div class="detail-row"><strong>Monitoring ID:</strong> ${formatMonitoringId(item.monitoringID)}</div>
    <div class="detail-row"><strong>Module / Resource:</strong> ${escapeHTML(item.moduleName)}</div>
    <div class="detail-row"><strong>Status:</strong> ${escapeHTML(item.status)}</div>
    <div class="detail-row"><strong>Severity:</strong> ${escapeHTML(item.severity)}</div>
    <div class="detail-row"><strong>Response Time:</strong> ${escapeHTML(item.responseTime)} ms</div>
    <div class="detail-row"><strong>Uptime:</strong> ${escapeHTML(item.uptime)}%</div>
    <div class="detail-row"><strong>Last Checked:</strong> ${formatDateTime(item.lastChecked)}</div>
    <div class="detail-row"><strong>Note:</strong> ${escapeHTML(item.note)}</div>
  `;

  monitoringModal.classList.add("show");
}

function editRecord(id) {
  const item = monitoringRecords.find((record) => {
    return Number(record.monitoringID) === Number(id);
  });

  if (!item) return;

  editIndex.value = item.monitoringID;
  moduleName.value = item.moduleName;
  moduleStatus.value = item.status;
  severity.value = item.severity;
  responseTime.value = item.responseTime;
  uptime.value = item.uptime;
  lastChecked.value = toDateTimeLocal(item.lastChecked);
  monitoringNote.value = item.note;

  formTitle.textContent = "Edit Monitoring Record";
  saveMonitoringBtn.textContent = "Update Record";

  clearErrors();
  lastChecked.max = getCurrentDateTime();

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function deleteRecord(id) {
  const confirmDelete = confirm("Are you sure you want to delete this monitoring record?");

  if (!confirmDelete) {
    return;
  }

  fetch(`${API_URL}?id=${id}`, {
    method: "DELETE"
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        showToast(data.message || "Monitoring record deleted successfully.");
        resetForm();
        loadMonitoringRecords();
      } else {
        showToast(data.message || "Failed to delete monitoring record.");
      }
    })
    .catch((error) => {
      console.error("Delete monitoring error:", error);
      showToast("Backend connection failed.");
    });
}

closeModal.addEventListener("click", () => {
  monitoringModal.classList.remove("show");
});

monitoringModal.addEventListener("click", (event) => {
  if (event.target === monitoringModal) {
    monitoringModal.classList.remove("show");
  }
});

/* Notification Bell */
function openNotificationPage() {
  window.location.href = "notification-management.html";
}

function updateNotificationDot() {
  const notificationDot = document.getElementById("notificationDot");

  if (!notificationDot) return;

  fetch(NOTIFICATION_API_URL)
    .then((response) => response.json())
    .then((data) => {
      if (!data.success) return;

      const notifications = data.notifications || [];

      const hasPendingNotification = notifications.some((item) => {
        return item.status === "Draft" || item.status === "Scheduled";
      });

      notificationDot.style.display = hasPendingNotification ? "block" : "none";
    })
    .catch((error) => {
      console.error("Notification dot error:", error);
      notificationDot.style.display = "none";
    });
}

function showToast(message) {
  const toast = document.getElementById("toast");

  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2300);
}

[
  moduleName,
  moduleStatus,
  severity,
  responseTime,
  uptime,
  lastChecked,
  monitoringNote
].forEach((input) => {
  input.addEventListener("input", clearErrors);
  input.addEventListener("change", clearErrors);
});

/* Load data */
loadMonitoringRecords();
updateNotificationDot();