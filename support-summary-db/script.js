$(document).ready(function() {
    let sentencesData = [];

    // Fetch data from the JSON file
    $.getJSON('data.json', function(data) {
        sentencesData = data;
        initializeSelect2(sentencesData);
        displayResults(sentencesData);
    });

    function initializeSelect2(data) {
        $('#search-box').select2({
            placeholder: "Type to search...",
            allowClear: true,
            data: data.map(item => ({ id: item.sentence, text: item.sentence })),
            minimumInputLength: 1,
            // Custom matcher to search in both sentence and tag
            matcher: function(params, data) {
                if ($.trim(params.term) === '') {
                    return data;
                }

                if (typeof data.text === 'undefined') {
                    return null;
                }

                const term = params.term.toLowerCase();
                const originalData = sentencesData.find(item => item.sentence === data.text);

                if (originalData) {
                    const sentence = originalData.sentence.toLowerCase();
                    const tag = originalData.tag.toLowerCase();

                    if (sentence.includes(term) || tag.includes(term)) {
                        return data;
                    }
                }

                return null;
            }
        }).on('select2:select', function (e) {
            const selectedSentence = e.params.data.id;
            const filteredData = sentencesData.filter(item => item.sentence === selectedSentence);
            displayResults(filteredData);
        }).on('select2:unselect', function () {
            displayResults(sentencesData);
        });
    }

    // Function to display results
    function displayResults(data) {
        const resultsContainer = $('#results-container');
        resultsContainer.empty();

        data.forEach(item => {
            const resultItem = `
                <div class="result-item">
                    <p class="sentence">${item.sentence}</p>
                    <p class="tag">${item.tag}</p>
                    <button class="copy-btn" title="Copy sentence">📋</button>
                </div>
            `;
            resultsContainer.append(resultItem);
        });
    }

    // Live search functionality
    $('#search-box').on('select2:open', function () {
        $('.select2-search__field').on('input', function() {
            const searchTerm = $(this).val();
            const filteredData = sentencesData.filter(item =>
                item.sentence.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.tag.toLowerCase().includes(searchTerm.toLowerCase())
            );
            displayResults(filteredData);
        });
    });

    // Event delegation for the copy button
    $('#results-container').on('click', '.copy-btn', function() {
        const sentence = $(this).siblings('.sentence').text();
        const tag = $(this).siblings('.tag').text();

        navigator.clipboard.writeText(sentence).then(() => {
            Swal.fire({
                title: 'Copied!',
                html: `<p><strong>Sentence:</strong> ${sentence}</p><p><strong>Tag:</strong> ${tag}</p>`,
                icon: 'success',
                confirmButtonText: 'Cool'
            });
        }).catch(err => {
            console.error('Failed to copy: ', err);
            Swal.fire({
                title: 'Error!',
                text: 'Failed to copy the sentence.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        });
    });
});