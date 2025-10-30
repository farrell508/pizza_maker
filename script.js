document.addEventListener('DOMContentLoaded', () => {
    // --- 데이터 및 상태 변수 ---
    const basePrices = { Small: 12000, Medium: 15000, Large: 18000 };
    const pizzaSizes = { Small: 150, Medium: 180, Large: 210 };
    const baseData = { dough: { original: { name: '오리지널', color: '#d7854aff' }, thin: { name: '씬', color: '#e4b975' } }, sauce: { tomato: { name: '토마토', color: '#DC143C' }, cream: { name: '소스 없음', color: 'transparent' } }, baseCheese: { mozzarella: { name: '모짜렐라', color: '#ffeb3b' }, none: { name: '치즈 없음', color: 'transparent' } } };
    const toppingData = { 
        meat: [ 
            { id: 'pepperoni', name: '페퍼로니', price: 150, color: '#B22222', size: 18, shape: 'circle' }, 
            { id: 'sausage', name: '소시지', price: 150, color: '#8B4513', size: 20, shape: 'oval' }, 
            { id: 'bacon', name: '베이컨', price: 150, color: '#CD853F', size: 12, shape: 'rect' }, 
            { id: 'ham', name: '햄', price: 150, color: '#FFB6C1', size: 16, shape: 'square' },
            { id: 'chicken', name: '치킨', price: 200, color: '#DEB887', size: 14, shape: 'irregular' },
            { id: 'beef', name: '불고기', price: 200, color: '#A0522D', size: 15, shape: 'strip' }
        ], 
        vegetable: [ 
            { id: 'tomato', name: '토마토', price: 150, color: '#FF4500', size: 22, shape: 'slice' }, 
            { id: 'bell-pepper', name: '피망', price: 150, color: '#228B22', size: 15, shape: 'ring' }, 
            { id: 'onion', name: '양파', price: 150, color: '#E6E6FA', size: 18, shape: 'ring' }, 
            { id: 'mushroom', name: '버섯', price: 150, color: '#F5DEB3', size: 16, shape: 'mushroom' },
            { id: 'olive', name: '올리브', price: 150, color: '#556B2F', size: 8, shape: 'oval' },
            { id: 'corn', name: '옥수수', price: 150, color: '#FFD700', size: 6, shape: 'corn' },
            { id: 'pineapple', name: '파인애플', price: 150, color: '#FFFF00', size: 20, shape: 'triangle' },
            { id: 'jalapeño', name: '할라피뇨', price: 150, color: '#32CD32', size: 12, shape: 'pepper' }
        ], 
        cheese: [ 
            { id: 'mozzarella-top', name: '모짜렐라(토핑)', price: 150, color: '#FFFACD', size: 15, shape: 'blob' }, 
            { id: 'cheddar', name: '체다', price: 150, color: '#FFA500', size: 12, shape: 'square' }, 
            { id: 'parmesan', name: '파마산', price: 200, color: '#F0E68C', size: 10, shape: 'sprinkle' },
            { id: 'gouda', name: '고다', price: 200, color: '#DAA520', size: 14, shape: 'triangle' }
        ] 
    };
    let currentState = { size: 'Small', dough: 'original', sauce: 'tomato', baseCheese: 'mozzarella', showGuide: false, };
    let activeToppingId = null;
    let placedToppings = [];

    // --- DOM 요소 ---
    const canvas = document.getElementById('pizza-canvas');
    const ctx = canvas.getContext('2d');
    const ingredientsGrid = document.getElementById('ingredients-grid');
    const cartCount = document.getElementById('cart-count');
    const tabs = document.querySelectorAll('.tab');
    const sizeBtns = document.querySelectorAll('.size-btn');
    const guideToggle = document.getElementById('symmetry-guide-toggle');
    const summaryBaseList = document.getElementById('summary-base-list');
    const summaryToppingsList = document.getElementById('summary-toppings-list');
    const summarySize = document.getElementById('summary-size');
    const totalPriceEl = document.getElementById('total-price');
    const resetButton = document.getElementById('reset-button');
    const addToCartButton = document.querySelector('.btn-add-cart');

    // --- 함수 ---
    function updateCartCount() {
        const cart = JSON.parse(localStorage.getItem('pizzaCart')) || [];
        cartCount.textContent = cart.length;
    }
    
    function renderToppings(category) { 
        ingredientsGrid.innerHTML = ''; 
        toppingData[category].forEach(topping => { 
            const item = document.createElement('div'); 
            item.className = 'ingredient-item'; 
            item.dataset.toppingId = topping.id; 
            item.innerHTML = ` 
                <div class="icon" style="background-color: ${topping.color};"></div> 
                <p>${topping.name}</p> 
                <span class="topping-price">+${topping.price.toLocaleString()}원</span> 
            `; 
            item.addEventListener('click', () => { 
                activeToppingId = topping.id; 
                document.querySelectorAll('.ingredient-item').forEach(el => el.classList.remove('active')); 
                item.classList.add('active'); 
            }); 
            ingredientsGrid.appendChild(item); 
        }); 
    }
    
    function drawPizza() { 
        ctx.clearRect(0, 0, canvas.width, canvas.height); 
        const centerX = canvas.width / 2; 
        const centerY = canvas.height / 2; 
        const radius = pizzaSizes[currentState.size]; 
        
        // 도우
        ctx.beginPath(); 
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI); 
        ctx.fillStyle = baseData.dough[currentState.dough].color; 
        ctx.fill(); 
        
        // 소스
        const sauceColor = baseData.sauce[currentState.sauce].color; 
        if (sauceColor !== 'transparent') { 
            ctx.beginPath(); 
            ctx.arc(centerX, centerY, radius * 0.9, 0, 2 * Math.PI); 
            ctx.fillStyle = sauceColor; 
            ctx.fill(); 
        } 
        
        // 기본 치즈
        const cheeseColor = baseData.baseCheese[currentState.baseCheese].color; 
        if (cheeseColor !== 'transparent') { 
            ctx.beginPath(); 
            ctx.arc(centerX, centerY, radius * 0.88, 0, 2 * Math.PI); 
            ctx.fillStyle = cheeseColor; 
            ctx.globalAlpha = 0.8; 
            ctx.fill(); 
            ctx.globalAlpha = 1.0; 
        } 
        
        // 토핑들
        placedToppings.forEach(topping => { 
            ctx.fillStyle = topping.color; 
            ctx.beginPath(); 
            
            switch(topping.shape) {
                case 'rect': // 베이컨
                    ctx.fillRect(topping.x - topping.size * 2, topping.y - topping.size / 2, topping.size * 4, topping.size);
                    break;
                case 'square': // 햄, 체다치즈
                    ctx.fillRect(topping.x - topping.size/2, topping.y - topping.size/2, topping.size, topping.size);
                    break;
                case 'oval': // 소시지, 올리브
                    ctx.ellipse(topping.x, topping.y, topping.size/2, topping.size/3, 0, 0, 2 * Math.PI);
                    break;
                case 'ring': // 피망, 양파
                    ctx.arc(topping.x, topping.y, topping.size / 2, 0, 2 * Math.PI); 
                    ctx.moveTo(topping.x + topping.size / 3, topping.y); 
                    ctx.arc(topping.x, topping.y, topping.size / 3, 0, 2 * Math.PI, true);
                    break;
                case 'slice': // 토마토 슬라이스
                    ctx.arc(topping.x, topping.y, topping.size / 2, 0, Math.PI);
                    ctx.closePath();
                    break;
                case 'triangle': // 파인애플, 고다치즈
                    ctx.moveTo(topping.x, topping.y - topping.size/2);
                    ctx.lineTo(topping.x - topping.size/2, topping.y + topping.size/2);
                    ctx.lineTo(topping.x + topping.size/2, topping.y + topping.size/2);
                    ctx.closePath();
                    break;
                case 'mushroom': // 버섯
                    // 버섯 갓
                    ctx.arc(topping.x, topping.y - topping.size/4, topping.size/2, 0, Math.PI, true);
                    // 버섯 대
                    ctx.fillRect(topping.x - topping.size/6, topping.y - topping.size/4, topping.size/3, topping.size/2);
                    break;
                case 'corn': // 옥수수
                    for(let i = 0; i < 3; i++) {
                        for(let j = 0; j < 2; j++) {
                            ctx.fillRect(topping.x - 6 + i*4, topping.y - 3 + j*6, 3, 3);
                        }
                    }
                    break;
                case 'pepper': // 할라피뇨
                    ctx.ellipse(topping.x, topping.y, topping.size/2, topping.size/4, Math.PI/6, 0, 2 * Math.PI);
                    break;
                case 'blob': // 모짜렐라 토핑
                    // 불규칙한 치즈 모양
                    ctx.arc(topping.x, topping.y, topping.size/2, 0, 2 * Math.PI);
                    ctx.arc(topping.x + topping.size/4, topping.y - topping.size/4, topping.size/3, 0, 2 * Math.PI);
                    break;
                case 'sprinkle': // 파마산 치즈
                    for(let i = 0; i < 5; i++) {
                        const offsetX = (Math.random() - 0.5) * topping.size;
                        const offsetY = (Math.random() - 0.5) * topping.size;
                        ctx.fillRect(topping.x + offsetX, topping.y + offsetY, 2, 2);
                    }
                    break;
                case 'irregular': // 치킨
                    // 불규칙한 치킨 조각
                    ctx.moveTo(topping.x, topping.y - topping.size/2);
                    ctx.lineTo(topping.x + topping.size/3, topping.y - topping.size/4);
                    ctx.lineTo(topping.x + topping.size/2, topping.y + topping.size/3);
                    ctx.lineTo(topping.x - topping.size/4, topping.y + topping.size/2);
                    ctx.lineTo(topping.x - topping.size/2, topping.y);
                    ctx.closePath();
                    break;
                case 'strip': // 불고기
                    ctx.fillRect(topping.x - topping.size, topping.y - topping.size/4, topping.size*2, topping.size/2);
                    // 불고기 스트립에 텍스처 추가
                    ctx.fillStyle = '#654321';
                    ctx.fillRect(topping.x - topping.size/2, topping.y - topping.size/8, topping.size, topping.size/4);
                    ctx.fillStyle = topping.color; // 원래 색상으로 복원
                    break;
                default: // 기본 원형 (페퍼로니 등)
                    ctx.arc(topping.x, topping.y, topping.size / 2, 0, 2 * Math.PI);
                    break;
            }
            ctx.fill(); 
        }); 
        
        // 대칭 가이드
        if (currentState.showGuide) { 
            ctx.beginPath(); 
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)'; 
            ctx.lineWidth = 1; 
            ctx.setLineDash([4, 8]); 
            for (let i = 0; i < 4; i++) { 
                const angle = (i * Math.PI) / 4; 
                ctx.moveTo(centerX - Math.cos(angle) * radius, centerY - Math.sin(angle) * radius); 
                ctx.lineTo(centerX + Math.cos(angle) * radius, centerY + Math.sin(angle) * radius); 
            } 
            ctx.stroke(); 
            ctx.setLineDash([]); 
        } 
    }
    
    function updateSummary() { 
        summaryBaseList.innerHTML = ` 
            <li>도우: ${baseData.dough[currentState.dough].name}</li> 
            <li>소스: ${baseData.sauce[currentState.sauce].name}</li> 
            <li>치즈: ${baseData.baseCheese[currentState.baseCheese].name}</li> 
        `; 
        
        const toppingCounts = {}; 
        let toppingsPrice = 0; 
        placedToppings.forEach(t => { 
            toppingCounts[t.name] = (toppingCounts[t.name] || 0) + 1; 
            toppingsPrice += t.price; 
        }); 
        
        if (Object.keys(toppingCounts).length === 0) { 
            summaryToppingsList.innerHTML = '<li>항목 없음</li>'; 
        } else { 
            summaryToppingsList.innerHTML = ''; 
            for (const name in toppingCounts) { 
                const li = document.createElement('li'); 
                li.textContent = `${name} x${toppingCounts[name]}`; 
                summaryToppingsList.appendChild(li); 
            } 
        } 
        
        summarySize.textContent = currentState.size; 
        let total = basePrices[currentState.size]; 
        if (currentState.sauce === 'cream') { 
            total -= 1000; 
        } 
        if (currentState.baseCheese === 'none') { 
            total -= 1000; 
        } 
        total += toppingsPrice; 
        totalPriceEl.textContent = `₩${total.toLocaleString()}`; 
    }
    
    function reset() { 
        currentState = { size: 'Small', dough: 'original', sauce: 'tomato', baseCheese: 'mozzarella', showGuide: false }; 
        activeToppingId = null; 
        placedToppings = []; 
        guideToggle.checked = false; 
        document.querySelectorAll('.active').forEach(el => el.classList.remove('active')); 
        document.querySelector('.tab').classList.add('active'); 
        document.querySelector('.size-btn[data-size="Small"]').classList.add('active'); 
        document.querySelector('.option-btn[data-dough="original"]').classList.add('active'); 
        document.querySelector('.option-btn[data-sauce="tomato"]').classList.add('active'); 
        document.querySelector('.option-btn[data-cheese="mozzarella"]').classList.add('active'); 
        renderToppings('meat'); 
        drawPizza(); 
        updateSummary(); 
    }
    
    // --- 이벤트 리스너 ---
    document.querySelector('.base-selection').addEventListener('click', e => { 
        const btn = e.target.closest('.option-btn'); 
        if (!btn) return; 
        const group = btn.parentElement; 
        const valueKey = Object.keys(btn.dataset)[0]; 
        const stateKey = valueKey === 'cheese' ? 'baseCheese' : valueKey; 
        group.querySelectorAll('.option-btn').forEach(b => b.classList.remove('active')); 
        btn.classList.add('active'); 
        currentState[stateKey] = btn.dataset[valueKey]; 
        drawPizza(); 
        updateSummary(); 
    });
    
    guideToggle.addEventListener('change', e => { 
        currentState.showGuide = e.target.checked; 
        drawPizza(); 
    });
    
    // 토핑 추가 (왼쪽 클릭)
    canvas.addEventListener('click', e => { 
        if (!activeToppingId) return; 
        const allToppings = [].concat(...Object.values(toppingData)); 
        const topping = allToppings.find(t => t.id === activeToppingId); 
        const rect = canvas.getBoundingClientRect(); 
        const x = e.clientX - rect.left; 
        const y = e.clientY - rect.top; 
        const centerX = canvas.width / 2; 
        const centerY = canvas.height / 2; 
        const distance = Math.sqrt((x - centerX)**2 + (y - centerY)**2); 
        
        if (distance < pizzaSizes[currentState.size] * 0.9) { 
            if (currentState.showGuide) { 
                const relX = x - centerX; 
                const relY = y - centerY; 
                for (let i = 0; i < 8; i++) { 
                    const angle = i * (Math.PI / 4); 
                    const rotatedX = relX * Math.cos(angle) - relY * Math.sin(angle); 
                    const rotatedY = relX * Math.sin(angle) + relY * Math.cos(angle); 
                    placedToppings.push({ ...topping, x: centerX + rotatedX, y: centerY + rotatedY }); 
                } 
            } else { 
                placedToppings.push({ ...topping, x, y }); 
            } 
            drawPizza(); 
            updateSummary(); 
        } 
    });
    
    // 토핑 삭제 (우클릭)
    canvas.addEventListener('contextmenu', e => {
        e.preventDefault();
        
        const rect = canvas.getBoundingClientRect(); 
        const x = e.clientX - rect.left; 
        const y = e.clientY - rect.top; 
        
        // 클릭 위치에서 가장 가까운 토핑 찾기
        let minDistance = Infinity;
        let closestIndex = -1;
        
        placedToppings.forEach((topping, index) => {
            const distance = Math.sqrt((x - topping.x)**2 + (y - topping.y)**2);
            if (distance < topping.size && distance < minDistance) {
                minDistance = distance;
                closestIndex = index;
            }
        });
        
        if (closestIndex !== -1) {
            placedToppings.splice(closestIndex, 1);
            drawPizza();
            updateSummary();
        }
    });
    
    tabs.forEach(tab => { 
        tab.addEventListener('click', () => { 
            tabs.forEach(t => t.classList.remove('active')); 
            tab.classList.add('active'); 
            const category = tab.textContent === '고기' ? 'meat' : tab.textContent === '야채' ? 'vegetable' : 'cheese'; 
            renderToppings(category); 
            activeToppingId = null; 
        }); 
    });
    
    sizeBtns.forEach(btn => { 
        btn.addEventListener('click', () => { 
            const oldSize = currentState.size;
            const newSize = btn.dataset.size;
            
            if (oldSize !== newSize) {
                const oldRadius = pizzaSizes[oldSize];
                const newRadius = pizzaSizes[newSize];
                const scaleFactor = newRadius / oldRadius;
                const centerX = canvas.width / 2;
                const centerY = canvas.height / 2;
                
                // 모든 토핑의 위치를 새 크기에 맞게 조정
                placedToppings.forEach(topping => {
                    const relX = topping.x - centerX;
                    const relY = topping.y - centerY;
                    topping.x = centerX + (relX * scaleFactor);
                    topping.y = centerY + (relY * scaleFactor);
                });
            }
            
            sizeBtns.forEach(b => b.classList.remove('active')); 
            btn.classList.add('active'); 
            currentState.size = newSize; 
            drawPizza(); 
            updateSummary(); 
        }); 
    });
    
    resetButton.addEventListener('click', reset);

    addToCartButton.addEventListener('click', () => {
        const cart = JSON.parse(localStorage.getItem('pizzaCart')) || [];
        const newPizza = { 
            pizzaId: Date.now(), 
            imageDataUrl: canvas.toDataURL('image/png'), 
            summary: { 
                base: summaryBaseList.innerHTML, 
                toppings: summaryToppingsList.innerHTML, 
                size: summarySize.textContent, 
                price: totalPriceEl.textContent, 
                priceValue: parseInt(totalPriceEl.textContent.replace(/[^0-9]/g, '')) 
            }, 
            details: { currentState, placedToppings } 
        };
        cart.push(newPizza);
        localStorage.setItem('pizzaCart', JSON.stringify(cart));
        alert('피자를 장바구니에 담았습니다!');
        reset();
        updateCartCount();
    });
    
    // --- 초기화 ---
    reset();
    updateCartCount();
});
