$(document).ready(function() {
    let contactsData = [];
    let templatesData = [];

    // --- NEW: INITIALIZE QUILLJS RICH TEXT EDITOR ---
    const quill = new Quill('#email-body-editor', {
        theme: 'snow', // Use the clean 'snow' theme
        modules: {
            toolbar: [
                ['bold', 'italic', 'underline'],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                ['link', 'clean'] // 'clean' is the remove formatting button
            ]
        },
        placeholder: 'Email body will be generated here...',
    });

    // --- DATA FETCHING (No change) ---
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

    // --- POPULATION FUNCTIONS (No change) ---
    function populateContactsDropdown() { /* ... */ }
    function populateTemplatesDropdown() { /* ... */ }
    // Included for completeness
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

    // --- EVENT HANDLERS (No change) ---
    $('#contact-select, #subject-select, #customer-type-select').on('change', generateEmail);
    $('#customer-name-input, #customer-email-input').on('keyup', generateEmail);

    // --- CORE LOGIC (Updated for QuillJS) ---
    function generateEmail() {
        // GET VALUES & FIND OBJECTS (No change)
        const selectedRecipientId = $('#contact-select').val();
        const selectedTemplateId = $('#subject-select').val();
        const customerType = $('#customer-type-select').val();
        const customerName = $('#customer-name-input').val().trim();
        const customerEmail = $('#customer-email-input').val().trim();
        const recipient = contactsData.find(c => c.id == selectedRecipientId);
        const template = templatesData.find(t => t.id === selectedTemplateId);
        
        $('#recipient-email').val(recipient ? recipient.email : '');

        if (!template) {
            $('#final-subject').val('');
            quill.setText(''); // Clear the Quill editor
            return;
        }

        // CONSTRUCT SUBJECT (No change)
        let finalSubject = template.subject;
        if (customerName && customerEmail) {
            finalSubject = `${customerType} CX ${template.title} (${customerName} - ${customerEmail})`;
        }
        $('#final-subject').val(finalSubject);

        // POPULATE THE BODY (Updated for QuillJS)
        let finalBody = template.body;
        if (recipient) {
            finalBody = finalBody.replace(/\[Recipient Name\]/g, recipient.name);
        }
        // Use the Quill API to set content. It accepts HTML.
        quill.root.innerHTML = finalBody;
    }

    // --- COPY BUTTON FUNCTIONALITY ---
    // General copy for input fields
    $('.copy-btn').on('click', function() {
        const textToCopy = $($(this).data('target')).val();
        copyToClipboard(textToCopy);
    });

    // Specific copy for Quill editor body
    $('#copy-body-btn').on('click', function() {
        // Get content as plain text for email clients
        const textToCopy = quill.getText();
        copyToClipboard(textToCopy);
    });

    // Helper function for copying
    function copyToClipboard(text) {
        if (!text) {
            Swal.fire({ icon: 'warning', title: 'Nothing to Copy', text: 'The field is empty.', timer: 1500, showConfirmButton: false });
            return;
        }
        navigator.clipboard.writeText(text).then(() => {
            Swal.fire({ icon: 'success', title: 'Copied!', text: 'Content copied to clipboard.', timer: 1500, showConfirmButton: false });
        });
    }

    // --- RESET BUTTON FUNCTIONALITY (Updated for QuillJS) ---
    $('#reset-btn').on('click', function() {
        Swal.fire({
            title: 'Are you sure?', text: "This will clear all fields.", icon: 'warning',
            showCancelButton: true, confirmButtonColor: '#0d6efd', cancelButtonColor: '#6c757d',
            confirmButtonText: 'Yes, reset it!'
        }).then((result) => {
            if (result.isConfirmed) {
                $('form').trigger('reset'); // Resets basic form elements
                $('#contact-select, #subject-select').val(""); // Ensure dropdowns reset fully
                $('#customer-type-select').val("Existing");
                // Clear input fields that might not reset with the form tag
                $('#recipient-email, #customer-name-input, #customer-email-input, #final-subject').val('');
                
                // Clear the Quill editor
                quill.setText('');
                
                Swal.fire({ title: 'Reset!', text: 'The form has been cleared.', icon: 'success', timer: 1500, showConfirmButton: false });
            }
        });
    });
});