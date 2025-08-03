document.addEventListener('DOMContentLoaded', loadSnippets);

const snippetForm = document.getElementById('snippet-form');
const snippetList = document.getElementById('snippet-list');
const noSnippetsMessage = document.getElementById('no-snippets-message');
const messageBox = document.getElementById('message-box');
const messageText = document.getElementById('message-text');
const messageIcon = document.getElementById('message-icon');
const snippetCount = document.getElementById('snippet-count');

// Icons for the message box
const icons = {
    success: `
        <svg class="w-5 h-5 text-green-700" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>`,
    error: `
        <svg class="w-5 h-5 text-red-700" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>`,
    delete: `
        <svg class="w-5 h-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clip-rule="evenodd" />
        </svg>`
};

// Show a temporary, animated message
let messageTimeout;
function showMessage(text, type = 'success') {
    clearTimeout(messageTimeout);
    
    messageIcon.innerHTML = icons[type] || icons.success;
    messageText.textContent = text;
    messageText.className = 'text-sm font-medium'; // Reset classes
    if (type === 'error') {
        messageText.classList.add('text-red-700');
    } else {
        messageText.classList.add('text-slate-700');
    }
    
    messageBox.classList.remove('hidden', 'fade-out-down');
    messageBox.classList.add('fade-in-up');

    messageTimeout = setTimeout(() => {
        messageBox.classList.remove('fade-in-up');
        messageBox.classList.add('fade-out-down');
    }, 2500);
}

// Function to render the snippets list
function renderSnippets(snippets) {
    snippetList.innerHTML = ''; // Clear existing list
    const shortcuts = Object.keys(snippets);

    if (shortcuts.length === 0) {
        noSnippetsMessage.classList.remove('hidden');
        snippetCount.classList.add('hidden');
    } else {
        noSnippetsMessage.classList.add('hidden');
        snippetCount.textContent = shortcuts.length;
        snippetCount.classList.remove('hidden');

        shortcuts.sort().forEach(shortcut => {
            const expansion = snippets[shortcut];
            const li = document.createElement('li');
            li.className = 'bg-white p-3 rounded-xl shadow-sm flex items-center justify-between';
            li.innerHTML = `
                <div class="flex-1 min-w-0">
                    <div class="font-mono text-sm font-semibold text-indigo-700 bg-indigo-50 px-2 py-1 rounded-md inline-block">${shortcut}</div>
                    <p class="mt-1 text-sm text-slate-600 truncate" title="${expansion}">${expansion}</p>
                </div>
                <button data-shortcut="${shortcut}" class="delete-btn flex-shrink-0 text-slate-500 bg-slate-100 border border-slate-300 hover:bg-red-100 hover:text-red-700 transition-all p-2 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                </button>
            `;
            snippetList.appendChild(li);
        });
    }
}

// Load snippets from chrome.storage.local
async function loadSnippets() {
    try {
        const result = await chrome.storage.local.get('snippets');
        renderSnippets(result.snippets || {});
    } catch (error) {
        console.error('Failed to load snippets:', error);
        showMessage('Could not load snippets.', 'error');
    }
}

// Handle form submission to save a new snippet
snippetForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const shortcutInput = document.getElementById('shortcut');
    const expansionInput = document.getElementById('expansion');
    const shortcut = shortcutInput.value.trim();
    const expansion = expansionInput.value.trim();

    if (shortcut && expansion) {
        try {
            const result = await chrome.storage.local.get('snippets');
            const snippets = result.snippets || {};
            
            if (snippets[shortcut]) {
                showMessage(`Shortcut "${shortcut}" already exists.`, 'error');
                return;
            }

            snippets[shortcut] = expansion;
            await chrome.storage.local.set({ snippets: snippets });
            
            showMessage('Snippet saved successfully!', 'success');
            snippetForm.reset();
            shortcutInput.focus();
            loadSnippets(); // Reload the list
        } catch (error) {
            console.error('Failed to save snippet:', error);
            showMessage('Error saving snippet.', 'error');
        }
    }
});

// Handle snippet deletion
snippetList.addEventListener('click', async (e) => {
    const deleteButton = e.target.closest('.delete-btn');
    if (deleteButton) {
        const shortcutToDelete = deleteButton.getAttribute('data-shortcut');

        try {
            const result = await chrome.storage.local.get('snippets');
            const snippets = result.snippets || {};
            delete snippets[shortcutToDelete];
            await chrome.storage.local.set({ snippets: snippets });
            
            showMessage(`Snippet "${shortcutToDelete}" deleted.`, 'delete');
            loadSnippets(); // Reload the list
        } catch (error) {
            console.error('Failed to delete snippet:', error);
            showMessage('Error deleting snippet.', 'error');
        }
    }
});