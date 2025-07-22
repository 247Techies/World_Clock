document.addEventListener('DOMContentLoaded', () => {

    const lookupForm = document.getElementById('lookup-form');
    const emailInput = document.getElementById('email-input');
    const resultsContainer = document.getElementById('results-container');
    const flipButtons = document.querySelectorAll('.flip-btn');

    // --- FORM SUBMISSION ---
    lookupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = emailInput.value.trim();

        if (!email || !email.includes('@')) {
            Swal.fire({
                icon: 'error',
                title: 'Invalid Email',
                text: 'Please enter a valid email address.',
            });
            return;
        }

        const domain = email.split('@')[1].toLowerCase();
        
        try {
            const response = await fetch('mail-settings.json');
            if (!response.ok) throw new Error('Could not load settings file.');
            
            const settingsData = await response.json();
            const providerSettings = settingsData[domain] || settingsData['default'];

            if (providerSettings === settingsData['default']) {
                 Swal.fire({
                    icon: 'info',
                    title: 'Provider Not Found',
                    text: `We don't have specific settings for "${domain}", but here are the common default settings.`,
                });
            }
            
            updateCards(providerSettings);
            
        } catch (error) {
            console.error('Fetch Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Something went wrong while fetching the settings!',
            });
        }
    });

    // --- CARD FLIP LOGIC ---
    flipButtons.forEach(button => {
        button.addEventListener('click', () => {
            const cardContainer = button.closest('.col-md-4').querySelector('.flip-card-container');
            cardContainer.classList.toggle('flipped');
        });
    });

    // --- FUNCTION TO UPDATE CARDS WITH DATA ---
    function updateCards(settings) {
        // Un-flip all cards before showing new data
        document.querySelectorAll('.flip-card-container.flipped').forEach(c => c.classList.remove('flipped'));

        // Update each card (IMAP, POP3, SMTP)
        updateCardContent('imap', settings.imap, settings);
        updateCardContent('pop3', settings.pop3, settings);
        updateCardContent('smtp', settings.smtp, settings);

        // Show the results container
        resultsContainer.classList.remove('d-none');
    }

    // --- HELPER FUNCTION TO POPULATE A SINGLE CARD ---
    function updateCardContent(protocol, data, providerSettings) {
        const cardContainer = document.getElementById(`${protocol}-card`).closest('.col-md-4');
        const flipCardContainer = cardContainer.querySelector('.flip-card-container');
        const flipButton = cardContainer.querySelector('.flip-btn');

        // Handle protocols that might not be available (e.g., POP3 for Outlook)
        if (!data) {
            flipCardContainer.classList.add('protocol-disabled');
            flipButton.disabled = true;
            return;
        }

        // Re-enable if it was previously disabled
        flipCardContainer.classList.remove('protocol-disabled');
        flipButton.disabled = false;

        // Update front of the card
        const cardElement = document.getElementById(`${protocol}-card`);
        cardElement.querySelector('.card-title').textContent = `Incoming Mail (${protocol.toUpperCase()})`;
        if (protocol === 'smtp') {
            cardElement.querySelector('.card-title').textContent = `Outgoing Mail (SMTP)`;
        }
        cardElement.querySelector('.card-logo').src = providerSettings.logo;
        
        const list = cardElement.querySelector('.settings-list');
        list.innerHTML = `
            <li><strong>Server:</strong> ${data.server || 'N/A'}</li>
            <li><strong>Port:</strong> ${data.port || 'N/A'}</li>
            <li><strong>Security:</strong> ${data.security || 'N/A'}</li>
            <li><strong>Requires auth:</strong> ${data.auth ? 'Yes' : 'No'}</li>
            <li><strong>Username:</strong> ${data.username || 'N/A'}</li>
            <li><strong>Password:</strong> ${data.password || 'N/A'}</li>
        `;

        // Update back of the card
        const backLink = cardContainer.querySelector('.flip-card-back');
        backLink.setAttribute('onclick', `window.open('${providerSettings.webmail}', '_blank')`);
    }
});