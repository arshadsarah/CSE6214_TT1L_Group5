const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");
const dropdownBtn = document.getElementById("dropdownBtn");
const dropdownMenu = document.getElementById("dropdownMenu");
const menuLinks = document.querySelectorAll(".menu-link");

const dashboardCards = document.getElementById("dashboardCards");
const userCards = document.getElementById("userCards");

const mainTitle = document.getElementById("mainTitle");
const mainSubtitle = document.getElementById("mainSubtitle");
const toast = document.getElementById("toast");

const originalDashboardCards = dashboardCards ? dashboardCards.innerHTML : "";

/* Sidebar toggle for small screen */
if (menuToggle && sidebar) {
  menuToggle.addEventListener("click", () => {
    sidebar.classList.toggle("show");
  });
}

/* Admin dropdown */
if (dropdownBtn && dropdownMenu) {
  dropdownBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    dropdownMenu.classList.toggle("show");
  });
}

/* Close dropdown when clicking outside */
document.addEventListener("click", (event) => {
  const adminDropdown = document.getElementById("adminDropdown");

  if (
    adminDropdown &&
    dropdownMenu &&
    !adminDropdown.contains(event.target)
  ) {
    dropdownMenu.classList.remove("show");
  }
});

/* Sidebar menu click */
menuLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const section = link.getAttribute("data-section");

    /*
      If the sidebar item has no data-section,
      it will open the linked page normally.
      Example: report-generation.html, notification-management.html, login.html
    */
    if (!section) {
      return;
    }

    event.preventDefault();

    setActiveMenu(section);

    if (sidebar) {
      sidebar.classList.remove("show");
    }

    if (section === "dashboard") {
      showDashboard();
    } else if (section === "users") {
      showManageUsers();
    } else if (section === "bookings") {
      showPlaceholder(
        "Manage Bookings",
        "Manage booking requests, approvals, cancellations, and schedules."
      );
    } else if (section === "monitoring") {
      showPlaceholder(
        "System Monitoring",
        "Monitor system status, platform activity, and resource availability."
      );
    } else if (section === "settings") {
      showPlaceholder(
        "System Settings",
        "Manage admin settings, system preferences, and security options."
      );
    }
  });
});

/* Set active sidebar menu */
function setActiveMenu(sectionName) {
  menuLinks.forEach((item) => item.classList.remove("active"));

  const activeMenu = document.querySelector(`[data-section="${sectionName}"]`);

  if (activeMenu) {
    activeMenu.classList.add("active");
  }
}

/* Show Admin Dashboard */
function showDashboard() {
  if (!mainTitle || !mainSubtitle || !dashboardCards || !userCards) return;

  mainTitle.textContent = "Admin Dashboard";
  mainSubtitle.textContent =
    "Manage users, reports, notifications, and system activity.";

  dashboardCards.innerHTML = originalDashboardCards;

  dashboardCards.classList.remove("hidden");
  userCards.classList.add("hidden");
}

/* Show Manage Users */
function showManageUsers() {
  if (!mainTitle || !mainSubtitle || !dashboardCards || !userCards) return;

  mainTitle.textContent = "Manage Users";
  mainSubtitle.textContent =
    "Select a user type to manage accounts and details.";

  dashboardCards.classList.add("hidden");
  userCards.classList.remove("hidden");
}

/* Placeholder for unfinished sections */
function showPlaceholder(title, subtitle) {
  if (!mainTitle || !mainSubtitle || !dashboardCards || !userCards) return;

  mainTitle.textContent = title;
  mainSubtitle.textContent = subtitle;

  userCards.classList.add("hidden");
  dashboardCards.classList.remove("hidden");

  dashboardCards.innerHTML = `
    <div class="dashboard-card">
      <div class="card-icon">
        <svg viewBox="0 0 24 24">
          <path d="M3 4h18v13H3V4Zm2 2v9h14V6H5Zm3 11h8l1 3H7l1-3Z"/>
        </svg>
      </div>

      <h3>${title}</h3>
      <div class="small-line"></div>
      <p>This section is ready for your next page design.</p>

      <button class="card-btn" onclick="showToast('${title} section clicked')">
        Continue <span>›</span>
      </button>
    </div>
  `;
}

