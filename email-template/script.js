$(document).ready(function() {
    let contactsData = [];
    let templatesData = [];

    // --- INITIALIZE QUILLJS WITH AN EXPANDED TOOLBAR ---
    const quill = new Quill('#email-body-editor', {
        theme: 'snow',
        modules: {
            toolbar: [
                [{ 'header': [1, 2, 3, false] }], // Headers
                [{ 'size': ['small', false, 'large', 'huge'] }], // Font sizes
                ['bold', 'italic', 'underline', 'strike'], // Font styles
                [{ 'color': [] }, { 'background': [] }], // Colors
                [{ 'list': 'ordered'}, { 'list': 'bullet' }], // Lists
                [{ 'align': [] }], // Text alignment
                ['link', 'blockquote', 'code-block'], // Links and blocks
                ['clean'] // Remove formatting
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
    }).catch(function(error) { /* ... */ });

    // --- POPULATION & CORE LOGIC FUNCTIONS (No change) ---
    function populateContactsDropdown() { /* ... */ }
    function populateTemplatesDropdown() { /* ... */ }
    function generateEmail() { /* ... */ }

    // --- Included for completeness (no changes in these functions) ---
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
            $('#final-subject').val('');
            quill.root.innerHTML = '';
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
        // Use insertHTML to properly handle newlines from the JSON
        quill.root.innerHTML = finalBody.replace(/\n/g, '<br>');
    }

    // --- UPDATED COPY BUTTON LOGIC ---

    // General copy for plain text input fields
    $('.copy-btn').on('click', function() {
        const textToCopy = $($(this).data('target')).val();
        copyPlainTextToClipboard(textToCopy);
    });

    // Specific, NEW handler for the rich text body
    $('#copy-body-btn').on('click', function() {
        copyRichTextToClipboard(quill);
    });

    // Helper function for plain text
    function copyPlainTextToClipboard(text) {
        if (!text) {
            Swal.fire({ icon: 'warning', title: 'Nothing to Copy', text: 'The field is empty.', timer: 1500, showConfirmButton: false });
            return;
        }
        navigator.clipboard.writeText(text).then(() => {
            Swal.fire({ icon: 'success', title: 'Copied!', text: 'Content copied to clipboard.', timer: 1500, showConfirmButton: false });
        });
    }
    
    // NEW & IMPROVED: Helper function to copy rich text (HTML)
    function copyRichTextToClipboard(quillInstance) {
        // 1. Get the HTML content from the Quill editor
        const htmlContent = quillInstance.root.innerHTML;

        // Check if the editor is empty (Quill's empty state is '<p><br></p>')
        if (!htmlContent || htmlContent === '<p><br></p>') {
            Swal.fire({ icon: 'warning', title: 'Nothing to Copy', text: 'The editor is empty.', timer: 1500, showConfirmButton: false });
            return;
        }

        try {
            // 2. Create a Blob with the HTML content
            const blob = new Blob([htmlContent], { type: 'text/html' });

            // 3. Create a ClipboardItem with the Blob
            const clipboardItem = new ClipboardItem({ 'text/html': blob });

            // 4. Use the advanced clipboard API to write the item
            navigator.clipboard.write([clipboardItem]).then(() => {
                Swal.fire({ icon: 'success', title: 'Copied!', text: 'Formatted text copied to clipboard.', timer: 1500, showConfirmButton: false });
            }).catch(err => {
                console.error('Failed to copy rich text: ', err);
                Swal.fire({ icon: 'error', title: 'Copy Failed', text: 'Could not copy formatted text.' });
            });
        } catch (error) {
            console.error('Error creating clipboard item:', error);
            Swal.fire({ icon: 'error', title: 'Browser Error', text: 'Your browser may not support copying rich text.' });
        }
    }
    
    // --- RESET BUTTON FUNCTIONALITY (No change) ---
    $('#reset-btn').on('click', function() { /* ... */ });
    // Included for completeness
    $('#reset-btn').on('click', function() {
        Swal.fire({
            title: 'Are you sure?', text: "This will clear all fields.", icon: 'warning',
            showCancelButton: true, confirmButtonColor: '#0d6efd', cancelButtonColor: '#6c757d',
            confirmButtonText: 'Yes, reset it!'
        }).then((result) => {
            if (result.isConfirmed) {
                $('form').trigger('reset');
                $('#contact-select, #subject-select').val("");
                $('#customer-type-select').val("Existing");
                $('#recipient-email, #customer-name-input, #customer-email-input, #final-subject').val('');
                quill.root.innerHTML = '';
                Swal.fire({ title: 'Reset!', text: 'The form has been cleared.', icon: 'success', timer: 1500, showConfirmButton: false });
            }
        });
    });
});