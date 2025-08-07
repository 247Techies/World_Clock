$(document).ready(function() {
    let contactsData = [];
    let templatesData = [];

    // Use Promise.all to fetch both JSON files simultaneously
    Promise.all([
        $.getJSON('contacts.json'),
        $.getJSON('templates.json')
    ]).then(function([contacts, templates]) {
        contactsData = contacts;
        templatesData = templates;

        // Populate the dropdowns once data is loaded
        populateContactsDropdown();
        populateTemplatesDropdown();
    }).catch(function(error) {
        console.error("Error loading JSON data:", error);
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Could not load required data files! Please check the console for errors.'
        });
    });

    // --- POPULATION FUNCTIONS ---
    function populateContactsDropdown() {
        const select = $('#contact-select');
        contactsData.forEach(contact => {
            select.append(`<option value="${contact.id}">${contact.name}</option>`);
        });
    }

    function populateTemplatesDropdown() {
        const select = $('#subject-select');
        templatesData.forEach(template => {
            select.append(`<option value="${template.id}">${template.title}</option>`);
        });
    }

    // --- EVENT HANDLERS ---
    $('#contact-select, #subject-select').on('change', updateEmailContent);

    // --- CORE LOGIC ---
    function updateEmailContent() {
        const selectedContactId = $('#contact-select').val();
        const selectedTemplateId = $('#subject-select').val();

        // Find the selected contact object
        const contact = contactsData.find(c => c.id == selectedContactId);
        
        // Update recipient email field
        if (contact) {
            $('#recipient-email').val(contact.email);
        } else {
             $('#recipient-email').val('');
        }

        // Find the selected template object
        const template = templatesData.find(t => t.id === selectedTemplateId);

        if (template) {
            let finalSubject = template.subject;
            let finalBody = template.body;

            // Replace placeholders
            if (contact) {
                // Replace [Recipient Name] placeholder with the actual name
                finalBody = finalBody.replace(/\[Recipient Name\]/g, contact.name);
            }
            
            $('#final-subject').val(finalSubject);
            $('#email-body').val(finalBody);
        } else {
            // Clear fields if no template is selected
            if (!selectedTemplateId) {
                $('#final-subject').val('');
                $('#email-body').val('');
            }
        }
    }

    // --- COPY BUTTON FUNCTIONALITY ---
    $('.copy-btn').on('click', function() {
        const targetSelector = $(this).data('target');
        const textToCopy = $(targetSelector).val();

        if (!textToCopy) {
            Swal.fire({
                icon: 'warning',
                title: 'Nothing to Copy',
                text: 'The field is empty.',
                timer: 1500,
                showConfirmButton: false
            });
            return;
        }

        navigator.clipboard.writeText(textToCopy).then(() => {
            // Success feedback with SweetAlert
            Swal.fire({
                icon: 'success',
                title: 'Copied!',
                text: 'The content has been copied to your clipboard.',
                timer: 1500, // Auto-close after 1.5 seconds
                showConfirmButton: false
            });
        }).catch(err => {
            console.error('Failed to copy: ', err);
            Swal.fire({
                icon: 'error',
                title: 'Copy Failed',
                text: 'Could not copy the text. Please try again or copy manually.'
            });
        });
    });
});