/* Dashboard card button actions */
document.addEventListener("click", (event) => {
  const button = event.target.closest(".card-btn");
  const card = event.target.closest(".dashboard-card");

  if (!button || !card) return;

  const pageName = card.getAttribute("data-page");

  if (!pageName) return;

  if (pageName === "Manage Users") {
    setActiveMenu("users");
    showManageUsers();
    return;
  }

  if (pageName === "Report Generation") {
    window.location.href = "report-generation.html";
    return;
  }

  if (pageName === "Notification Management") {
    window.location.href = "notification-management.html";
    return;
  }

  if (pageName === "System Monitoring") {
    setActiveMenu("monitoring");
    showPlaceholder(
      "System Monitoring",
      "Monitor system status, booking activity, user traffic, and platform health."
    );
    return;
  }

  showToast(pageName + " clicked");
});

/* Admin search function */
function searchAdminItem() {
  const searchInput = document.getElementById("adminSearchInput");

  if (!searchInput) return;

  const value = searchInput.value.trim().toLowerCase();

  if (value === "") {
    showToast("Please enter something to search.");
    return;
  }

  if (
    value.includes("user") ||
    value.includes("student") ||
    value.includes("faculty") ||
    value.includes("staff") ||
    value.includes("manager") ||
    value.includes("admin")
  ) {
    setActiveMenu("users");
    showManageUsers();
    return;
  }

  if (value.includes("report")) {
    window.location.href = "report-generation.html";
    return;
  }

  if (
    value.includes("notification") ||
    value.includes("alert") ||
    value.includes("message")
  ) {
    window.location.href = "notification-management.html";
    return;
  }

  if (
    value.includes("booking") ||
    value.includes("schedule") ||
    value.includes("reservation")
  ) {
    setActiveMenu("bookings");
    showPlaceholder(
      "Manage Bookings",
      "Manage booking requests, approvals, cancellations, and schedules."
    );
    return;
  }

  if (
    value.includes("monitor") ||
    value.includes("system") ||
    value.includes("activity")
  ) {
    setActiveMenu("monitoring");
    showPlaceholder(
      "System Monitoring",
      "Monitor system status, platform activity, and resource availability."
    );
    return;
  }

  if (
    value.includes("setting") ||
    value.includes("security") ||
    value.includes("preference")
  ) {
    setActiveMenu("settings");
    showPlaceholder(
      "System Settings",
      "Manage admin settings, system preferences, and security options."
    );
    return;
  }

  showToast("No matching section found.");
}

/* Search when pressing Enter */
document.addEventListener("keydown", (event) => {
  const searchInput = document.getElementById("adminSearchInput");

  if (!searchInput) return;

  if (event.key === "Enter" && document.activeElement === searchInput) {
    searchAdminItem();
  }
});

/* Toast message */
function showToast(message) {
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

/* Notification Bell */

function openNotificationPage() {
  window.location.href = "notification-management.html";
}

function updateNotificationDot() {
  const notificationDot = document.getElementById("notificationDot");

  if (!notificationDot) return;

  const notifications =
    JSON.parse(localStorage.getItem("campusNotifications")) || [];

  const hasPendingNotification = notifications.some((item) => {
    return item.status === "Draft" || item.status === "Scheduled";
  });

  if (hasPendingNotification) {
    notificationDot.style.display = "block";
  } else {
    notificationDot.style.display = "none";
  }
}

updateNotificationDot();

/* Always show Admin Dashboard first when page loads */
window.addEventListener("DOMContentLoaded", () => {
  setActiveMenu("dashboard");
  showDashboard();
});