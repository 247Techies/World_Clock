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

    // --- CORE LOGIC ---
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
                $('#email-body').val(''); // Use .val() for textarea
            }
            return;
        }

        // CONSTRUCT SUBJECT
        let finalSubject = template.subject;
        if (customerName && customerEmail) {
            finalSubject = `${customerType} CX ${template.title} (${customerName} - ${customerEmail})`;
        }
        $('#final-subject').val(finalSubject);

        // POPULATE THE BODY
        let finalBody = template.body;
        if (recipient) {
            finalBody = finalBody.replace(/\[Recipient Name\]/g, recipient.name);
        }
        $('#email-body').val(finalBody); // Use .val() to set textarea content
    }

    // --- UNIFIED COPY BUTTON LOGIC ---
    // This single handler now works for all copy buttons, including the body.
    $('.copy-btn').on('click', function() {
        const targetSelector = $(this).data('target');
        const textToCopy = $(targetSelector).val();

        if (!textToCopy) {
            Swal.fire({ icon: 'warning', title: 'Nothing to Copy', text: 'The field is empty.', timer: 1500, showConfirmButton: false });
            return;
        }

        navigator.clipboard.writeText(textToCopy).then(() => {
            Swal.fire({
                icon: 'success',
                title: 'Copied!',
                text: 'Content copied to clipboard.',
                timer: 1500,
                showConfirmButton: false
            });
        }).catch(err => {
            console.error('Failed to copy: ', err);
            Swal.fire({ icon: 'error', title: 'Copy Failed', text: 'Could not copy the text.' });
        });
    });
    
    // --- RESET BUTTON FUNCTIONALITY ---
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
                $('#email-body').val(''); // Explicitly clear the textarea
                
                Swal.fire({ title: 'Reset!', text: 'The form has been cleared.', icon: 'success', timer: 1500, showConfirmButton: false });
            }
        });
    });
});