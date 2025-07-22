document.addEventListener('DOMContentLoaded', () => {

    const emailInput = document.getElementById('email-input');
    const resultsContainer = document.getElementById('results-container');
    const placeholderMessage = document.getElementById('placeholder-message');

    let mailSettings = {};

    // Fetch mail settings data on load
    fetch('mail-settings.json')
        .then(response => response.json())
        .then(data => {
            mailSettings = data;
        })
        .catch(error => {
            console.error('Error fetching mail settings:', error);
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Could not load mail settings data!',
            });
        });

    // Listen for user typing in the email field
    emailInput.addEventListener('input', (e) => {
        const email = e.target.value.trim();
        const domain = email.includes('@') ? email.split('@')[1] : null;

        if (domain && mailSettings[domain]) {
            updateCards(mailSettings[domain]);
            resultsContainer.style.display = 'block';
            placeholderMessage.style.display = 'none';
        } else if (domain) {
            // If domain exists but not in our list, show default and a notification
            updateCards(mailSettings['default']);
            resultsContainer.style.display = 'block';
            placeholderMessage.style.display = 'none';

            // Use a timeout to avoid alerting on every keystroke
            clearTimeout(emailInput.debounce);
            emailInput.debounce = setTimeout(() => {
                Swal.fire({
                    icon: 'info',
                    title: 'Provider Not Found',
                    text: `Settings for "${domain}" are not in our database. Showing generic info.`,
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true
                });
            }, 500);

        } else {
            // Hide results if input is cleared or invalid
            resultsContainer.style.display = 'none';
            placeholderMessage.style.display = 'block';
        }
    });

    // Function to update the content of all cards
    function updateCards(providerData) {
        updateCardContent('imap', providerData);
        updateCardContent('pop3', providerData);
        updateCardContent('smtp', providerData);
    }

    // Function to update a single card's content
    function updateCardContent(type, data) {
        const cardElement = document.getElementById(`${type}-card`);
        if (!cardElement) return;

        // Update front of the card
        cardElement.querySelector('.card-provider-icon').src = data.iconUrl;
        cardElement.querySelector('.provider-name').textContent = data.providerName;
        const detailsList = cardElement.querySelector('.card-details');
        detailsList.innerHTML = ''; // Clear previous details

        const settings = data[type];
        for (const key in settings) {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${key}:</strong> ${settings[key]}`;
            detailsList.appendChild(li);
        }
        
        // Update back of the card
        const webmailLink = cardElement.querySelector('.webmail-link');
        webmailLink.href = data.webmailUrl;
    }

    // Add click listeners to all flip buttons
    const flipButtons = document.querySelectorAll('.flip-button');
    flipButtons.forEach(button => {
        button.addEventListener('click', () => {
            const flipCard = button.previousElementSibling; // The .flip-card element
            flipCard.classList.toggle('flipped');
        });
    });

    // Initialize Tippy.js tooltips
    tippy('[data-tippy-content]');

});