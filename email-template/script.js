$(document).ready(function() {
    let contactsData = [];
    let templatesData = [];

    // --- INITIALIZE QUILLJS WITH AN EXPANDED TOOLBAR ---
    const quill = new Quill('#email-body-editor', {
        theme: 'snow',
        modules: {
            toolbar: [
                [{ 'header': [1, 2, 3, false] }],
                [{ 'size': ['small', false, 'large', 'huge'] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'align': [] }],
                ['link', 'blockquote', 'code-block'],
                ['clean']
            ]
        },
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
            // Only clear subject and body if a template is not selected.
            // This prevents clearing when only the contact changes.
            if (!selectedTemplateId) {
                $('#final-subject').val('');
                quill.root.innerHTML = '';
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
        // Convert newlines to <br> for HTML and set editor content
        quill.root.innerHTML = finalBody.replace(/\n/g, '<br>');
    }

    // --- COPY BUTTON LOGIC ---
    $('.copy-btn').on('click', function() {
        const textToCopy = $($(this).data('target')).val();
        copyPlainTextToClipboard(textToCopy);
    });

    $('#copy-body-btn').on('click', function() {
        copyRichTextToClipboard(quill);
    });

    function copyPlainTextToClipboard(text) {
        if (!text) {
            Swal.fire({ icon: 'warning', title: 'Nothing to Copy', text: 'The field is empty.', timer: 1500, showConfirmButton: false });
            return;
        }
        navigator.clipboard.writeText(text).then(() => {
            Swal.fire({ icon: 'success', title: 'Copied!', text: 'Content copied to clipboard.', timer: 1500, showConfirmButton: false });
        });
    }
    
    function copyRichTextToClipboard(quillInstance) {
        const htmlContent = quillInstance.root.innerHTML;
        if (!htmlContent || htmlContent === '<p><br></p>') {
            Swal.fire({ icon: 'warning', title: 'Nothing to Copy', text: 'The editor is empty.', timer: 1500, showConfirmButton: false });
            return;
        }
        try {
            const blob = new Blob([htmlContent], { type: 'text/html' });
            const clipboardItem = new ClipboardItem({ 'text/html': blob });
            navigator.clipboard.write([clipboardItem]).then(() => {
                Swal.fire({ icon: 'success', title: 'Copied!', text: 'Formatted text copied to clipboard.', timer: 1500, showConfirmButton: false });
            });
        } catch (error) {
            console.error('Error with rich text copy:', error);
            Swal.fire({ icon: 'error', title: 'Copy Failed', text: 'Your browser may not support copying rich text.' });
        }
    }
    
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
                quill.root.innerHTML = ''; // Clear the Quill editor
                Swal.fire({ title: 'Reset!', text: 'The form has been cleared.', icon: 'success', timer: 1500, showConfirmButton: false });
            }
        });
    });
});