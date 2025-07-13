$(document).ready(function() {
    // --- DOM Element References ---
    const select = $('#command-select');
    const initialPlaceholder = $('#initial-placeholder');
    const ticketCard = $('#ticket-card');
    const stepsCard = $('#steps-card');
    const noResultsPlaceholder = $('#no-results-placeholder');
    const noticeCard = $('#notice-card');
    const ticketDescriptionEl = $('#ticket-description');
    const stepsListEl = $('#steps-list');
    const copyTicketBtn = $('#copy-ticket-btn');

    let commandsData = []; // To store the fetched commands

    // --- Initialize Bootstrap Tooltips ---
    // This is required for the tooltips on the Home and Reset buttons to work.
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

    // --- Custom Matcher Function for Select2 Search ---
    // This function tells Select2 how to search, looking in titles and keywords.
    function commandMatcher(params, data) {
        if ($.trim(params.term) === '') return data;
        if (typeof data.id === 'undefined' || data.id === '') return null;
        const originalCommand = commandsData.find(c => c.id === data.id);
        if (!originalCommand) return null;
        const searchTerm = params.term.toLowerCase();
        if (originalCommand.title.toLowerCase().includes(searchTerm)) return data;
        if (originalCommand.keywords?.some(k => k.toLowerCase().includes(searchTerm))) return data;
        return null;
    }

    // --- Fetch JSON data and initialize Select2 ---
    fetch('commands.json')
        .then(response => response.json())
        .then(data => {
            commandsData = data;
            select.select2({
                theme: 'bootstrap-5',
                placeholder: 'Search by keyword (e.g., sfc, dns, ip)...',
                allowClear: true,
                matcher: commandMatcher,
                data: [
                    { id: '', text: '' },
                    ...data.map(command => ({ id: command.id, text: command.title }))
                ]
            });
        })
        .catch(error => {
            console.error('Error fetching commands:', error);
            Swal.fire('Error', 'Could not load commands data.', 'error');
        });

    // --- Event Handlers ---

    // Fired when an item is selected from the dropdown or the selection is cleared
    select.on('change', function() {
        // Hide dynamic content first
        noResultsPlaceholder.addClass('d-none');
        noticeCard.addClass('d-none');
        
        const selectedId = $(this).val();
        if (!selectedId) {
            // If selection is cleared, show the initial placeholder
            initialPlaceholder.removeClass('d-none');
            ticketCard.addClass('d-none');
            stepsCard.addClass('d-none');
            return;
        }
        
        // If an item is selected, hide the initial placeholder and show result cards
        initialPlaceholder.addClass('d-none');
        ticketCard.removeClass('d-none');
        stepsCard.removeClass('d-none');
        
        const command = commandsData.find(c => c.id === selectedId);
        displayCommandDetails(command);
    });

    // Fired when typing in the search box to handle the "no results" message
    $(document).on('keyup', '.select2-search__field', function() {
        setTimeout(() => {
            const noResultsMessage = $('.select2-results__message');
            if (noResultsMessage.length > 0) {
                // If "no results" message exists, show our custom placeholder
                initialPlaceholder.addClass('d-none');
                ticketCard.addClass('d-none');
                stepsCard.addClass('d-none');
                noticeCard.addClass('d-none');
                noResultsPlaceholder.removeClass('d-none');
            } else {
                // Otherwise, make sure it's hidden
                noResultsPlaceholder.addClass('d-none');
            }
        }, 100);
    });

    // Fired when the "Reset" button is clicked
    $('#reset-btn').on('click', function() {
        select.val(null).trigger('change');
        noResultsPlaceholder.addClass('d-none');
        noticeCard.addClass('d-none');
    });

    // Fired when the "Copy" button for the ticket description is clicked
    copyTicketBtn.on('click', function() {
        const textToCopy = $(this).data('copy-text');
        const formattedText = ` > ${textToCopy} `;
        copyToClipboard(formattedText, 'Ticket description copied!');
    });

    // Fired when any "Copy" button for a code block is clicked
    $(document).on('click', '.copy-code-btn', function() {
        const textToCopy = $(this).data('copy-text');
        copyToClipboard(textToCopy, 'Command copied!');
    });


    // --- Core Functions ---

    // Main function to populate the results area with command details
    function displayCommandDetails(command) {
        // Handle the notice card (if data exists)
        noticeCard.addClass('d-none'); // Hide by default
        if (command.notice && command.notice.content) {
            const noticeAlert = $('#notice-alert');
            const noticeTitle = $('#notice-title');
            const noticeContent = $('#notice-content');

            const types = {
                info:    { class: 'alert-info',    title: 'Info' },
                tip:     { class: 'alert-success', title: 'Tip' },
                warning: { class: 'alert-warning', title: 'Warning' }
            };
            const noticeType = types[command.notice.type] || types.info; // Default to "info"

            noticeAlert.removeClass('alert-info alert-success alert-warning').addClass(noticeType.class);
            noticeTitle.text(noticeType.title);
            noticeContent.text(command.notice.content);
            noticeCard.removeClass('d-none'); // Show the card
        }

        // Populate the Ticket Description card
        $('#ticket-card .card-header').removeClass('header-blue header-green').addClass('header-blue');
        copyTicketBtn.addClass('btn-outline-light');
        ticketDescriptionEl.text(command.ticket_template);
        copyTicketBtn.data('copy-text', command.ticket_template);

        // Populate the Steps card
        $('#steps-card .card-header').removeClass('header-blue header-green').addClass('header-green');
        stepsListEl.empty();
        const ol = $('<ol class="list-group list-group-numbered"></ol>');
        command.execution.forEach(exec => {
            const li = $(`<li class="list-group-item border-0 ps-0">${exec.step || ''}</li>`);
            if (exec.command) {
                const codeBlock = $(`<div class="step-code"><code>${exec.command}</code><button class="btn btn-dark copy-code-btn" title="Copy Command"><i class="fa-regular fa-copy"></i></button></div>`);
                codeBlock.find('.copy-code-btn').data('copy-text', exec.command);
                li.append(codeBlock);
            }
            ol.append(li);
        });
        stepsListEl.append(ol);
    }

    // Helper function for copying text to the clipboard with user feedback
    function copyToClipboard(text, successMessage) {
        navigator.clipboard.writeText(text).then(() => {
            Swal.fire({
                icon: 'success',
                title: successMessage,
                showConfirmButton: false,
                timer: 1500,
                toast: true,
                position: 'top-end'
            });
        }).catch(err => {
            console.error('Failed to copy: ', err);
            Swal.fire('Error', 'Failed to copy text.', 'error');
        });
    }

});