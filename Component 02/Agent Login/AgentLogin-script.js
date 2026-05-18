document.addEventListener('DOMContentLoaded', () => {
    const agentLoginForm = document.getElementById('agent-login-form');

    if (agentLoginForm) {
        agentLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('http://localhost:8080/login-agent', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const message = await response.text();

                if (message === "Login successful") {
                    alert("Welcome back, Agent!");
                    localStorage.setItem("userRole", "agent");
                    localStorage.setItem("loggedAgentEmail", email); // Saved for the profile update lookup
                    window.location.href = "../Agent Profile Update/AgentUpdate.html"; 
                } else {
                    alert(message);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Server connection failed.');
            }
        });
    }
});