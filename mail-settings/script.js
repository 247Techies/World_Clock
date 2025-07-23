document.addEventListener('DOMContentLoaded', () => {

    // --- DATA STORE ---
    // Data is now embedded directly in the script for simplicity and to avoid server requirements.
    const serverSettings = {
        'gmail.com': {
            provider: 'Google Gmail',
            imap: { server: 'imap.gmail.com', port: '993', security: 'SSL / TLS', username: 'Your full Gmail address', password: 'Your Gmail password or App Password' },
            pop3: { server: 'pop.gmail.com', port: '995', security: 'SSL / TLS', username: 'Your full Gmail address', password: 'Your Gmail password or App Password' },
            smtp: { server: 'smtp.gmail.com', port: '465 or 587', security: 'SSL / TLS or STARTTLS', authentication: 'Yes', username: 'Your full Gmail address', password: 'Your Gmail password or App Password' }
        },
        'outlook.com': {
            provider: 'Microsoft Outlook',
            imap: { server: 'outlook.office365.com', port: '993', security: 'SSL / TLS', username: 'Your full Outlook address', password: 'Your Microsoft account password' },
            pop3: { server: 'outlook.office365.com', port: '995', security: 'SSL / TLS', username: 'Your full Outlook address', password: 'Your Microsoft account password' },
            smtp: { server: 'smtp.office365.com', port: '587', security: 'STARTTLS', authentication: 'Yes', username: 'Your full Outlook address', password: 'Your Microsoft account password' }
        },
        'yahoo.com': {
            provider: 'Yahoo Mail',
            imap: { server: 'imap.mail.yahoo.com', port: '993', security: 'SSL / TLS', username: 'Your full Yahoo address', password: 'Your Yahoo App Password' },
            pop3: { server: 'pop.mail.yahoo.com', port: '995', security: 'SSL / TLS', username: 'Your full Yahoo address', password: 'Your Yahoo App Password' },
            smtp: { server: 'smtp.mail.yahoo.com', port: '465 or 587', security: 'SSL / TLS', authentication: 'Yes', username: 'Your full Yahoo address', password: 'Your Yahoo App Password' }
        },
        'icloud.com': {
            provider: 'Apple iCloud Mail',
            imap: { server: 'imap.mail.me.com', port: '993', security: 'SSL / TLS', username: 'Your full iCloud address', password: 'An app-specific password' },
            pop3: { server: 'Not Recommended by Apple', port: 'N/A', security: 'N/A', username: 'N/A', password: 'N/A' },
            smtp: { server: 'smtp.mail.me.com', port: '587', security: 'STARTTLS', authentication: 'Yes', username: 'Your full iCloud address', password: 'An app-specific password' }
        }
    };
    // Add aliases for common domains
    serverSettings['hotmail.com'] = serverSettings['outlook.com'];
    serverSettings['aol.com'] = { // Simplified AOL entry as an example
            provider: 'AOL Mail',
            imap: { server: 'imap.aol.com', port: '993', security: 'SSL / TLS', username: 'Your full AOL address', password: 'Your AOL password or App Password' },
            pop3: { server: 'pop.aol.com', port: '995', security: 'SSL / TLS', username: 'Your full AOL address', password: 'Your AOL password or App Password' },
            smtp: { server: 'smtp.aol.com', port: '465', security: 'SSL / TLS', authentication: 'Yes', username: 'Your full AOL address', password: 'Your AOL password or App Password' }
    };


    // --- DOM ELEMENTS ---
    const emailForm = document.getElementById('emailForm');
    const emailInput = document.getElementById('emailInput');
    const searchBtn = document.getElementById('searchBtn');
    const resultsContainer = document.getElementById('resultsContainer');
    const errorContainer = document.getElementById('errorContainer');

    // --- EVENT LISTENERS ---
    emailForm.addEventListener('submit', handleSearch);
    document.addEventListener('click', handleCopyClick);

    // --- FUNCTIONS ---
    function handleSearch(event) {
        event.preventDefault();
        setLoading(true);

        // Hide previous results
        resultsContainer.classList.remove('visible');
        errorContainer.style.display = 'none';

        setTimeout(() => { // Simulate a slight delay for better UX
            const email = emailInput.value.trim().toLowerCase();
            const domain = email.split('@')[1];

            if (serverSettings[domain]) {
                const settings = serverSettings[domain];
                updateUI(settings);
                resultsContainer.classList.add('visible');
            } else {
                showError(`Sorry, we couldn't find settings for "${domain}". Please double-check the spelling or consult your provider's website.`);
            }
            setLoading(false);
        }, 500); // 0.5-second delay
    }

    function updateUI(settings) {
        document.getElementById('resultsHeader').textContent = `Settings for ${settings.provider}`;
        
        ['imap', 'pop3', 'smtp'].forEach(protocol => {
            const container = document.querySelector(`[data-protocol="${protocol}"]`);
            container.innerHTML = ''; // Clear previous content
            
            const details = settings[protocol];
            for (const key in details) {
                const li = document.createElement('li');
                li.className = 'list-group-item';
                
                const valueText = details[key];
                const isHelpText = key === 'username' || key === 'password';
                const canCopy = !isHelpText && valueText !== 'N/A';

                li.innerHTML = `
                    <strong>${key.replace('_', ' ')}:</strong>
                    <span class="setting-value">
                        <span class="text ${isHelpText ? 'help-text' : ''}" data-copy-key="${protocol}-${key}">${valueText}</span>
                        ${canCopy ? `<button class="copy-btn" data-target-key="${protocol}-${key}"><i class="far fa-copy"></i></button>` : ''}
                    </span>
                `;
                container.appendChild(li);
            }
        });
    }

    function showError(message) {
        document.getElementById('errorMessage').textContent = message;
        errorContainer.style.display = 'block';
    }

    function setLoading(isLoading) {
        const btnText = searchBtn.querySelector('.btn-text');
        const spinner = searchBtn.querySelector('.spinner-border');

        if (isLoading) {
            searchBtn.disabled = true;
            btnText.classList.add('d-none');
            spinner.classList.remove('d-none');
        } else {
            searchBtn.disabled = false;
            btnText.classList.remove('d-none');
            spinner.classList.add('d-none');
        }
    }

    function handleCopyClick(event) {
        const button = event.target.closest('.copy-btn');
        if (!button) return;

        const targetKey = button.dataset.targetKey;
        const textElement = document.querySelector(`[data-copy-key="${targetKey}"]`);
        
        if (textElement) {
            navigator.clipboard.writeText(textElement.textContent).then(() => {
                const originalIcon = button.innerHTML;
                button.innerHTML = '<i class="fas fa-check" style="color: #28a745;"></i>';
                setTimeout(() => {
                    button.innerHTML = originalIcon;
                }, 1500);
            });
        }
    }
});