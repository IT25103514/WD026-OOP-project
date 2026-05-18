document.addEventListener("DOMContentLoaded", function () {
    loadAgents();

    // Logout button
    document.getElementById("logoutBtn").addEventListener("click", function () {
        if (confirm("Are you sure you want to logout?")) {
            alert("Logged out successfully!");
            // window.location.href = "admin-login.html";
        }
    });

    // Search filter
    document.getElementById("searchBox").addEventListener("keyup", function () {
        const query = this.value.toLowerCase();
        const rows  = document.querySelectorAll("#agentTable tr");
        rows.forEach(row => {
            const name = row.cells[0].innerText.toLowerCase();
            row.style.display = name.includes(query) ? "" : "none";
        });
    });

    // Close modal when clicking outside it
    window.addEventListener("click", (e) => {
        const modal = document.getElementById("editModal");
        if (e.target === modal) closeModal();
    });
});

// ─── LOAD ALL AGENTS ──────────────────────────────────────────────────────────
function loadAgents() {
    fetch("http://localhost:8080/api/agents")
        .then(res => res.json())
        .then(data => {
            const table = document.getElementById("agentTable");
            table.innerHTML = "";

            if (data.length === 0) {
                table.innerHTML = "<tr><td colspan='6' style='text-align:center; color:#aaa;'>No agents found.</td></tr>";
                return;
            }

            data.forEach(agent => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${agent.name || '—'}</td>
                    <td>${agent.email || '—'}</td>
                    <td>${agent.mobile || '—'}</td>
                    <td>${agent.serviceArea || '—'}</td>
                    <td>${agent.specializations || '—'}</td>
                    <td>
                        <button class="btn-edit" onclick="openEditModal(
                            '${escape(agent.email)}',
                            '${escape(agent.name)}',
                            '${escape(agent.mobile)}',
                            '${escape(agent.serviceArea)}',
                            '${escape(agent.specializations)}',
                            '${escape(agent.password)}'
                        )">
                            <i class="ri-edit-box-line"></i> Edit
                        </button>
                        <button class="btn-delete" onclick="deleteAgent('${agent.email}')">
                            <i class="ri-delete-bin-line"></i> Delete
                        </button>
                    </td>
                `;
                table.appendChild(row);
            });
        })
        .catch(() => {
            document.getElementById("agentTable").innerHTML =
                "<tr><td colspan='6' style='text-align:center; color:red;'>Backend Connection Error. Is Spring Boot running?</td></tr>";
        });
}

// ─── OPEN EDIT MODAL ─────────────────────────────────────────────────────────
function openEditModal(email, name, mobile, serviceArea, specialization, password) {
    document.getElementById("editEmailKey").value       = unescape(email);
    document.getElementById("editEmail").value          = unescape(email);
    document.getElementById("editName").value           = unescape(name);
    document.getElementById("editMobile").value         = unescape(mobile);
    document.getElementById("editPassword").value       = unescape(password);

    // Set dropdown values
    setDropdown("editServiceArea",    unescape(serviceArea));
    setDropdown("editSpecialization", unescape(specialization));

    document.getElementById("editModal").style.display = "block";
}

// Helper to set a select dropdown to a specific value
function setDropdown(id, value) {
    const select  = document.getElementById(id);
    const options = select.options;
    for (let i = 0; i < options.length; i++) {
        if (options[i].value === value) {
            select.selectedIndex = i;
            return;
        }
    }
    // If value not found in options (e.g. custom value from txt), add it
    const opt = document.createElement("option");
    opt.value = value;
    opt.text  = value;
    select.add(opt);
    select.value = value;
}

// ─── CLOSE MODAL ─────────────────────────────────────────────────────────────
function closeModal() {
    document.getElementById("editModal").style.display = "none";
    document.getElementById("editPassword").value = "";
}

// ─── PASSWORD SHOW / HIDE ─────────────────────────────────────────────────────
function togglePw() {
    const input = document.getElementById("editPassword");
    const eye   = document.getElementById("pwEye");
    if (input.type === "password") {
        input.type = "text";
        eye.classList.replace("ri-eye-line", "ri-eye-off-line");
    } else {
        input.type = "password";
        eye.classList.replace("ri-eye-off-line", "ri-eye-line");
    }
}

// ─── SAVE EDIT (PUT) ─────────────────────────────────────────────────────────
function saveEdit() {
    const email = document.getElementById("editEmailKey").value;

    const updatedData = {
        name:            document.getElementById("editName").value.trim(),
        mobile:          document.getElementById("editMobile").value.trim(),
        serviceArea:     document.getElementById("editServiceArea").value,
        specializations: document.getElementById("editSpecialization").value,
        password:        document.getElementById("editPassword").value,
        email:           email
    };

    // Basic validation
    if (!updatedData.name || !updatedData.mobile) {
        alert("Name and Mobile cannot be empty.");
        return;
    }

    fetch(`http://localhost:8080/api/agents/${email}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(updatedData)
    })
    .then(res => res.text())
    .then(msg => {
        alert(msg);
        closeModal();
        loadAgents();
    })
    .catch(() => alert("Server error. Could not update agent."));
}

// ─── DELETE AGENT ─────────────────────────────────────────────────────────────
function deleteAgent(email) {
    if (confirm(`Are you sure you want to delete agent: ${email}?`)) {
        fetch(`http://localhost:8080/api/agents/${email}`, { method: "DELETE" })
            .then(res => res.text())
            .then(msg => {
                alert(msg);
                loadAgents();
            })
            .catch(() => alert("Server error. Could not delete agent."));
    }
}
