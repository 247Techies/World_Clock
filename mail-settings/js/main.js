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
            initializeFlipLogic(); // Set up flip listeners once
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
            updateCards(mailSettings['default']);
            resultsContainer.style.display = 'block';
            placeholderMessage.style.display = 'none';

            clearTimeout(emailInput.debounce);
            emailInput.debounce = setTimeout(() => {
                Swal.fire({
                    icon: 'info',
                    title: 'Provider Not Found',
                    text: `Settings for "${domain}" are not in our database.`,
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true
                });
            }, 500);

        } else {
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

        // Always un-flip card when content changes
        cardElement.classList.remove('flipped');

        cardElement.querySelector('.card-provider-icon').src = data.iconUrl;
        cardElement.querySelector('.provider-name').textContent = data.providerName;
        const detailsList = cardElement.querySelector('.card-details');
        detailsList.innerHTML = '';

        const settings = data[type];
        for (const key in settings) {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${key}:</strong> ${settings[key]}`;
            detailsList.appendChild(li);
        }
        
        const webmailLink = cardElement.querySelector('.webmail-link');
        webmailLink.href = data.webmailUrl;
    }

    // CORRECTED: Set up two-way flip logic
    function initializeFlipLogic() {
        // 1. Handle flipping TO the back
        const flipButtons = document.querySelectorAll('.flip-button');
        flipButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                event.stopPropagation(); // Prevent event from bubbling up
                const flipCard = event.currentTarget.closest('.flip-card');
                if (flipCard) {
                    flipCard.classList.add('flipped');
                }
            });
        });

        // 2. Handle flipping FROM the back
        const cardBacks = document.querySelectorAll('.flip-card-back');
        cardBacks.forEach(cardBack => {
            cardBack.addEventListener('click', (event) => {
                // Clicking anywhere on the back (except the link itself) flips it
                if (event.target.closest('.webmail-link')) {
                    return; // Don't flip if they click the actual link icon
                }
                const flipCard = event.currentTarget.closest('.flip-card');
                if (flipCard) {
                    flipCard.classList.remove('flipped');
                }
            });
        });
    }

    // Initialize Tippy.js tooltips for any new content
    tippy('[data-tippy-content]');
});