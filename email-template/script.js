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
    }).catch(function(error) {
        console.error("Error loading JSON data:", error);
        Swal.fire({ icon: 'error', title: 'Oops...', text: 'Could not load data files! Please check file paths and for JSON errors.' });
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

    // --- CORE LOGIC (FIXED) ---
    function generateEmail() {
        // 1. Get all current values from the form.
        const selectedRecipientId = $('#contact-select').val();
        const selectedTemplateId = $('#subject-select').val();
        const customerType = $('#customer-type-select').val();
        const customerName = $('#customer-name-input').val().trim();
        const customerEmail = $('#customer-email-input').val().trim();

        // 2. Find the corresponding data objects. They will be 'undefined' if not selected, which is okay.
        const recipient = contactsData.find(c => c.id == selectedRecipientId);
        const template = templatesData.find(t => t.id === selectedTemplateId);

        // 3. Handle Recipient-related fields.
        // This will run every time, populating the email field as soon as a recipient is chosen.
        $('#recipient-email').val(recipient ? recipient.email : '');

        // 4. Handle Template-related fields.
        if (template) {
            // A template IS selected, so populate subject and body.
            let finalSubject = template.subject;
            if (customerName && customerEmail) {
                finalSubject = `${customerType} CX ${template.title} (${customerName} - ${customerEmail})`;
            }
            $('#final-subject').val(finalSubject);
            
            let finalBody = template.body;
            // IMPORTANT: Only try to replace the name if a recipient has also been selected.
            if (recipient) {
                finalBody = finalBody.replace(/\[Recipient Name\]/g, recipient.name);
            }
            $('#email-body').val(finalBody);

        } else {
            // NO template is selected, so ensure the subject and body are cleared.
            $('#final-subject').val('');
            $('#email-body').val('');
        }
    }

    // --- COPY BUTTON LOGIC ---
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

    // --- SEND BUTTON LOGIC ---
    $('#send-btn').on('click', function() {
        const recipientEmail = $('#recipient-email').val();
        const subject = $('#final-subject').val();
        const body = $('#email-body').val();

        if (!recipientEmail) {
            Swal.fire({ icon: 'error', title: 'Missing Recipient', text: 'Please select a recipient first.' });
            return;
        }

        const encodedSubject = encodeURIComponent(subject);
        const encodedBody = encodeURIComponent(body);
        const mailtoLink = `mailto:${recipientEmail}?subject=${encodedSubject}&body=${encodedBody}`;
        window.location.href = mailtoLink;
    });

    // --- RESET BUTTON LOGIC ---
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