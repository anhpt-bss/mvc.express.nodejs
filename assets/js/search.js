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
        fetch(`/api/service/global-search?q=${encodeURIComponent(query)}`, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Source: 'client',
            },
        })
            .then((response) => response.json())
            .then((response) => {
                if (response.error) {
                    console.error('Error global search:', response);
                    if (response.status_code === 401) {
                        showToastEventHandler(
                            'warning',
                            'Chưa đăng nhập hoặc phiên hoạt hộng hết hạn!',
                            'Vui lòng đăng nhập để tiếp tục!',
                            '',
                        );
                    } else {
                        showToastEventHandler('error', 'Tìm kiếm không thành công!', 'Vui lòng kiểm tra lại', '');
                    }
                } else {
                    console.log(response);
                    renderSuggestions(response.data);
                }
            })
            .catch((error) => {
                console.error('Error global search:', error);
                showToastEventHandler('error', 'Lỗi hệ thống nội bộ!', '', '');
            });
    }

    function renderSuggestions(suggestions) {
        if (suggestions.length === 0) {
            suggestionsBox.innerHTML = '<div class="suggestion-item">Không tìm thấy kết quả phù hợp</div>';
        } else {
            suggestionsBox.innerHTML = suggestions
                .map((item) => {
                    if (item.search_type === 'category') {
                        return `<div class="suggestion-item">
                        <div class="search-type">Danh mục</div>
                        <a href="${item.slug}">
                            <div>${item.name}</div>
                            <div><i>${item.description}</i></div>
                        </a>
                    </div>`;
                    } else if (item.search_type === 'product') {
                        return `<div class="suggestion-item">
                        <div class="search-type">Sản phẩm</div>
                        <a href="product/${item.slug}">
                            <div>${item.product_name}</div>
                            <div>${item.product_code}</div>
                            <div><i>${item.product_summary}</i></div>
                            <div><i>${item.manufacturer}</i></div>
                        </a>
                    </div>`;
                    } else if (item.search_type === 'blog') {
                        return `<div class="suggestion-item">
                        <div class="search-type">Tin tức</div>
                        <a href="blog/${item.slug}">
                            <div>${item.title}</div>
                            <div><i>${item.summary}</i></div>
                        </a>
                    </div>`;
                    }
                })
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
        if (!searchInput.contains(event.target) && !suggestionsBox.contains(event.target)) {
            suggestionsBox.innerHTML = '';
            suggestionsBox.style.display = 'none';
        }
    });
});
