/* ============================================================
   RealState.lk — Agent List Registry Fetcher & Client Filter
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    let allAgents = []; // Holds memory registry dataset fetched from server
    const agentContainer = document.getElementById('agentContainer');
    const searchInput = document.getElementById('searchInput');

    // ─── FETCH AGENTS FROM SPRING BOOT REST ENDPOINT ───
    function fetchAllAgents() {
        fetch('http://localhost:8080/api/agents')
            .then(response => {
                if (!response.ok) {
                    throw new Error("Could not pull storage data registry");
                }
                return response.json();
            })
            .then(data => {
                allAgents = data;
                renderAgentCards(allAgents);
            })
            .catch(error => {
                console.error("Fetch operational execution fault:", error);
                agentContainer.innerHTML = `<div class='no-results'>Error loading agent records. Please ensure your Spring Boot application backend server is active.</div>`;
            });
    }

    // ─── RENDER CARDS DYNAMICALLY ───
    function renderAgentCards(agentsList) {
        agentContainer.innerHTML = "";

        if (agentsList.length === 0) {
            agentContainer.innerHTML = `<div class='no-results'><i class="ri-user-search-line" style="font-size: 2rem;"></i><br>No matching agents discovered.</div>`;
            return;
        }

        agentsList.forEach(agent => {
            // Determine avatar target image path (Fall back to default placeholder avatar graphic if empty)
            const imagePath = agent.profilePicture && agent.profilePicture.trim() !== "" 
                ? `http://localhost:8080/${agent.profilePicture}` 
                : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";

            const name = agent.name || "Anonymous Agent";
            const specialization = agent.specializations || "General Consultant";
            const location = agent.serviceArea || "Sri Lanka";

            // Construct Card Block passing the email parameter to AgentDetails.html
            const cardHtml = `
                <div class="agent-card">
                    <div class="image-wrapper">
                        <img src="${imagePath}" alt="${name}" onerror="this.src='https://cdn-icons-png.flaticon.com/512/3135/3135715.png';">
                    </div>
                    <div class="agent-content">
                        <h2>${name}</h2>
                        <span class="badge"><i class="ri-landscape-line"></i> ${specialization}</span>
                        <p class="location"><i class="ri-map-pin-line"></i> ${location}</p>
                        <a href="../Agent View/AgentDetails.html?email=${encodeURIComponent(agent.email)}" class="btn-primary">
                            View Profile <i class="ri-arrow-right-line"></i>
                        </a>
                    </div>
                </div>
            `;
            agentContainer.insertAdjacentHTML('beforeend', cardHtml);
        });
    }

    // ─── LIVE FILTER SEARCH ACTION (NAME OR LOCATION) ───
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();

            const filteredAgents = allAgents.filter(agent => {
                const agentName = (agent.name || "").toLowerCase();
                const agentLocation = (agent.serviceArea || "").toLowerCase();

                // Intent Rule: Match if query hits either name string OR location string
                return agentName.includes(query) || agentLocation.includes(query);
            });

            renderAgentCards(filteredAgents);
        });
    }

    // Initialize execution pull
    fetchAllAgents();
});