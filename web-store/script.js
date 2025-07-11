document.addEventListener('DOMContentLoaded', () => {

    // --- DATA: Define your extensions here ---
    const extensions = [
        {
            id: '247-support-center',
            name: '24/7 Support Center',
            version: '1.0',
            tagline: 'Click to view our 24/7 support contact information in a clean modal.',
            description: 'Get instant access to our 24/7 support channels without ever leaving your current tab. This lightweight extension places all our contact information—phone, email, and live chat—into a clean, non-intrusive modal. No more searching through websites; help is always just one click away.',
            icon: 'https://raw.githubusercontent.com/247Techies/World_Clock/39dc379c1a9488d6f78d8a99ef977c29e9e18962/web-store/MyExtentions/247-Info-Modal/icons/icon128.png',
            bannerImage: 'https://raw.githubusercontent.com/247Techies/World_Clock/b493e9d20ea6c1cf6f81f4565efcadcc466da861/web-store/MyExtentions/247-Info-Modal/icons/247SupportCenter.png', // Using icon as banner for now
            downloadLink: 'https://downgit.github.io/#/home?url=https://github.com/247Techies/World_Clock/tree/main/web-store/MyExtentions/247-Info-Modal'
        }, // <-- Make sure you add this comma after the previous extension
        {
            id: 'customer-info-modal',
            name: 'Customer Info Modal',
            version: '1.0',
            tagline: 'Select a name and date on a page to generate a customer support modal.',
            description: 'Streamline your customer support workflow by instantly capturing key client details from any webpage. Simply highlight a customer\'s name and a relevant date, and this extension generates a convenient modal, perfect for logging interactions or creating support tickets without switching contexts.',
            icon: 'https://raw.githubusercontent.com/247Techies/World_Clock/2097ad478295703a0c9886b406ee0917b10b6c67/web-store/MyExtentions/CX-Renew-VM/icons/icon128.png',
            bannerImage: 'https://raw.githubusercontent.com/247Techies/World_Clock/2097ad478295703a0c9886b406ee0917b10b6c67/web-store/MyExtentions/CX-Renew-VM/icons/icon128.png', // Using icon as banner for now
            downloadLink: 'https://download-directory.github.io/?url=https://github.com/247Techies/World_Clock/tree/main/web-store/MyExtentions/CX-Renew-VM'
        }, // <-- Make sure you add this comma after the previous extension
        {
            id: 'cx-follow-up-reminder',
            name: 'CX Follow-up Reminder',
            version: '1.4',
            tagline: 'A reminder extension for customer follow-ups with countdowns and sound alerts.',
            description: 'Never miss a crucial customer follow-up again. This essential tool allows you to set timed reminders directly in your browser. Track pending tasks with a visual countdown timer and receive audible alerts, ensuring timely communication and boosting customer satisfaction.',
            icon: 'https://raw.githubusercontent.com/247Techies/World_Clock/a57026c756a98ea9b93389c67959eae339477828/web-store/MyExtentions/CX-Reminder/images/icon128.png',
            bannerImage: 'https://raw.githubusercontent.com/247Techies/World_Clock/a57026c756a98ea9b93389c67959eae339477828/web-store/MyExtentions/CX-Reminder/images/icon128.png', // Using icon as banner for now
            downloadLink: 'https://download-directory.github.io/?url=https://github.com/247Techies/World_Clock/tree/main/web-store/MyExtentions/CX-Reminder'
        }, // <-- Make sure you add this comma after the previous extension
        {
            id: 'proper-case-capitalizer',
            name: 'Proper Case Capitalizer',
            version: '1.0',
            tagline: 'Changes the text in an input field to Proper Case capitalization.',
            description: 'Instantly format text to perfect Proper Case with a single click. This handy tool ensures that names, titles, and sentences are capitalized correctly, saving you time on manual edits and enhancing the professionalism of your writing in forms, emails, and documents.',
            icon: 'https://raw.githubusercontent.com/247Techies/World_Clock/a57026c756a98ea9b93389c67959eae339477828/web-store/MyExtentions/Case-Changer/icons/icon128.png',
            bannerImage: 'https://raw.githubusercontent.com/247Techies/World_Clock/a57026c756a98ea9b93389c67959eae339477828/web-store/MyExtentions/Case-Changer/icons/icon128.png', // Using icon as banner for now
            downloadLink: 'https://download-directory.github.io/?url=https://github.com/247Techies/World_Clock/tree/main/web-store/MyExtentions/Case-Changer'
        }, // <-- Make sure you add this comma after the previous extension
        {
            id: 'safe-close-modal',
            name: 'Safe Close with Custom Modal',
            version: '1.1',
            tagline: 'Click the icon to show a custom modal with a summary before closing Chrome.',
            description: 'Avoid accidentally closing your browser and losing your work. This extension provides a final confirmation screen, summarizing your session, before you exit Chrome. A simple but powerful safety net for your browsing.',
            icon: 'https://raw.githubusercontent.com/247Techies/World_Clock/302ea533e2f9132d2b65c475bbacd688ce937422/web-store/MyExtentions/Close-with-Confirm/icons/icon128.png',
            bannerImage: 'https://raw.githubusercontent.com/247Techies/World_Clock/302ea533e2f9132d2b65c475bbacd688ce937422/web-store/MyExtentions/Close-with-Confirm/icons/icon128.png',
            downloadLink: 'https://download-directory.github.io/?url=https://github.com/247Techies/World_Clock/tree/main/web-store/MyExtentions/Close-with-Confirm'
        },
        {
            id: 'unlock-fields',
            name: 'Unlock Fields',
            version: '1.1',
            tagline: 'When clicked, allows all textarea fields on the current page to be resized.',
            description: 'Take back control of web forms. This extension unlocks any fixed-size text area, allowing you to freely resize it to fit your content. Perfect for writing long comments or detailed messages without being constrained by poorly designed websites.',
            icon: 'https://raw.githubusercontent.com/247Techies/World_Clock/302ea533e2f9132d2b65c475bbacd688ce937422/web-store/MyExtentions/Unlock-Fields/icons/small.png',
            bannerImage: 'https://raw.githubusercontent.com/247Techies/World_Clock/302ea533e2f9132d2b65c475bbacd688ce937422/web-store/MyExtentions/Unlock-Fields/icons/small.png',
            downloadLink: 'https://download-directory.github.io/?url=https://github.com/247Techies/World_Clock/tree/main/web-store/MyExtentions/Unlock-Fields'
        },
        {
            id: 'web-page-sticky-notes',
            name: 'Web Page Sticky Notes',
            version: '1.8',
            tagline: 'Add a closeable and persistent sticky note to any webpage via the right-click menu.',
            description: 'Leave digital sticky notes on any website. With a simple right-click, you can add a personal note that persists even after you close and reopen the page. It\'s the perfect way to jot down reminders, annotate articles, or save temporary information exactly where you need it.',
            icon: 'https://raw.githubusercontent.com/247Techies/World_Clock/302ea533e2f9132d2b65c475bbacd688ce937422/web-store/MyExtentions/Sticky-Notes/images/icon16.png',
            bannerImage: 'https://raw.githubusercontent.com/247Techies/World_Clock/302ea533e2f9132d2b65c475bbacd688ce937422/web-store/MyExtentions/Sticky-Notes/images/icon16.png',
            downloadLink: 'https://download-directory.github.io/?url=https://github.com/247Techies/World_Clock/tree/main/web-store/MyExtentions/Sticky-Notes'
        }
    ];

    // --- DOM Elements ---
    const featuredImage = document.getElementById('featured-image');
    const featuredTitle = document.getElementById('featured-title');
    const featuredDescription = document.getElementById('featured-description');
    const featuredDownloadLink = document.getElementById('featured-download-link');
    const extensionGrid = document.getElementById('extension-grid');

    // --- Functions ---

    /**
     * Updates the main banner with data from a specific extension.
     * @param {object} extension - The extension object from the `extensions` array.
     */
    function updateBanner(extension) {
        featuredImage.src = extension.bannerImage;
        featuredImage.alt = `${extension.name} banner`;
        // featuredImage.style.objectFit = 'contain'; // Use 'contain' so the small icon isn't stretched
        // featuredImage.style.padding = '40px'; // Add some padding around the icon in the banner
        featuredTitle.textContent = extension.name;
        featuredDescription.textContent = extension.description;
        featuredDownloadLink.href = extension.downloadLink;
    }

    /**
     * Handles clicks on an extension card.
     * @param {object} extension - The extension object to feature.
     * @param {HTMLElement} clickedCard - The card element that was clicked.
     */
    function handleCardClick(extension, clickedCard) {
        // Update the banner
        updateBanner(extension);

        // Update the 'active' class on cards
        document.querySelectorAll('.extension-card').forEach(card => {
            card.classList.remove('active');
        });
        clickedCard.classList.add('active');
    }

    // --- Initialization ---
    // Clear the grid first in case there's any placeholder content
    extensionGrid.innerHTML = ''; 

    // Create and append all extension cards to the grid
    extensions.forEach(ext => {
        const card = document.createElement('div');
        card.className = 'extension-card';
        card.dataset.id = ext.id; 

        card.innerHTML = `
            <img src="${ext.icon}" alt="${ext.name} icon" class="icon">
            <div class="info">
                <h4>${ext.name}</h4>
                <p>${ext.tagline}</p>
            </div>
        `;
        
        card.addEventListener('click', () => handleCardClick(ext, card));
        
        extensionGrid.appendChild(card);
    });

    // --- Initial Page Load ---
    if (extensions.length > 0) {
        const firstExtension = extensions[0];
        const firstCard = document.querySelector('.extension-card');
        
        updateBanner(firstExtension);
        if (firstCard) {
            firstCard.classList.add('active');
        }
    } else {
        // Optional: Handle case where there are no extensions
        document.querySelector('.featured-banner').style.display = 'none';
        extensionGrid.innerHTML = '<p>No extensions to display yet.</p>';
    }
});