$(document).ready(function() {
    let contactsData = [];
    let templatesData = [];

    // Fetch JSON data
    Promise.all([
        $.getJSON('contacts.json'),
        $.getJSON('templates.json')
    ]).then(function([contacts, templates]) {
        contactsData = contacts;
        templatesData = templates;

        populateContactsDropdown();
        populateTemplatesDropdown();
    }).catch(function(error) {
        console.error("Error loading JSON data:", error);
        Swal.fire({ icon: 'error', title: 'Oops...', text: 'Could not load required data files!' });
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
    $('#contact-select, #subject-select, #customer-type-select').on('change', generateEmail);
    $('#customer-name-input, #customer-email-input').on('keyup', generateEmail);

    // --- CORE LOGIC ---
    function generateEmail() {
        // 1. GET ALL CURRENT VALUES
        const selectedRecipientId = $('#contact-select').val();
        const selectedTemplateId = $('#subject-select').val();
        const customerType = $('#customer-type-select').val();
        const customerName = $('#customer-name-input').val().trim();
        const customerEmail = $('#customer-email-input').val().trim();

        // 2. FIND THE DATA OBJECTS
        const recipient = contactsData.find(c => c.id == selectedRecipientId);
        const template = templatesData.find(t => t.id === selectedTemplateId);
        
        // 3. UPDATE RECIPIENT'S EMAIL FIELD
        if (recipient) {
            $('#recipient-email').val(recipient.email);
        } else {
             $('#recipient-email').val('');
        }

        // Exit if no template is selected
        if (!template) {
            $('#final-subject').val('');
            $('#email-body').val('');
            return;
        }

        // 4. CONSTRUCT THE SUBJECT (Uses "Customer Details" section)
        let finalSubject = template.subject;
        if (customerName && customerEmail) {
            finalSubject = `${customerType} CX ${template.title} (${customerName} - ${customerEmail})`;
        }
        $('#final-subject').val(finalSubject);

        // 5. POPULATE THE BODY (Uses recipient from Step 1)
        let finalBody = template.body;

        // Replace [Recipient Name] with the person selected in Step 1.
        if (recipient) {
            finalBody = finalBody.replace(/\[Recipient Name\]/g, recipient.name);
        }

        // IMPORTANT: We no longer automatically replace [Your Name].
        // The user must fill this in manually.

        $('#email-body').val(finalBody);
    }

    // --- COPY BUTTON FUNCTIONALITY (No changes needed) ---
    $('.copy-btn').on('click', function() {
        const targetSelector = $(this).data('target');
        const textToCopy = $(targetSelector).val();
        if (!textToCopy) {
            Swal.fire({ icon: 'warning', title: 'Nothing to Copy', text: 'The field is empty.', timer: 1500, showConfirmButton: false });
            return;
        }
        navigator.clipboard.writeText(textToCopy).then(() => {
            Swal.fire({ icon: 'success', title: 'Copied!', text: 'Content copied to clipboard.', timer: 1500, showConfirmButton: false });
        }).catch(err => {
            console.error('Failed to copy: ', err);
            Swal.fire({ icon: 'error', title: 'Copy Failed', text: 'Could not copy the text.' });
        });
    });
});