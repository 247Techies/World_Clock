$(document).ready(function() {
    let contactsData = [];
    let templatesData = [];

    // --- DATA FETCHING ---
    Promise.all([
        $.getJSON('contacts.json'),
        $.getJSON('templates.json')
    ]).then(function([contacts, templates]) {
        contactsData = contacts;
        templatesData = templates;
        populateContactsDropdown();
        populateTemplatesDropdown();
    }).catch(function(error) { /* ... */ });

    // --- POPULATION FUNCTIONS ---
    function populateContactsDropdown() { /* ... */ }
    function populateTemplatesDropdown() { /* ... */ }

    // --- CORE LOGIC ---
    function generateEmail() { /* ... */ }

    // --- COPY BUTTON LOGIC ---
    $('.copy-btn').on('click', function() { /* ... */ });
    
    // --- RESET BUTTON LOGIC ---
    $('#reset-btn').on('click', function() { /* ... */ });

    // --- NEW: SEND BUTTON LOGIC ---
    $('#send-btn').on('click', function() {
        // 1. Get all the necessary values from the form
        const recipientEmail = $('#recipient-email').val();
        const subject = $('#final-subject').val();
        const body = $('#email-body').val();

        // 2. Validate that we have a recipient
        if (!recipientEmail) {
            Swal.fire({
                icon: 'error',
                title: 'Missing Recipient',
                text: 'Please select a recipient from the dropdown first.'
            });
            return; // Stop the function
        }

        // 3. URL-encode the subject and body to handle special characters
        const encodedSubject = encodeURIComponent(subject);
        const encodedBody = encodeURIComponent(body);

        // 4. Construct the mailto link
        const mailtoLink = `mailto:${recipientEmail}?subject=${encodedSubject}&body=${encodedBody}`;

        // 5. Trigger the link to open the default email client
        window.location.href = mailtoLink;
    });

    // --- Included for completeness (no changes to these functions) ---
    function populateContactsDropdown() {
        const select = $('#contact-select');
        contactsData.forEach(contact => { select.append(`<option value="${contact.id}">${contact.name}</option>`); });
    }
    function populateTemplatesDropdown() {
        const select = $('#subject-select');
        templatesData.forEach(template => { select.append(`<option value="${template.id}">${template.title}</option>`); });
    }
    function generateEmail() {
        const selectedRecipientId = $('#contact-select').val();
        const selectedTemplateId = $('#subject-select').val();
        const customerType = $('#customer-type-select').val();
        const customerName = $('#customer-name-input').val().trim();
        const customerEmail = $('#customer-email-input').val().trim();
        const recipient = contactsData.find(c => c.id == selectedRecipientId);
        const template = templatesData.find(t => t.id === selectedTemplateId);
        $('#recipient-email').val(recipient ? recipient.email : '');
        if (!template) {
            if (!selectedTemplateId) {
                $('#final-subject').val('');
                $('#email-body').val('');
            }
            return;
        }
        let finalSubject = template.subject;
        if (customerName && customerEmail) {
            finalSubject = `${customerType} CX ${template.title} (${customerName} - ${customerEmail})`;
        }
        $('#final-subject').val(finalSubject);
        let finalBody = template.body;
        if (recipient) {
            finalBody = finalBody.replace(/\[Recipient Name\]/g, recipient.name);
        }
        $('#email-body').val(finalBody);
    }
    $('.copy-btn').on('click', function() {
        const targetSelector = $(this).data('target');
        const textToCopy = $(targetSelector).val();
        if (!textToCopy) {
            Swal.fire({ icon: 'warning', title: 'Nothing to Copy', text: 'The field is empty.', timer: 1500, showConfirmButton: false });
            return;
        }
        navigator.clipboard.writeText(textToCopy).then(() => {
            Swal.fire({ icon: 'success', title: 'Copied!', text: 'Content copied to clipboard.', timer: 1500, showConfirmButton: false });
        });
    });
    $('#reset-btn').on('click', function() {
        Swal.fire({
            title: 'Are you sure?', text: "This will clear all fields.", icon: 'warning',
            showCancelButton: true, confirmButtonColor: '#0d6efd', cancelButtonColor: '#6c757d',
            confirmButtonText: 'Yes, reset it!'
        }).then((result) => {
            if (result.isConfirmed) {
                $('#email-form')[0].reset();
                $('#contact-select').val("");
                $('#subject-select').val("");
                $('#email-body').val('');
                Swal.fire({ title: 'Reset!', text: 'The form has been cleared.', icon: 'success', timer: 1500, showConfirmButton: false });
            }
        });
    });
});