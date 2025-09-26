document.addEventListener('DOMContentLoaded', () => {
    const orderListContainer = document.getElementById('order-list-container');
    const clearOrdersButton = document.getElementById('clear-orders-button');

    function loadOrders() {
        orderListContainer.innerHTML = '';
        const allOrders = JSON.parse(localStorage.getItem('allOrders')) || [];
        
        if (allOrders.length === 0) {
            orderListContainer.innerHTML = '<p>아직 접수된 주문이 없습니다.</p>';
            return;
        }

        allOrders.reverse();

        allOrders.forEach(order => {
            const orderCard = document.createElement('div');
            orderCard.className = 'order-card';

            let pizzasHtml = '';
            order.pizzas.forEach(pizza => {
                pizzasHtml += `
                    <div style="display: flex; align-items: center; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
                        <img src="${pizza.imageDataUrl}" alt="주문 피자" style="width: 80px; border-radius: 50%; margin-right: 10px;">
                        <div>${pizza.summary.base} ${pizza.summary.toppings}</div>
                    </div>
                `;
            });

            // --- 주문 시간 표시 기능 추가 ---
            const orderDate = new Date(order.orderId);
            const formattedDate = orderDate.toLocaleString('ko-KR', {
                year: 'numeric', month: 'long', day: 'numeric', 
                hour: '2-digit', minute: '2-digit'
            });
            
            orderCard.innerHTML = `
                <div class="order-card-details" style="flex: 2;">
                    <h4>주문 번호: ${order.orderId}</h4>
                    <p style="font-size: 12px; color: #666;"><strong>주문 시간:</strong> ${formattedDate}</p>
                    <p><strong>총 주문금액: ${order.totalPrice}</strong></p>
                    <hr>
                    ${pizzasHtml}
                </div>
                <div class="order-card-customer" style="flex: 1;">
                    <h4>주문자 정보</h4>
                    <p><strong>이름:</strong> ${order.customer.name}</p>
                    <p><strong>주소:</strong> ${order.customer.address}</p>
                    <p><strong>연락처:</strong> ${order.customer.phone}</p>
                    <div class="order-card-actions">
                        <button class="btn-reject" data-order-id="${order.orderId}">주문 거부</button>
                    </div>
                </div>
            `;
            orderListContainer.appendChild(orderCard);
        });
    }

    // --- 주문 거부(개별 삭제) 이벤트 리스너 ---
    orderListContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-reject')) {
            const orderIdToDelete = parseInt(e.target.dataset.orderId);
            
            if (confirm(`주문 번호 [${orderIdToDelete}]를 정말로 거부(삭제)하시겠습니까?`)) {
                let allOrders = JSON.parse(localStorage.getItem('allOrders')) || [];
                // orderId가 다른 주문들만 남겨서 새 배열 생성
                const updatedOrders = allOrders.filter(order => order.orderId !== orderIdToDelete);
                localStorage.setItem('allOrders', JSON.stringify(updatedOrders));
                loadOrders(); // 목록 새로고침
            }
        }
    });

    clearOrdersButton.addEventListener('click', () => {
        if (confirm('정말로 모든 주문 내역을 삭제하시겠습니까?')) {
            localStorage.removeItem('allOrders');
            loadOrders();
        }
    });

    loadOrders();
});