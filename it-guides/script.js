$(document).ready(function() {
    const select = $('#command-select');
    const initialPlaceholder = $('#initial-placeholder');
    const ticketCard = $('#ticket-card');
    const stepsCard = $('#steps-card');
    const noResultsPlaceholder = $('#no-results-placeholder'); // <-- Reference to new element
    const ticketDescriptionEl = $('#ticket-description');
    const stepsListEl = $('#steps-list');
    const copyTicketBtn = $('#copy-ticket-btn');
    
    let commandsData = [];

    // --- NEW: Initialize Bootstrap Tooltips ---
    // This looks for any element with data-bs-toggle="tooltip" and activates it.
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));


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

    // --- MODIFIED: Event handler for when a command is selected OR cleared ---
    select.on('change', function() {
        noResultsPlaceholder.addClass('d-none'); // Always hide "no results" on change
        const selectedId = $(this).val();
        if (!selectedId) {
            initialPlaceholder.removeClass('d-none');
            ticketCard.addClass('d-none');
            stepsCard.addClass('d-none');
            return;
        }
        
        initialPlaceholder.addClass('d-none');
        ticketCard.removeClass('d-none');
        stepsCard.removeClass('d-none');
        
        const command = commandsData.find(c => c.id === selectedId);
        displayCommandDetails(command);
    });

    // --- NEW: Event listener to detect when a search yields no results ---
    // We listen for typing on the search field that Select2 creates.
    $(document).on('keyup', '.select2-search__field', function() {
        // Use a short timeout to allow Select2 to update its results list in the DOM
        setTimeout(() => {
            // Check if the "No results found" message is visible
            const noResultsMessage = $('.select2-results__message');
            if (noResultsMessage.length > 0) {
                // If it is, show our custom placeholder and hide others
                initialPlaceholder.addClass('d-none');
                ticketCard.addClass('d-none');
                stepsCard.addClass('d-none');
                noResultsPlaceholder.removeClass('d-none');
            } else {
                // If there are results, make sure our placeholder is hidden
                noResultsPlaceholder.addClass('d-none');
            }
        }, 100);
    });

    function displayCommandDetails(command) {
        $('#ticket-card .card-header').removeClass('header-blue header-green').addClass('header-blue');
        $('#steps-card .card-header').removeClass('header-blue header-green').addClass('header-green');
        copyTicketBtn.addClass('btn-outline-light');
        ticketDescriptionEl.text(command.ticket_template);
        copyTicketBtn.data('copy-text', command.ticket_template);
        stepsListEl.empty();
        const ol = $('<ol class="list-group list-group-numbered"></ol>');
        command.execution.forEach(exec => {
            const li = $(`<li class="list-group-item border-0 ps-0">${exec.step}</li>`);
            if (exec.command) {
                const codeBlock = $(`<div class="step-code"><code>${exec.command}</code><button class="btn btn-dark copy-code-btn" title="Copy Command"><i class="fa-regular fa-copy"></i></button></div>`);
                codeBlock.find('.copy-code-btn').data('copy-text', exec.command);
                li.append(codeBlock);
            }
            ol.append(li);
        });
        stepsListEl.append(ol);
    }

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

    copyTicketBtn.on('click', function() {
        const textToCopy = $(this).data('copy-text');
        const formattedText = ` > ${textToCopy} `;
        copyToClipboard(formattedText, 'Ticket description copied!');
    });

    $(document).on('click', '.copy-code-btn', function() {
        const textToCopy = $(this).data('copy-text');
        copyToClipboard(textToCopy, 'Command copied!');
    });
});