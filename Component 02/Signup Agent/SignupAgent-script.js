document.addEventListener('DOMContentLoaded', () => {

    const agentForm = document.getElementById('agent-signup-form');

    if (agentForm) {
        agentForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // 1. Capture all values from the form
            const name = document.getElementById('name').value;
            const mobile = document.getElementById('mobile').value;
            const email = document.getElementById('email').value;
            const serviceArea = document.getElementById('service-area').value;
            const specializations = document.getElementById('specializations').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;

            // 2. Validation
            if (password !== confirmPassword) {
                alert('Passwords do not match!');
                return;
            }

            // 3. Prepare data for Agent.java
            const agentData = {
                name,
                mobile,
                email,
                serviceArea,
                specializations,
                password
            };

            try {
                // 4. Send to the specific Agent Controller endpoint
                const response = await fetch('http://localhost:8080/register-agent', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(agentData)
                });

                const result = await response.text();

                if (response.ok) {
                    alert('Agent Registered Successfully! You can now log in.');
                    agentForm.reset();
                    // Redirect to your Agent Login page
                    window.location.href = "../Agent Login/Agent Login.html";
                } else {
                    alert('Error: ' + result);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Could not connect to the server. Make sure your Spring Boot app is running.');
            }
        });
    }
});