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
            bannerImage: 'https://raw.githubusercontent.com/247Techies/World_Clock/39dc379c1a9488d6f78d8a99ef977c29e9e18962/web-store/MyExtentions/247-Info-Modal/icons/icon128.png', // Using icon as banner for now
            downloadLink: 'https://download-directory.github.io/?url=https://github.com/247Techies/World_Clock/tree/39dc379c1a9488d6f78d8a99ef977c29e9e18962/web-store/MyExtentions/247-Info-Modal'
        }
        // To add another extension,add a comma here and paste a new object below.
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
        featuredImage.style.objectFit = 'contain'; // Use 'contain' so the small icon isn't stretched
        featuredImage.style.padding = '40px'; // Add some padding around the icon in the banner
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