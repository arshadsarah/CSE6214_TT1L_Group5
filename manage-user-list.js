const API_URL = "admin_users.php";
const NOTIFICATION_API_URL = "admin_notifications.php";

const pageSettings = {
  students: {
    title: "Manage Students",
    subtitle: "Add, edit, delete, and search student accounts.",
    addButton: "+ Add Student",
    modalAddTitle: "Add Student",
    modalEditTitle: "Edit Student",
    saveButton: "Save Student",
    updateButton: "Update Student",
    tableTitle: "Student List",
    totalLabel: "Total Students",
    idLabel: "Student Username",
    idPlaceholder: "Example: student01",
    departmentLabel: "Faculty",
    departmentColumn: "Faculty",
    departmentPlaceholder: "Example: Computing"
  },

  faculty: {
    title: "Manage Faculty & Staff",
    subtitle: "Add, edit, delete, and search faculty and staff accounts.",
    addButton: "+ Add Faculty / Staff",
    modalAddTitle: "Add Faculty / Staff",
    modalEditTitle: "Edit Faculty / Staff",
    saveButton: "Save Faculty / Staff",
    updateButton: "Update Faculty / Staff",
    tableTitle: "Faculty & Staff List",
    totalLabel: "Total Faculty & Staff",
    idLabel: "Staff Username",
    idPlaceholder: "Example: staff01",
    departmentLabel: "Department",
    departmentColumn: "Department",
    departmentPlaceholder: "Example: Computer Science"
  },

  managers: {
    title: "Manage Resource Managers",
    subtitle: "Add, edit, delete, and search resource manager accounts.",
    addButton: "+ Add Resource Manager",
    modalAddTitle: "Add Resource Manager",
    modalEditTitle: "Edit Resource Manager",
    saveButton: "Save Resource Manager",
    updateButton: "Update Resource Manager",
    tableTitle: "Resource Manager List",
    totalLabel: "Total Resource Managers",
    idLabel: "Manager Username",
    idPlaceholder: "Example: manager01",
    departmentLabel: "Assigned Area",
    departmentColumn: "Assigned Area",
    departmentPlaceholder: "Example: Computer Labs"
  },

  admins: {
    title: "Manage Administrators",
    subtitle: "Add, edit, delete, and search administrator accounts.",
    addButton: "+ Add Administrator",
    modalAddTitle: "Add Administrator",
    modalEditTitle: "Edit Administrator",
    saveButton: "Save Administrator",
    updateButton: "Update Administrator",
    tableTitle: "Administrator List",
    totalLabel: "Total Administrators",
    idLabel: "Admin Username",
    idPlaceholder: "Example: admin01",
    departmentLabel: "Admin Role",
    departmentColumn: "Admin Role",
    departmentPlaceholder: "Example: Super Admin"
  }
};

const roleMap = {
  students: "Student",
  faculty: "Staff / Faculty",
  managers: "Resource Manager",
  admins: "Admin"
};

const urlParams = new URLSearchParams(window.location.search);
const pageType = urlParams.get("type") || "students";
const currentSettings = pageSettings[pageType] || pageSettings.students;
const currentRole = roleMap[pageType] || "Student";

let users = [];

const pageTitle = document.getElementById("pageTitle");
const pageSubtitle = document.getElementById("pageSubtitle");
const openAddModal = document.getElementById("openAddModal");
const tableTitle = document.getElementById("tableTitle");
const totalLabel = document.getElementById("totalLabel");
const idLabel = document.getElementById("idLabel");
const departmentLabel = document.getElementById("departmentLabel");
const departmentColumn = document.getElementById("departmentColumn");
const saveBtn = document.getElementById("saveBtn");

const userTableBody = document.getElementById("userTableBody");
const searchInput = document.getElementById("searchInput");

const userModal = document.getElementById("userModal");
const closeModal = document.getElementById("closeModal");
const userForm = document.getElementById("userForm");

const editIndex = document.getElementById("editIndex");
const modalTitle = document.getElementById("modalTitle");

const userId = document.getElementById("userId");
const userName = document.getElementById("userName");
const userEmail = document.getElementById("userEmail");
const userDepartment = document.getElementById("userDepartment");
const userStatus = document.getElementById("userStatus");

const dropdownBtn = document.getElementById("dropdownBtn");
const dropdownMenu = document.getElementById("dropdownMenu");
const adminDropdown = document.getElementById("adminDropdown");

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

