document.addEventListener('DOMContentLoaded', () => {

    let serverSettingsData = {};

    fetch('settings.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            serverSettingsData = data;
            serverSettingsData['hotmail.com'] = serverSettingsData['outlook.com'];
            initializeApp();
        })
        .catch(error => {
            console.error('Error loading server settings:', error);
            document.getElementById('searchBtn').disabled = true;
            const emailInput = document.getElementById('emailInput');
            emailInput.disabled = true;
            emailInput.placeholder = "Could not load settings.";
            showError("The application failed to load configuration data. Please check the console or try again later.");
        });

    function initializeApp() {
        const emailForm = document.getElementById('emailForm');
        const searchBtn = document.getElementById('searchBtn');
        const resultsContainer = document.getElementById('resultsContainer');
        const errorContainer = document.getElementById('errorContainer');
        const emailInput = document.getElementById('emailInput');
        const resetBtn = document.getElementById('resetBtn'); // Get the reset button

        // --- EVENT LISTENERS ---
        emailForm.addEventListener('submit', handleSearch);
        document.addEventListener('click', handleCopyClick);
        resetBtn.addEventListener('click', resetSearch); // Add listener for reset button
        emailInput.addEventListener('input', toggleResetButton); // Add listener for typing in the input

        // --- FUNCTIONS ---
        function handleSearch(event) {
            event.preventDefault();
            setLoading(true);

            resultsContainer.classList.remove('visible');
            errorContainer.style.display = 'none';

            setTimeout(() => {
                const email = emailInput.value.trim().toLowerCase();
                const domain = email.split('@')[1];

                if (serverSettingsData[domain]) {
                    const settings = serverSettingsData[domain];
                    updateUI(settings);
                    resultsContainer.classList.add('visible');
                } else {
                    showError(`Sorry, we couldn't find settings for "${domain}". Please double-check the spelling or consult your provider's website.`);
                }
                setLoading(false);
            }, 500);
        }

        // --- NEW: Function to reset the search state ---
        function resetSearch() {
            emailInput.value = '';
            resultsContainer.classList.remove('visible');
            errorContainer.style.display = 'none';
            resetBtn.classList.add('d-none');
            emailInput.focus();
        }

        // --- NEW: Function to show/hide the reset button ---
        function toggleResetButton() {
            if (emailInput.value.length > 0) {
                resetBtn.classList.remove('d-none');
            } else {
                resetBtn.classList.add('d-none');
            }
        }
        
        function updateUI(settings) {
            document.getElementById('resultsHeader').textContent = `Settings for ${settings.provider}`;
            ['imap', 'pop3', 'smtp'].forEach(protocol => {
                const container = document.querySelector(`[data-protocol="${protocol}"]`);
                container.innerHTML = '';
                
                const details = settings[protocol];
                for (const key in details) {
                    const li = document.createElement('li');
                    li.className = 'list-group-item';
                    
                    const valueText = details[key];
                    const isHelpText = key === 'username' || key === 'password';
                    const canCopy = !isHelpText && valueText !== 'N/A' && valueText;

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
    }
    
    function showError(message) {
        document.getElementById('errorMessage').textContent = message;
        document.getElementById('errorContainer').style.display = 'block';
        document.getElementById('resultsContainer').classList.remove('visible');
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