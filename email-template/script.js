$(document).ready(function() {
    let contactsData = [];
    let templatesData = [];

    // --- INITIALIZE TINYMCE RICH TEXT EDITOR ---
    tinymce.init({
        selector: '#email-body',
        plugins: 'autolink lists link',
        toolbar: 'undo redo | bold italic underline | bullist numlist | link removeformat',
        menubar: false,
        height: 350,
        placeholder: 'Email body will be generated here...',
    });

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
        Swal.fire({ icon: 'error', title: 'Oops...', text: 'Could not load data files!' });
    });

    // --- POPULATION FUNCTIONS ---
    function populateContactsDropdown() { /* No changes */ }
    function populateTemplatesDropdown() { /* No changes */ }

    // (Functions from previous step - included for completeness)
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
        // GET VALUES (no changes)
        const selectedRecipientId = $('#contact-select').val();
        const selectedTemplateId = $('#subject-select').val();
        const customerType = $('#customer-type-select').val();
        const customerName = $('#customer-name-input').val().trim();
        const customerEmail = $('#customer-email-input').val().trim();

        // FIND DATA OBJECTS (no changes)
        const recipient = contactsData.find(c => c.id == selectedRecipientId);
        const template = templatesData.find(t => t.id === selectedTemplateId);
        
        // UPDATE RECIPIENT'S EMAIL (no changes)
        $('#recipient-email').val(recipient ? recipient.email : '');

        if (!template) {
            // If no template, clear fields and editor
            $('#final-subject').val('');
            if (tinymce.get('email-body')) {
                tinymce.get('email-body').setContent('');
            }
            return;
        }

        // CONSTRUCT SUBJECT (no changes)
        let finalSubject = template.subject;
        if (customerName && customerEmail) {
            finalSubject = `${customerType} CX ${template.title} (${customerName} - ${customerEmail})`;
        }
        $('#final-subject').val(finalSubject);

        // POPULATE THE BODY (Updated for TinyMCE)
        let finalBody = template.body;
        if (recipient) {
            finalBody = finalBody.replace(/\[Recipient Name\]/g, recipient.name);
        }
        // Use the TinyMCE API to set content
        if (tinymce.get('email-body')) {
            tinymce.get('email-body').setContent(finalBody);
        }
    }

    // --- COPY BUTTON FUNCTIONALITY (Updated for TinyMCE) ---
    $('.copy-btn').on('click', function() {
        const targetSelector = $(this).data('target');
        let textToCopy;

        // Check if we are copying from the rich text editor
        if (targetSelector === '#email-body') {
            // Get content as plain text for maximum compatibility
            textToCopy = tinymce.get('email-body').getContent({ format: 'text' });
        } else {
            // For all other fields, use .val()
            textToCopy = $(targetSelector).val();
        }

        if (!textToCopy) {
            Swal.fire({ icon: 'warning', title: 'Nothing to Copy', text: 'The field is empty.', timer: 1500, showConfirmButton: false });
            return;
        }
        navigator.clipboard.writeText(textToCopy).then(() => {
            Swal.fire({ icon: 'success', title: 'Copied!', text: 'Content copied to clipboard.', timer: 1500, showConfirmButton: false });
        });
    });

    // --- NEW: RESET BUTTON FUNCTIONALITY ---
    $('#reset-btn').on('click', function() {
        Swal.fire({
            title: 'Are you sure?',
            text: "This will clear all fields and reset the form.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#0d6efd',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Yes, reset it!'
        }).then((result) => {
            if (result.isConfirmed) {
                // Reset all dropdowns to the first (disabled) option
                $('#contact-select, #subject-select').prop('selectedIndex', 0);
                $('#customer-type-select').prop('selectedIndex', 0);

                // Clear all input fields
                $('#recipient-email, #customer-name-input, #customer-email-input, #final-subject').val('');

                // Clear the TinyMCE editor
                if (tinymce.get('email-body')) {
                    tinymce.get('email-body').setContent('');
                }
                
                Swal.fire({
                    title: 'Reset!',
                    text: 'The form has been cleared.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
            }
        });
    });
});