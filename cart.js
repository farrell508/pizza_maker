document.addEventListener('DOMContentLoaded', () => {
    const cartItemsContainer = document.getElementById('cart-items-container');
    const totalCartPriceEl = document.getElementById('total-cart-price');
    const checkoutButton = document.getElementById('checkout-button');

    function renderCart() {
        const cart = JSON.parse(localStorage.getItem('pizzaCart')) || [];
        cartItemsContainer.innerHTML = ''; // 목록 비우기
        let totalPrice = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>장바구니가 비어있습니다. 맛있는 피자를 담아보세요!</p>';
            checkoutButton.style.display = 'none'; // 주문하기 버튼 숨기기
        } else {
            checkoutButton.style.display = 'inline-block';
        }

        cart.forEach(pizza => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'cart-item';
            itemDiv.innerHTML = `
                <img src="${pizza.imageDataUrl}" alt="주문 피자">
                <div class="cart-item-details">
                    <p><strong>${pizza.summary.size} 사이즈 피자</strong></p>
                    <p>${pizza.summary.toppings}</p>
                </div>
                <strong>${pizza.summary.price}</strong>
                <button class="cart-item-delete" data-pizza-id="${pizza.pizzaId}">삭제</button>
            `;
            cartItemsContainer.appendChild(itemDiv);
            totalPrice += pizza.summary.priceValue;
        });

        totalCartPriceEl.textContent = `₩${totalPrice.toLocaleString()}`;
    }

    // 삭제 버튼 기능
    cartItemsContainer.addEventListener('click', e => {
        if (e.target.classList.contains('cart-item-delete')) {
            const pizzaIdToDelete = parseInt(e.target.dataset.pizzaId);
            let cart = JSON.parse(localStorage.getItem('pizzaCart')) || [];
            
            // pizzaId가 다른 피자들만 남겨서 새 배열을 만듦
            cart = cart.filter(pizza => pizza.pizzaId !== pizzaIdToDelete);

            localStorage.setItem('pizzaCart', JSON.stringify(cart));
            renderCart(); // 장바구니 화면 다시 그리기
        }
    });

    renderCart(); // 페이지 로드 시 장바구니 그리기
});