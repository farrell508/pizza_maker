// order.js 전체를 아래 코드로 덮어쓰세요
document.addEventListener('DOMContentLoaded', () => {
    const pizzaListContainer = document.getElementById('pizza-list-container');
    const finalTotalPriceEl = document.getElementById('final-total-price');
    const deliveryForm = document.getElementById('delivery-form');

    const cart = JSON.parse(localStorage.getItem('pizzaCart')) || [];
    
    if (cart.length === 0) {
        alert('장바구니에 담긴 피자가 없습니다. 첫 페이지로 돌아갑니다.');
        window.location.href = 'index.html';
        return;
    }

    let totalPrice = 0;
    cart.forEach(pizza => {
        const pizzaDiv = document.createElement('div');
        pizzaDiv.style.display = 'flex';
        pizzaDiv.style.alignItems = 'center';
        pizzaDiv.style.marginBottom = '10px';
        pizzaDiv.innerHTML = `
            <img src="${pizza.imageDataUrl}" style="width: 80px; border-radius: 50%; margin-right: 15px;">
            <div>
                <p><strong>${pizza.summary.size} 사이즈 피자</strong></p>
                <p>${pizza.summary.price}</p>
            </div>
        `;
        pizzaListContainer.appendChild(pizzaDiv);
        totalPrice += pizza.summary.priceValue;
    });

    finalTotalPriceEl.textContent = `₩${totalPrice.toLocaleString()}`;

    deliveryForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const allOrders = JSON.parse(localStorage.getItem('allOrders')) || [];

        const newOrder = {
            orderId: Date.now(),
            customer: {
                name: document.getElementById('customer-name').value,
                address: document.getElementById('customer-address').value,
                phone: document.getElementById('customer-phone').value,
            },
            pizzas: cart, // 단일 피자가 아닌 장바구니(피자 배열)를 저장
            totalPrice: `₩${totalPrice.toLocaleString()}`
        };

        allOrders.push(newOrder);
        localStorage.setItem('allOrders', JSON.stringify(allOrders));

        localStorage.removeItem('pizzaCart'); // 주문 완료 후 장바구니 비우기

        window.location.href = 'confirmation.html';
    });
});