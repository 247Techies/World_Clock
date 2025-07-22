document.addEventListener('DOMContentLoaded', () => {

    const lookupForm = document.getElementById('lookup-form');
    const emailInput = document.getElementById('email-input');
    const resultsContainer = document.getElementById('results-container');
    const flipButtons = document.querySelectorAll('.flip-btn');

    lookupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = emailInput.value.trim();
        if (!email || !email.includes('@')) {
            Swal.fire({ icon: 'error', title: 'Invalid Email', text: 'Please enter a valid email address.' });
            return;
        }
        const domain = email.split('@')[1].toLowerCase();
        try {
            const response = await fetch('mail-settings.json');
            if (!response.ok) throw new Error('Could not load settings file.');
            const settingsData = await response.json();
            const providerSettings = settingsData[domain] || settingsData['default'];
            if (providerSettings === settingsData['default']) {
                Swal.fire({ icon: 'info', title: 'Provider Not Found', text: `We don't have specific settings for "${domain}", but here are the common default settings.` });
            }
            updateCards(providerSettings);
        } catch (error) {
            console.error('Fetch Error:', error);
            Swal.fire({ icon: 'error', title: 'Oops...', text: 'Something went wrong while fetching the settings!' });
        }
    });

    flipButtons.forEach(button => {
        button.addEventListener('click', () => {
            const cardContainer = button.closest('.card-wrapper').querySelector('.flip-card-container');
            cardContainer.classList.toggle('flipped');
        });
    });

    function updateCards(settings) {
        document.querySelectorAll('.flip-card-container.flipped').forEach(c => c.classList.remove('flipped'));
        updateCardContent('imap', settings.imap, settings);
        updateCardContent('pop3', settings.pop3, settings);
        updateCardContent('smtp', settings.smtp, settings);
        resultsContainer.classList.remove('d-none');
    }

    function updateCardContent(protocol, data, providerSettings) {
        const contentElement = document.getElementById(`${protocol}-card`);
        const cardWrapper = contentElement.closest('.card-wrapper');
        const flipButton = cardWrapper.querySelector('.flip-btn');

        if (!data) {
            cardWrapper.classList.add('protocol-disabled');
            flipButton.disabled = true;
            return;
        }

        cardWrapper.classList.remove('protocol-disabled');
        flipButton.disabled = false;
        
        contentElement.querySelector('.card-title').textContent = `Incoming Mail (${protocol.toUpperCase()})`;
        if (protocol === 'smtp') {
            contentElement.querySelector('.card-title').textContent = `Outgoing Mail (SMTP)`;
        }
        contentElement.querySelector('.card-logo').src = providerSettings.logo;
        
        const list = contentElement.querySelector('.settings-list');
        list.innerHTML = `
            <li><strong>Server:</strong> ${data.server || 'N/A'}</li>
            <li><strong>Port:</strong> ${data.port || 'N/A'}</li>
            <li><strong>Security:</strong> ${data.security || 'N/A'}</li>
            <li><strong>Requires auth:</strong> ${data.auth ? 'Yes' : 'No'}</li>
            <li><strong>Username:</strong> ${data.username || 'N/A'}</li>
            <li><strong>Password:</strong> ${data.password || 'N/A'}</li>
        `;
        
        const backContent = cardWrapper.querySelector('.card-content-back');
        backContent.setAttribute('onclick', `window.open('${providerSettings.webmail}', '_blank')`);
    }
});