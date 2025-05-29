// document.addEventListener('DOMContentLoaded', function () {
//     const addToCartButtons = document.querySelectorAll('#add_to_cart_btn');

//     addToCartButtons.forEach((button) => {
//         button.addEventListener('click', function (event) {
//             event.preventDefault();

//             const productId = this.getAttribute('data-product');

//             fetch('/api/cart/add', {
//                 method: 'POST',
//                 headers: {
//                     Accept: 'application/json',
//                     'Content-Type': 'application/json',
//                     Source: 'client',
//                 },
//                 body: JSON.stringify({ product_id: productId }),
//             })
//                 .then((response) => response.json())
//                 .then((data) => {
//                     if (data.error) {
//                         console.error('Error Add Cart:', data);
//                         if (data.status_code === 401) {
//                             showToastEventHandler(
//                                 'warning',
//                                 'Chưa đăng nhập hoặc phiên hoạt hộng hết hạn!',
//                                 'Vui lòng đăng nhập để tiếp tục!',
//                                 '',
//                             );
//                         } else {
//                             showToastEventHandler(
//                                 'error',
//                                 'Thêm sản phẩm vào giỏ hàng không thành công!',
//                                 'Vui lòng kiểm tra lại',
//                                 '',
//                             );
//                         }
//                     } else {
//                         const toast = document.getElementById('number-item');
//                         if (toast) {
//                             toast.innerText = data.data.total || '';
//                         }
//                         showToastEventHandler(
//                             'success',
//                             'Thêm sản phẩm vào giỏ hàng thành công!',
//                             'Vui lòng kiểm tra và thanh toán trong giỏ hàng',
//                             '',
//                         );
//                     }
//                 })
//                 .catch((error) => {
//                     console.error('Error Add Cart:', error);
//                     showToastEventHandler('error', 'Lỗi hệ thống nội bộ!', '', '');
//                 });
//         });
//     });
// });

document.addEventListener('DOMContentLoaded', function () {
    const addToCartButtons = document.querySelectorAll('#add_to_cart_btn');
    const buyNowButton = document.getElementById('buy_now_btn');
    const quantityInput = document.getElementById('quantity_input');
    const incrementButton = document.getElementById('increment_btn');
    const decrementButton = document.getElementById('decrement_btn');

    // Set initial quantity
    let quantity = quantityInput ? parseInt(quantityInput.value) : 1;

    // Update quantity input and disable decrement button if quantity <= 1
    function updateQuantity(newQuantity) {
        quantity = newQuantity;
        quantityInput.value = quantity;
        decrementButton.disabled = quantity <= 1;
    }

    // Handle increment button
    if (incrementButton) {
        incrementButton.addEventListener('click', function () {
            updateQuantity(quantity + 1);
        });
    }

    // Handle decrement button
    if (decrementButton) {
        decrementButton.addEventListener('click', function () {
            if (quantity > 1) {
                updateQuantity(quantity - 1);
            }
        });
    }

    // Function to handle cart actions (Add to Cart / Buy Now)
    function handleCartAction(productId, action) {
        fetch('/api/cart/add', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Source: 'client',
            },
            body: JSON.stringify({ product_id: productId, quantity: quantity }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.error) {
                    console.error('Error Add Cart:', data);
                    if (data.status_code === 401) {
                        showToastEventHandler(
                            'warning',
                            'Chưa đăng nhập hoặc phiên hoạt hộng hết hạn!',
                            'Vui lòng đăng nhập để tiếp tục!',
                            '',
                        );
                    } else {
                        showToastEventHandler(
                            'error',
                            'Thêm sản phẩm vào giỏ hàng không thành công!',
                            'Vui lòng kiểm tra lại',
                            '',
                        );
                    }
                } else {
                    const toast = document.getElementById('number-item');
                    if (toast) {
                        toast.innerText = data.data.total || '';
                    }

                    // Redirect based on action
                    if (action === 'buy_now') {
                        window.location.href = '/cart'; // Redirect to checkout page
                    } else if (action === 'add_to_cart') {
                        showToastEventHandler(
                            'success',
                            'Thêm sản phẩm vào giỏ hàng thành công!',
                            'Vui lòng kiểm tra và thanh toán trong giỏ hàng',
                            '',
                        );
                    }
                }
            })
            .catch((error) => {
                console.error('Error Add Cart:', error);
                showToastEventHandler('error', 'Lỗi hệ thống nội bộ!', '', '');
            });
    }

    // Add event listeners to "Add to Cart" buttons
    if (addToCartButtons) {
        addToCartButtons.forEach((button) => {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                const productId = this.getAttribute('data-product');
                handleCartAction(productId, 'add_to_cart');
            });
        });
    }

    // Event listener for "Buy Now" button
    if (buyNowButton) {
        buyNowButton.addEventListener('click', function (event) {
            event.preventDefault();
            const productId = this.getAttribute('data-product');
            handleCartAction(productId, 'buy_now');
        });
    }
});
