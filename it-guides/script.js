$(document).ready(function() {
    const select = $('#command-select');
    // Get references to the new elements
    const initialPlaceholder = $('#initial-placeholder');
    const ticketCard = $('#ticket-card');
    const stepsCard = $('#steps-card');
    // Get specific elements for population
    const ticketDescriptionEl = $('#ticket-description');
    const stepsListEl = $('#steps-list');
    const copyTicketBtn = $('#copy-ticket-btn');
    
    let commandsData = [];

    // Custom Matcher Function (no changes here, still perfect)
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

    // Fetch JSON data and initialize Select2
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

    // Event handler for when a command is selected
    select.on('change', function() {
        const selectedId = $(this).val();
        if (!selectedId) {
            // If selection is cleared, show placeholder and hide cards
            initialPlaceholder.removeClass('d-none');
            ticketCard.addClass('d-none');
            stepsCard.addClass('d-none');
            return;
        }
        
        // If an item is selected, hide placeholder and show cards
        initialPlaceholder.addClass('d-none');
        ticketCard.removeClass('d-none');
        stepsCard.removeClass('d-none');
        
        const command = commandsData.find(c => c.id === selectedId);
        displayCommandDetails(command);
    });

    // Function to display the details of the selected command
    function displayCommandDetails(command) {
        // --- NEW: Apply custom header colors and styles ---
        $('#ticket-card .card-header')
            .removeClass('header-blue header-green')
            .addClass('header-blue');
        $('#steps-card .card-header')
            .removeClass('header-blue header-green')
            .addClass('header-green');
        copyTicketBtn.addClass('btn-outline-light'); // Use a light button for dark header

        // Populate Ticket Description
        ticketDescriptionEl.text(command.ticket_template);
        copyTicketBtn.data('copy-text', command.ticket_template);

        // Populate Steps
        stepsListEl.empty();
        const ol = $('<ol class="list-group list-group-numbered"></ol>');
        command.execution.forEach(exec => {
            const li = $(`<li class="list-group-item border-0 ps-0">${exec.step}</li>`);
            if (exec.command) {
                const codeBlock = $(`
                    <div class="step-code">
                        <code>${exec.command}</code>
                        <button class="btn btn-dark copy-code-btn" title="Copy Command">
                            <i class="fa-regular fa-copy"></i>
                        </button>
                    </div>
                `);
                codeBlock.find('.copy-code-btn').data('copy-text', exec.command);
                li.append(codeBlock);
            }
            ol.append(li);
        });
        stepsListEl.append(ol);
    }

    // Generic copy function (no changes)
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

    // Event listener for ticket copy button (no changes)
    copyTicketBtn.on('click', function() {
        const textToCopy = $(this).data('copy-text');
        const formattedText = `> ${textToCopy} >`;
        copyToClipboard(formattedText, 'Ticket description copied!');
    });

    // Event listener for code copy buttons (no changes)
    $(document).on('click', '.copy-code-btn', function() {
        const textToCopy = $(this).data('copy-text');
        copyToClipboard(textToCopy, 'Command copied!');
    });
});