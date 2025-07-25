$(document).ready(function() {
    let sentencesData = [];
    const $initialPrompt = $('#initial-prompt');
    const $resultsContainer = $('#results-container');
    const $searchBox = $('#search-box');
    const $clearBtn = $('#clear-search-btn');
    const $stickySection = $('.sticky-top-section');

    // Fetch data from the JSON file
    $.getJSON('data.json', function(data) {
        sentencesData = data;
    });

    // Add shadow to sticky header on scroll
    $(window).on('scroll', function() {
        if ($(window).scrollTop() > 10) {
            $stickySection.addClass('is-scrolled');
        } else {
            $stickySection.removeClass('is-scrolled');
        }
    });
    
    // Live search functionality
    $searchBox.on('input', function() {
        const searchTerm = $(this).val().toLowerCase();

        if (searchTerm.length > 0) {
            $clearBtn.show();
            const filteredData = sentencesData.filter(item =>
                item.sentence.toLowerCase().includes(searchTerm) ||
                item.tag.toLowerCase().includes(searchTerm) ||
                (item.keywords && item.keywords.toLowerCase().includes(searchTerm))
            );
            displayResults(filteredData);
        } else {
            showInitialState();
        }
    });

    // Event handler for the clear button
    $clearBtn.on('click', function() {
        $searchBox.val('').focus();
        showInitialState();
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
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            `;
            $resultsContainer.append(resultItem);
        });
    }
    
    // Function to revert to the initial view
    function showInitialState() {
        $resultsContainer.hide().empty();
        $clearBtn.hide();
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
                    <div class="swal-grid-container">
                        <div class="swal-label">Sentence:</div>
                        <div class="swal-value">${sentence}</div>
                        <div class="swal-label">Tag:</div>
                        <div class="swal-value">${tag}</div>
                    </div>
                `,
                confirmButtonText: 'Great!',
                confirmButtonColor: 'var(--accent-color)'
            });
        }).catch(err => {
            console.error('Failed to copy: ', err);
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Something went wrong, and we could not copy the text.'
            });
        });
    });
    
    // Initial state on page load
    showInitialState();
});