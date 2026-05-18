document.addEventListener('DOMContentLoaded', () => {
    // 1. Isolate target email parameter from location url string context
    const urlParams = new URLSearchParams(window.location.search);
    const agentEmail = urlParams.get('email');

    // Simple mock check for the current logged-in user profile sessions
    // (If no logged user session is present, it defaults nicely to a mock test user)
    const loggedUserEmail = localStorage.getItem("loggedUserEmail") || "testbuyer@gmail.com";
    const loggedUserName = localStorage.getItem("loggedUserName") || "Anonymous Buyer";

    if (!agentEmail) {
        alert("No agent selected. Returning to main overview list.");
        window.location.href = "AgentsList.html";
        return;
    }

    // Initialize execution sequences
    loadAgentProfile();
    loadAgentReviews();

    // ─── FETCH AGENT STRUCT DETAILS ───
    async function loadAgentProfile() {
        try {
            const res = await fetch(`http://localhost:8080/api/agents/get-profile?email=${encodeURIComponent(agentEmail)}`);
            if (!res.ok) throw new Error();
            const agent = await res.json();

            document.getElementById('detailName').textContent = agent.name;
            document.getElementById('detailSpecialization').innerHTML = `<i class="ri-landscape-line"></i> ${agent.specializations || 'General Consultant'}`;
            document.getElementById('detailLocation').textContent = agent.serviceArea || 'Sri Lanka';
            document.getElementById('detailEmail').textContent = agent.email;
            document.getElementById('detailPhone').textContent = agent.mobile || 'Not Provided';

            if (agent.profilePicture) {
                document.getElementById('detailAvatar').src = `http://localhost:8080/${agent.profilePicture}`;
            }
        } catch (err) {
            console.error("Error drawing profile components:", err);
        }
    }

    // ─── FETCH REVIEWS STREAM FOR THIS AGENT EXCLUSIVELY ───
    async function loadAgentReviews() {
        const container = document.getElementById('reviewsContainer');
        try {
            const res = await fetch(`http://localhost:8080/api/reviews?agentEmail=${encodeURIComponent(agentEmail)}`);
            const reviews = await res.json();
            container.innerHTML = "";

            if (reviews.length === 0) {
                container.innerHTML = `<p class="empty-feed">No reviews shared for this agent yet. Be the first to leave one!</p>`;
                return;
            }

            reviews.forEach(rev => {
                let stars = "⭐".repeat(parseInt(rev.rating || 5));
                
                // Ownership check condition string compilation
                let actionControls = "";
                if (rev.userEmail && rev.userEmail.toLowerCase() === loggedUserEmail.toLowerCase()) {
                    actionControls = `
                        <div class="review-actions">
                            <button class="btn-edit-rev" onclick="editReviewInline('${rev.id}', '${rev.comment}', '${rev.rating}')"><i class="ri-edit-line"></i> Edit</button>
                            <button class="btn-delete-rev" onclick="deleteReview('${rev.id}')"><i class="ri-delete-bin-line"></i> Delete</button>
                        </div>
                    `;
                }

                const card = `
                    <div class="review-card" id="rev-${rev.id}">
                        <div class="review-card-top">
                            <div class="reviewer-identity">
                                <h4>${rev.userName || 'Verified Client'}</h4>
                                <small>${rev.userEmail}</small>
                            </div>
                            <div class="review-stars">${stars}</div>
                        </div>
                        <p class="review-text">${rev.comment}</p>
                        ${actionControls}
                    </div>
                `;
                container.insertAdjacentHTML('beforeend', card);
            });

        } catch (err) {
            container.innerHTML = `<p class="empty-feed">Error pulling evaluation records folder stream.</p>`;
        }
    }

    // ─── HANDLE SUBMIT NEW REVIEW FORM ───
    document.getElementById('reviewForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const rating = document.getElementById('reviewRating').value;
        const comment = document.getElementById('reviewComment').value.trim();

        const payload = {
            agentEmail: agentEmail,
            userEmail: loggedUserEmail,
            userName: loggedUserName,
            rating: rating,
            comment: comment
        };

        try {
            const res = await fetch('http://localhost:8080/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                document.getElementById('reviewComment').value = "";
                loadAgentReviews();
            }
        } catch (err) {
            alert("Network connection failure writing down records.");
        }
    });

    // ─── DELETE REVIEW ───
    window.deleteReview = async (id) => {
        if (!confirm("Are you sure you want to remove this feedback note?")) return;
        try {
            const res = await fetch(`http://localhost:8080/api/reviews/${id}`, { method: 'DELETE' });
            if (res.ok) loadAgentReviews();
        } catch (err) {
            alert("Error running clear commands operations.");
        }
    };

    // ─── INLINE EDIT INVOCATION ───
    window.editReviewInline = (id, oldText, oldRating) => {
        const newText = prompt("Update your review comment:", oldText);
        if (newText === null || newText.trim() === "") return;

        const payload = {
            rating: oldRating,
            comment: newText.trim()
        };

        fetch(`http://localhost:8080/api/reviews/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(res => {
            if (res.ok) loadAgentReviews();
        });
    };

    // Appointment button interaction trigger alert setup
    document.getElementById('appointmentBtn').addEventListener('click', () => {
        alert(`Opening booking scheduler sequence workspace for: ${document.getElementById('detailName').textContent}`);
    });
});