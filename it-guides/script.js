$(document).ready(function() {
    const select = $('#command-select');
    const resultsArea = $('#results-area');
    const ticketDescriptionEl = $('#ticket-description');
    const stepsListEl = $('#steps-list');
    const copyTicketBtn = $('#copy-ticket-btn');
    
    let commandsData = []; // To store the full original commands data

    // =================================================================
    // NEW: Custom Matcher Function for Select2
    // This function tells Select2 how to perform the search.
    // =================================================================
    function commandMatcher(params, data) {
        // If there are no search terms, return all the data
        if ($.trim(params.term) === '') {
            return data;
        }

        // Don't display the placeholder in the results
        if (typeof data.id === 'undefined' || data.id === '') {
            return null;
        }

        // Find the original command object using the ID from Select2's data
        const originalCommand = commandsData.find(c => c.id === data.id);
        if (!originalCommand) {
            return null;
        }

        const searchTerm = params.term.toLowerCase();

        // Check if the search term is in the title
        if (originalCommand.title.toLowerCase().includes(searchTerm)) {
            return data;
        }

        // Check if the search term is in any of the keywords
        if (originalCommand.keywords && originalCommand.keywords.length) {
            if (originalCommand.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm))) {
                return data;
            }
        }

        // If it doesn't match, do not return the data
        return null;
    }

    // Fetch JSON data and initialize Select2
    fetch('commands.json')
        .then(response => response.json())
        .then(data => {
            commandsData = data; // Store the original data with all details

            // =================================================================
            // UPDATED: Select2 Initialization
            // We now pass the data directly and include our custom matcher.
            // =================================================================
            select.select2({
                theme: 'bootstrap-5',
                placeholder: 'Search by keyword (e.g., sfc, dns, ip)...',
                allowClear: true,
                matcher: commandMatcher, // <-- This is the key change
                data: [
                    { id: '', text: '' }, // Add a blank option for the placeholder
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
            resultsArea.addClass('d-none'); // Hide results if nothing is selected
            return;
        }

        const command = commandsData.find(c => c.id === selectedId);
        displayCommandDetails(command);
    });

    // Function to display the details of the selected command (no changes here)
    function displayCommandDetails(command) {
        ticketDescriptionEl.text(command.ticket_template);
        copyTicketBtn.data('copy-text', command.ticket_template);

        stepsListEl.empty();
        const ol = $('<ol class="list-group list-group-numbered"></ol>');
        command.execution.forEach(exec => {
            const li = $(`<li class="list-group-item">${exec.step}</li>`);
            if (exec.command) {
                const codeBlock = $(`
                    <div class="step-code">
                        <code>${exec.command}</code>
                        <button class="btn btn-sm btn-outline-secondary copy-code-btn" title="Copy Command">
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
        
        resultsArea.removeClass('d-none');
    }

    // Generic copy function using SweetAlert for feedback (no changes here)
    function copyToClipboard(text, successMessage) {
        navigator.clipboard.writeText(text).then(() => {
            Swal.fire({
                icon: 'success',
                title: successMessage,
                showConfirmButton: false,
                timer: 1500
            });
        }).catch(err => {
            console.error('Failed to copy: ', err);
            Swal.fire('Error', 'Failed to copy text.', 'error');
        });
    }

    // Event listener for the ticket description copy button (no changes here)
    copyTicketBtn.on('click', function() {
        const textToCopy = $(this).data('copy-text');
        const formattedText = `> ${textToCopy} >`;
        copyToClipboard(formattedText, 'Ticket description copied!');
    });

    // Event listener for dynamically created code copy buttons (no changes here)
    $(document).on('click', '.copy-code-btn', function() {
        const textToCopy = $(this).data('copy-text');
        copyToClipboard(textToCopy, 'Command copied!');
    });
});