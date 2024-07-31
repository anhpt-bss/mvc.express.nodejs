document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const suggestionsBox = document.getElementById('suggestions');
    let debounceTimeout;

    searchInput.addEventListener('input', () => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
            const query = searchInput.value.trim();
            if (query) {
                fetchSuggestions(query);
            } else {
                suggestionsBox.innerHTML = '';
                suggestionsBox.style.display = 'none';
            }
        }, 300);
    });

    function fetchSuggestions(query) {
        fetch(`/search?q=${encodeURIComponent(query)}`)
            .then((response) => response.json())
            .then((data) => {
                renderSuggestions(data);
            })
            .catch((error) => {
                const data = ['a', 'b'];
                renderSuggestions(data);
                console.error('Error fetching suggestions:', error);
            });
    }

    function renderSuggestions(suggestions) {
        if (suggestions.length === 0) {
            suggestionsBox.innerHTML =
                '<div class="suggestion-item">No suggestions found</div>';
        } else {
            suggestionsBox.innerHTML = suggestions
                .map((item) => `<div class="suggestion-item">${item}</div>`)
                .join('');
        }
        suggestionsBox.style.display = 'block';
    }

    suggestionsBox.addEventListener('click', (event) => {
        if (event.target.classList.contains('suggestion-item')) {
            searchInput.value = event.target.textContent;
            suggestionsBox.innerHTML = '';
            suggestionsBox.style.display = 'none';
        }
    });

    document.addEventListener('click', (event) => {
        if (
            !searchInput.contains(event.target) &&
            !suggestionsBox.contains(event.target)
        ) {
            suggestionsBox.innerHTML = '';
            suggestionsBox.style.display = 'none';
        }
    });
});
