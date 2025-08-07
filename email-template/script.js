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
    // Listen for changes on ALL relevant inputs and trigger the update function
    $('#contact-select, #subject-select, #customer-type-select').on('change', generateEmail);
    $('#customer-name-input, #customer-email-input').on('keyup', generateEmail);


    // --- CORE LOGIC ---
    function generateEmail() {
        // 1. GET ALL CURRENT VALUES
        const selectedContactId = $('#contact-select').val();
        const selectedTemplateId = $('#subject-select').val();
        const customerType = $('#customer-type-select').val(); // "New" or "Existing"
        const customerName = $('#customer-name-input').val().trim();
        const customerEmail = $('#customer-email-input').val().trim();

        // 2. FIND THE DATA OBJECTS
        const contact = contactsData.find(c => c.id == selectedContactId);
        const template = templatesData.find(t => t.id === selectedTemplateId);
        
        // 3. UPDATE YOUR EMAIL FIELD (for reference)
        if (contact) {
            $('#recipient-email').val(contact.email);
        } else {
             $('#recipient-email').val('');
        }

        // 4. GENERATE CONTENT (SUBJECT & BODY)
        if (template) {
            let finalSubject = template.subject; // Start with the default subject from JSON
            let finalBody = template.body;

            // ---- NEW: DYNAMIC SUBJECT LOGIC ----
            // If customer details are provided, build the new subject format
            if (customerName && customerEmail) {
                // Example: "Existing CX Follow-Up (Acme Corp - contact@acme.com)"
                finalSubject = `${customerType} CX ${template.title} (${customerName} - ${customerEmail})`;
            }

            // ---- EXISTING: BODY PLACEHOLDER LOGIC ----
            // Replace [Your Name] placeholder with the selected contact's name
            // Note: I've updated the placeholder to be [Your Name] in the JSON
            // and the recipient to be the Customer Name for clarity. Let's assume the body
            // is addressed to the Customer.
            if (contact) {
                finalBody = finalBody.replace(/\[Your Name\]/g, contact.name);
            }
             // Let's assume the recipient is now the customer from the input field
            finalBody = finalBody.replace(/\[Recipient Name\]/g, customerName || 'there');


            // 5. UPDATE THE UI
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

    // --- COPY BUTTON FUNCTIONALITY (No changes needed here) ---
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
            Swal.fire({
                icon: 'success',
                title: 'Copied!',
                text: 'The content has been copied to your clipboard.',
                timer: 1500,
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