function setupPageText() {
  pageTitle.textContent = currentSettings.title;
  pageSubtitle.textContent = currentSettings.subtitle;
  openAddModal.textContent = currentSettings.addButton;
  tableTitle.textContent = currentSettings.tableTitle;
  totalLabel.textContent = currentSettings.totalLabel;
  idLabel.textContent = currentSettings.idLabel;
  userId.placeholder = currentSettings.idPlaceholder;
  departmentLabel.textContent = currentSettings.departmentLabel;
  departmentColumn.textContent = currentSettings.departmentColumn;
  userDepartment.placeholder = currentSettings.departmentPlaceholder;
  saveBtn.textContent = currentSettings.saveButton;
}

function escapeHTML(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* Load users from PHP */
function loadUsers() {
  fetch(`${API_URL}?type=${pageType}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        users = data.users || [];
        renderUsers(searchInput.value.trim());
        updateStats();
      } else {
        showToast(data.message || "Failed to load users.");
      }
    })
    .catch((error) => {
      console.error("Load users error:", error);
      showToast("Backend connection failed.");
    });
}

/* Render user table */
function renderUsers(filterText = "") {
  userTableBody.innerHTML = "";

  const filteredUsers = users.filter((user) => {
    const searchText = `
      ${user.userID}
      ${user.username}
      ${user.name}
      ${user.email}
      ${user.department}
      ${user.role}
      ${user.status}
    `.toLowerCase();

    return searchText.includes(filterText.toLowerCase());
  });

  if (filteredUsers.length === 0) {
    userTableBody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center;">No users found</td>
      </tr>
    `;

    updateStats();
    return;
  }

  filteredUsers.forEach((user) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${escapeHTML(user.username)}</td>
      <td>${escapeHTML(user.name)}</td>
      <td>${escapeHTML(user.email)}</td>
      <td>${escapeHTML(user.department)}</td>
      <td><span class="status ${escapeHTML(user.status)}">${escapeHTML(user.status)}</span></td>
      <td>
        <button class="action-btn edit-btn" onclick="editUser(${user.userID})">Edit</button>
        <button class="action-btn delete-btn" onclick="deleteUser(${user.userID})">Delete</button>
      </td>
    `;

    userTableBody.appendChild(row);
  });

  updateStats();
}

/* Update stats cards */
function updateStats() {
  const totalUsers = document.getElementById("totalUsers");
  const activeUsers = document.getElementById("activeUsers");
  const inactiveUsers = document.getElementById("inactiveUsers");

  const activeCount = users.filter((user) => user.status === "Active").length;
  const inactiveCount = users.filter((user) => user.status === "Inactive").length;

  totalUsers.textContent = users.length;
  activeUsers.textContent = activeCount;
  inactiveUsers.textContent = inactiveCount;
}

/* Open modal */
function openModal(mode = "add") {
  userModal.classList.add("show");

  if (mode === "add") {
    modalTitle.textContent = currentSettings.modalAddTitle;
    saveBtn.textContent = currentSettings.saveButton;
  } else {
    modalTitle.textContent = currentSettings.modalEditTitle;
    saveBtn.textContent = currentSettings.updateButton;
  }
}

/* Close modal */
function closeUserModal() {
  userModal.classList.remove("show");
  userForm.reset();
  editIndex.value = "";
  clearErrors();
}

/* Add button */
openAddModal.addEventListener("click", () => {
  editIndex.value = "";
  userForm.reset();
  clearErrors();
  openModal("add");
});

/* Modal close */
closeModal.addEventListener("click", closeUserModal);

userModal.addEventListener("click", (event) => {
  if (event.target === userModal) {
    closeUserModal();
  }
});

/* Search */
searchInput.addEventListener("input", () => {
  renderUsers(searchInput.value.trim());
});

/* Error handling */
function setError(input, errorId, message) {
  input.classList.add("invalid");
  document.getElementById(errorId).textContent = message;
}

function clearError(input, errorId) {
  input.classList.remove("invalid");
  document.getElementById(errorId).textContent = "";
}

function clearErrors() {
  clearError(userId, "userIdError");
  clearError(userName, "userNameError");
  clearError(userEmail, "userEmailError");
  clearError(userDepartment, "userDepartmentError");
  clearError(userStatus, "userStatusError");
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

/* Form validation */
function validateForm() {
  clearErrors();

  let isValid = true;

  const usernameValue = userId.value.trim();
  const nameValue = userName.value.trim();
  const emailValue = userEmail.value.trim();
  const departmentValue = userDepartment.value.trim();
  const statusValue = userStatus.value;

  if (usernameValue === "") {
    setError(userId, "userIdError", "Username is required.");
    isValid = false;
  } else if (usernameValue.length < 3) {
    setError(userId, "userIdError", "Username must be at least 3 characters.");
    isValid = false;
  } else if (!/^[A-Za-z0-9_]+$/.test(usernameValue)) {
    setError(userId, "userIdError", "Only letters, numbers and underscore are allowed.");
    isValid = false;
  }

  if (nameValue === "") {
    setError(userName, "userNameError", "Name is required.");
    isValid = false;
  } else if (nameValue.length < 3) {
    setError(userName, "userNameError", "Name must be at least 3 characters.");
    isValid = false;
  } else if (!/^[A-Za-z .'-]+$/.test(nameValue)) {
    setError(userName, "userNameError", "Only letters, spaces, dot, apostrophe and dash are allowed.");
    isValid = false;
  }

  if (emailValue === "") {
    setError(userEmail, "userEmailError", "Email is required.");
    isValid = false;
  } else if (!isValidEmail(emailValue)) {
    setError(userEmail, "userEmailError", "Enter a valid email address.");
    isValid = false;
  }

  if (departmentValue === "") {
    setError(userDepartment, "userDepartmentError", "This field is required.");
    isValid = false;
  } else if (departmentValue.length < 3) {
    setError(userDepartment, "userDepartmentError", "Enter at least 3 characters.");
    isValid = false;
  }

  if (statusValue === "") {
    setError(userStatus, "userStatusError", "Please select status.");
    isValid = false;
  } else if (statusValue !== "Active" && statusValue !== "Inactive") {
    setError(userStatus, "userStatusError", "Status must be Active or Inactive.");
    isValid = false;
  }

  const duplicateUsername = users.some((user) => {
    return (
      user.username.toLowerCase() === usernameValue.toLowerCase() &&
      String(user.userID) !== editIndex.value
    );
  });

  if (duplicateUsername) {
    setError(userId, "userIdError", "This username already exists.");
    isValid = false;
  }

  const duplicateEmail = users.some((user) => {
    return (
      user.email.toLowerCase() === emailValue.toLowerCase() &&
      String(user.userID) !== editIndex.value
    );
  });

  if (duplicateEmail) {
    setError(userEmail, "userEmailError", "This email already exists.");
    isValid = false;
  }

  return isValid;
}

/* Submit form */
userForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!validateForm()) {
    showToast("Invalid input. Please fix the form.");
    return;
  }

  const userData = {
    username: userId.value.trim(),
    name: userName.value.trim(),
    email: userEmail.value.trim(),
    department: userDepartment.value.trim(),
    role: currentRole,
    status: userStatus.value
  };

  let method = "POST";

  if (editIndex.value === "") {
    userData.password = "User123";
  } else {
    method = "PUT";
    userData.userID = Number(editIndex.value);
    userData.password = "";
  }

  fetch(API_URL, {
    method: method,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(userData)
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        showToast(data.message);
        closeUserModal();
        loadUsers();
      } else {
        showToast(data.message || "Failed to save user.");
      }
    })
    .catch((error) => {
      console.error("Save user error:", error);
      showToast("Backend connection failed.");
    });
});

/* Edit user */
function editUser(id) {
  const user = users.find((item) => {
    return Number(item.userID) === Number(id);
  });

  if (!user) return;

  editIndex.value = user.userID;
  userId.value = user.username;
  userName.value = user.name;
  userEmail.value = user.email;
  userDepartment.value = user.department;
  userStatus.value = user.status;

  clearErrors();
  openModal("edit");
}

/* Delete user */
function deleteUser(id) {
  const confirmDelete = confirm("Are you sure you want to delete this user?");

  if (!confirmDelete) {
    return;
  }

  fetch(`${API_URL}?id=${id}`, {
    method: "DELETE"
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        showToast(data.message || "User deleted successfully.");
        loadUsers();
      } else {
        showToast(data.message || "Failed to delete user.");
      }
    })
    .catch((error) => {
      console.error("Delete user error:", error);
      showToast("Backend connection failed.");
    });
}

/* Toast message */
function showToast(message) {
  const toast = document.getElementById("toast");

  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2300);
}

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

/* Clear errors while typing */
[userId, userName, userEmail, userDepartment, userStatus].forEach((input) => {
  input.addEventListener("input", clearErrors);
  input.addEventListener("change", clearErrors);
});

/* Start page */
setupPageText();
loadUsers();
updateNotificationDot();