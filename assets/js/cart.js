document.addEventListener('DOMContentLoaded', function () {
    const addToCartButtons = document.querySelectorAll('.add-to-cart');

    addToCartButtons.forEach((button) => {
        button.addEventListener('click', function (event) {
            event.preventDefault();

            const productId = this.getAttribute('data-product');

            fetch('/api/cart/add', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Source: 'client',
                },
                body: JSON.stringify({ product_id: productId }),
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data.error) {
                        console.error('Error Add Cart:', data);
                        if (data.status_code === 401) {
                            showToastEventHandler(
                                'warning',
                                'Chưa đăng nhập hoặc phiên hoạt hộng hết hạn!',
                                'Vui lòng đăng nhập để sử dụng tính năng này!',
                                '',
                            );
                        } else {
                            showToastEventHandler(
                                'error',
                                'Thêm sản phẩm vào giở hàng không thành công!',
                                'Vui lòng kiểm tra lại',
                                '',
                            );
                        }
                    } else {
                        const toast = document.getElementById('number-item');
                        if (toast) {
                            toast.innerText = data.data.total || '';
                        }
                        showToastEventHandler(
                            'success',
                            'Thêm sản phẩm vào giỏ hàng thành công!',
                            'Vui lòng kiểm tra và thanh toán trong giỏ hàng',
                            '',
                        );
                    }
                })
                .catch((error) => {
                    console.error('Error Add Cart:', error);
                    showToastEventHandler('error', 'Lỗi hệ thống nội bộ!', '', '');
                });
        });
    });
});
