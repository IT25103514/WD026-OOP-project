document.addEventListener('DOMContentLoaded', () => {
    const loggedAgentEmail = localStorage.getItem("loggedAgentEmail");

    if (!loggedAgentEmail) {
        alert("Session expired or access denied. Please login as an agent.");
        window.location.href = "../Agent Login/Agent Login.html";
        return;
    }

    loadAgentProfileData(loggedAgentEmail);
    initializePhotoUploader();
    initializeLogoutHandler();

    const form = document.getElementById('agentUpdateForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await saveAgentProfileData();
        });
    }
});

// Load Profile Content Fields from API
async function loadAgentProfileData(email) {
    try {
        const response = await fetch(`http://localhost:8080/api/agents/get-profile?email=${encodeURIComponent(email)}`);
        if (!response.ok) {
            showBanner("Failed to retrieve agent records from storage file.", "error");
            return;
        }

        const agent = await response.json();

        // Assign basic data inputs
        document.getElementById('agentName').value = agent.name || '';
        document.getElementById('agentMobile').value = agent.mobile || '';
        document.getElementById('agentEmail').value = agent.email || '';
        document.getElementById('agentPassword').value = agent.password || ''; 
        document.getElementById('profilePicUrl').value = agent.profilePicture || '';

        // Select matching option value inside drop-down lists
        if (agent.serviceArea) {
            document.getElementById('agentArea').value = agent.serviceArea;
        }
        if (agent.specializations) {
            document.getElementById('agentSpec').value = agent.specializations;
        }

        // Setting Left Side Preview Cards
        document.getElementById('summaryName').textContent = agent.name || 'Agent User';
        document.getElementById('summaryEmail').textContent = agent.email || '';

        updateAvatarDisplay(agent.profilePicture, agent.name);

    } catch (err) {
        console.error(err);
        showBanner("Could not establish a connection to file storage system.", "error");
    }
}

// Render Profile Picture Elements
function updateAvatarDisplay(path, name) {
    const imgEl = document.getElementById('avatarPreview');
    if (path) {
        imgEl.src = `http://localhost:8080/${path}?t=${new Date().getTime()}`;
    } else {
        const initials = encodeURIComponent(name || 'Agent');
        imgEl.src = `https://ui-avatars.com/api/?name=${initials}&background=2D1D13&color=FFF7F2&size=150`;
    }
}

// Save Updated Form Contents (Includes Drops and Modified Passwords)
async function saveAgentProfileData() {
    const saveBtn = document.getElementById('saveBtn');
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="ri-loader-2-line"></i> Saving Updates...';

    const agentPayload = {
        name: document.getElementById('agentName').value.trim(),
        mobile: document.getElementById('agentMobile').value.trim(),
        email: document.getElementById('agentEmail').value.trim(),
        serviceArea: document.getElementById('agentArea').value,
        specializations: document.getElementById('agentSpec').value,
        password: document.getElementById('agentPassword').value.trim(), 
        profilePicture: document.getElementById('profilePicUrl').value
    };

    try {
        const response = await fetch('http://localhost:8080/api/agents/update-profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(agentPayload)
        });

        if (response.ok) {
            document.getElementById('summaryName').textContent = agentPayload.name;
            updateAvatarDisplay(agentPayload.profilePicture, agentPayload.name);
            showBanner("✓ Agent records updated successfully!", "success");
        } else {
            const txt = await response.text();
            showBanner("Failed to save changes: " + txt, "error");
        }
    } catch (err) {
        showBanner("Error communicating changes to backend server.", "error");
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="ri-save-3-line"></i> Save Changes';
    }
}

// Multi-part Profile Photo Uploader
function initializePhotoUploader() {
    const fileInput = document.getElementById('imgInput');
    const statusText = document.getElementById('uploadStatusText');

    if (!fileInput) return;

    fileInput.addEventListener('change', async (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        statusText.textContent = "Uploading asset...";
        
        const formResource = new FormData();
        formResource.append("file", selectedFile);
        formResource.append("email", document.getElementById('agentEmail').value);

        try {
            const uploadResponse = await fetch('http://localhost:8080/api/agents/upload-avatar', {
                method: 'POST',
                body: formResource
            });

            if (uploadResponse.ok) {
                const relativePath = await uploadResponse.text();
                document.getElementById('profilePicUrl').value = relativePath;
                updateAvatarDisplay(relativePath, document.getElementById('agentName').value);
                statusText.textContent = "✓ Avatar uploaded successfully.";
            } else {
                statusText.textContent = "Upload rejected by server configuration.";
            }
        } catch (err) {
            statusText.textContent = "Network file transmission fault experienced.";
        }
    });
}

// Eye icon password view/hide toggle logic
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('agentPassword');
    const toggleIcon = document.getElementById('togglePasswordIcon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.classList.replace('ri-eye-line', 'ri-eye-off-line');
    } else {
        passwordInput.type = 'password';
        toggleIcon.classList.replace('ri-eye-off-line', 'ri-eye-line');
    }
}

// Logout session cleanup workflow 
function initializeLogoutHandler() {
    const logoutButton = document.getElementById('logoutBtn');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            if (confirm("Are you sure you want to log out from Agent Workspace?")) {
                localStorage.removeItem("loggedAgentEmail");
                localStorage.removeItem("userRole");
                alert("Logged out successfully.");
                window.location.href = "../Agent Profile Update/AgentUpdate.html";
            }
        });
    }
}

function showBanner(msg, type) {
    const b = document.getElementById('saveBanner');
    b.textContent = msg;
    b.className = `save-banner ${type}`;
    b.style.display = 'block';
    if (type === 'success') {
        setTimeout(() => b.style.display = 'none', 4000);
    }
}