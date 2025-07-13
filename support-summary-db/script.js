$(document).ready(function() {
    let sentencesData = [];
    const $initialPrompt = $('#initial-prompt');
    const $resultsContainer = $('#results-container');

    // Fetch data and initialize
    $.getJSON('data.json', function(data) {
        sentencesData = data;
        initializeSelect2(sentencesData);
    });

    // Initialize Select2 with live search
    function initializeSelect2(data) {
        const $searchBox = $('#search-box');

        $searchBox.select2({
            // THIS IS THE FIX: It tells Select2 to adopt the width of its container.
            width: 'resolve', 
            
            placeholder: "Search by keyword or tag...",
            allowClear: true,
            data: data.map(item => ({ id: item.sentence, text: item.sentence })),
            minimumInputLength: 1,
            matcher: customMatcher
        }).on('select2:select', function (e) {
            const selectedSentence = e.params.data.id;
            const filteredData = sentencesData.filter(item => item.sentence === selectedSentence);
            displayResults(filteredData);
        }).on('select2:unselect', function () {
            showInitialState();
        });
    }

    // Custom matching function for Select2
    function customMatcher(params, data) {
        if ($.trim(params.term) === '') return data;
        if (typeof data.text === 'undefined') return null;
        
        const term = params.term.toLowerCase();
        const originalData = sentencesData.find(item => item.sentence === data.text);

        if (originalData && (originalData.sentence.toLowerCase().includes(term) || originalData.tag.toLowerCase().includes(term))) {
            return data;
        }
        return null;
    }
    
    // Live search by directly listening to the input field created by Select2
    $(document).on('input', '.select2-search__field', function () {
        const searchTerm = $(this).val().toLowerCase();
        if (searchTerm.length > 0) {
            const filteredData = sentencesData.filter(item =>
                item.sentence.toLowerCase().includes(searchTerm) ||
                item.tag.toLowerCase().includes(searchTerm)
            );
            displayResults(filteredData);
        } else {
            showInitialState();
        }
    });

    // Function to display results
    function displayResults(data) {
        $initialPrompt.hide();
        $resultsContainer.empty().show();

        if (data.length === 0) {
             $resultsContainer.html('<p style="text-align:center; color: #718096;">No matches found.</p>');
             return;
        }

        data.forEach(item => {
            const resultItem = `
                <div class="result-item">
                    <p class="sentence">${item.sentence}</p>
                    <span class="tag">${item.tag}</span>
                    <button class="copy-btn" title="Copy sentence">
                        <i class="far fa-copy"></i>
                    </button>
                </div>
            `;
            $resultsContainer.append(resultItem);
        });
    }
    
    // Function to revert to the initial view
    function showInitialState() {
        $resultsContainer.hide().empty();
        $initialPrompt.show();
    }

    // Event delegation for the copy button
    $resultsContainer.on('click', '.copy-btn', function() {
        const $resultItem = $(this).closest('.result-item');
        const sentence = $resultItem.find('.sentence').text();
        const tag = $resultItem.find('.tag').text();

        navigator.clipboard.writeText(sentence).then(() => {
            Swal.fire({
                icon: 'success',
                title: 'Copied to Clipboard!',
                html: `
                    <div class="swal-copy-info">
                        <strong>Sentence:</strong> <p>${sentence}</p>
                    </div>
                    <div class="swal-copy-info">
                        <strong>Tag:</strong> <p>${tag}</p>
                    </div>
                `,
                confirmButtonText: 'Great!',
                confirmButtonColor: 'var(--accent-color)'
            });
        });
    });
    
    // Initial state on page load
    showInitialState();
});