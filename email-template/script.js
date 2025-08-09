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

    // --- CORE LOGIC (UPGRADED) ---
    function generateEmail() {
        const selectedRecipientId = $('#contact-select').val();
        const selectedTemplateId = $('#subject-select').val();
        const customerType = $('#customer-type-select').val();
        const customerName = $('#customer-name-input').val().trim();
        const customerEmail = $('#customer-email-input').val().trim();

        const recipient = contactsData.find(c => c.id == selectedRecipientId);
        const template = templatesData.find(t => t.id === selectedTemplateId);

        $('#recipient-email').val(recipient ? recipient.email : '');

        if (template) {
            let finalSubject = template.subject;
            let finalBody = template.body;

            let customerDetailsString = '';
            if (customerName && customerEmail) {
                customerDetailsString = `(${customerName} | ${customerEmail})`;
            } else if (customerName) {
                customerDetailsString = `(${customerName})`;
            } else if (customerEmail) {
                customerDetailsString = `(${customerEmail})`;
            }

            // --- SMART REPLACEMENT LOGIC ---

            // A) Replace placeholders that are ALWAYS there.
            finalSubject = finalSubject.replace(/\$\{customerType\}/g, customerType);
            finalBody = finalBody.replace(/\$\{customerType\}/g, customerType);
            finalSubject = finalSubject.replace(/\$\{customerName\}/g, customerName);
            finalBody = finalBody.replace(/\$\{customerName\}/g, customerName);

            // B) Handle the CONDITIONAL email placeholder with parentheses.
            if (customerEmail) {
                // If email exists, just replace the placeholder inside the parentheses.
                finalSubject = finalSubject.replace(/\$\{customerEmail\}/g, customerEmail);
                finalBody = finalBody.replace(/\$\{customerEmail\}/g, customerEmail);
            } else {
                // If email DOES NOT exist, remove the placeholder AND the parentheses around it.
                // The `\s?` removes an optional space before the parentheses to prevent "Name ()" from becoming "Name ".
                finalSubject = finalSubject.replace(/\s?\(\$\{customerEmail\}\)/g, '');
                finalBody = finalBody.replace(/\s?\(\$\{customerEmail\}\)/g, '');
            }

            // C) Handle composite placeholders and recipient details.
            finalSubject = finalSubject.replace(/\$\{customerDetails\}/g, customerDetailsString);
            finalBody = finalBody.replace(/\$\{customerDetails\}/g, customerDetailsString);
            
            if (recipient) {
                const greetingName = recipient.salutation || recipient.name;
                finalBody = finalBody.replace(/\[Salutation\]/g, greetingName);
                finalBody = finalBody.replace(/\[Recipient Name\]/g, recipient.name);
            }

            $('#final-subject').val(finalSubject);
            $('#email-body').val(finalBody);

        } else {
            $('#final-subject').val('');
            $('#email-body').val('');
        }
    }

    // --- BUTTON LOGIC (No changes needed below) ---
    $('.copy-btn').on('click', function() {
        const targetSelector = $(this).data('target');
        const textToCopy = $(targetSelector).val();
        if (!textToCopy) { Swal.fire({ icon: 'warning', title: 'Nothing to Copy', text: 'The field is empty.', timer: 1500, showConfirmButton: false }); return; }
        navigator.clipboard.writeText(textToCopy).then(() => { Swal.fire({ icon: 'success', title: 'Copied!', text: 'Content copied to clipboard.', timer: 1500, showConfirmButton: false }); });
    });

    $('#send-btn').on('click', function() {
        const recipientEmail = $('#recipient-email').val();
        const subject = $('#final-subject').val();
        const body = $('#email-body').val();
        if (!recipientEmail) { Swal.fire({ icon: 'error', title: 'Missing Recipient', text: 'Please select a recipient first.' }); return; }
        const encodedSubject = encodeURIComponent(subject);
        const encodedBody = encodeURIComponent(body);
        window.location.href = `mailto:${recipientEmail}?subject=${encodedSubject}&body=${encodedBody}`;
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