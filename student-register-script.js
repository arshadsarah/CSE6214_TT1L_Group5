document.addEventListener("DOMContentLoaded", function () {
    const registerForm = document.getElementById("studentRegisterForm");
    const registerMessage = document.getElementById("registerMessage");
    const params = new URLSearchParams(window.location.search);
    const errorMessage = params.get("error");

    if (errorMessage) {
        showMessage(errorMessage, "error");
    }

  registerForm.addEventListener("submit", function (event) {
        const name = document.getElementById("name").value.trim();
        const username = document.getElementById("username").value.trim();
        const email = document.getElementById("email").value.trim();
        const department = document.getElementById("department").value.trim();
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirm_password").value;

    hideMessage();

    //Check empty fields
    if (
        name === "" ||
        username === "" ||
        email === "" ||
        department === "" ||
        password === "" ||
        confirmPassword === ""
    ) {
        event.preventDefault();
        showMessage("Please fill in all required fields.", "error");
        return;
    }

    //Check email format
    if (!validateEmail(email)) {
        event.preventDefault();
        showMessage("Please enter a valid email address.", "error");
        return;
    }

    //Check password length
    if (password.length < 8) {
        event.preventDefault();
        showMessage("Password must be at least 8 characters long.", "error");
        return;
    }

    const usernamePattern = /^[A-Za-z0-9._]{3,30}$/;

    if (!usernamePattern.test(username)) {
        event.preventDefault();
        showMessage("Username must be 3-30 characters and can only contain letters, numbers, dot or underscore.", "error");
        return;
    }

    const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d).+$/;

    if (!passwordPattern.test(password)) {
        event.preventDefault();
        showMessage("Password must include at least one letter and one number.", "error");
        return;
    }

    //Check password match
    if (password !== confirmPassword) {
        event.preventDefault();
        showMessage("Passwords do not match.", "error");
        return;
    }

    //If all validation passes, allow form to submit to PHP
  });

    function showMessage(message, type) {
        registerMessage.textContent = message;
        registerMessage.classList.remove("hidden", "message-success", "message-error");

        if (type === "success") {
            registerMessage.classList.add("message-success");
        } else {
            registerMessage.classList.add("message-error");
        }
    }

    function hideMessage() {
        registerMessage.textContent = "";
        registerMessage.classList.add("hidden");
        registerMessage.classList.remove("message-success", "message-error");
    }

    function validateEmail(email) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(email);
    }
});