
function addToCart(id, name, price, quantity = 1) {
    
    let cart = JSON.parse(localStorage.getItem('jamure_cart')) || [];
    let existingItem = cart.find(item => item.id === id);

    if (existingItem) {
        
        existingItem.count += quantity;
    } else {
        cart.push({
            id: id,
            name: name,
            price: price,
            count: quantity 
        });
    }

    localStorage.setItem('jamure_cart', JSON.stringify(cart));
    alert(name + " 已加入購物車！");
}

let checkoutTotalPrice = 0;
let checkoutDiscount = 0;

window.onload = function() {
    if (document.getElementById('cart-body')) {
        displayCart();
    }
    if (document.getElementById('order-list')) {
        renderOrder();
    }
};


function displayCart() {
   
    let cart = JSON.parse(localStorage.getItem('jamure_cart')) || [];
    let cartBody = document.getElementById('cart-body');
    let totalElement = document.getElementById('total-price');
    let totalPrice = 0;

    if (!cartBody) return;
    cartBody.innerHTML = "";

    if (cart.length === 0) {
        cartBody.innerHTML = "<tr><td colspan='5' class='empty-msg'>購物車目前是空的</td></tr>";
        if(totalElement) totalElement.innerText = "小計: $0";
        return;
    }

    cart.forEach((item, index) => {

        let subtotal = item.price * item.count;
        totalPrice += subtotal;
        let row = `
            <tr>
                <td>${item.name}</td>
                <td>$${item.price}</td>
                <td>
                    <div class="quantity-control">
                        <button type="button" onclick="updateQuantity(${index}, -1)">−</button>
                        <span class="quantity-number">${item.count}</span>
                        <button type="button" onclick="updateQuantity(${index}, 1)">+</button>
                    </div>
                </td>
                <td>$${subtotal}</td>
                <td><button class="delete-btn" onclick="removeItem(${index})">刪除</button></td>
            </tr>`;
        cartBody.innerHTML += row;
    });
    if(totalElement) totalElement.innerText = "小計: $" + totalPrice;
}

function updateQuantity(index, delta) {
    let cart = JSON.parse(localStorage.getItem('jamure_cart'));
    cart[index].count += delta; 
    if (cart[index].count <= 0) cart.splice(index, 1);
    localStorage.setItem('jamure_cart', JSON.stringify(cart));
    displayCart();
}

function removeItem(index) {
    let cart = JSON.parse(localStorage.getItem('jamure_cart'));
    cart.splice(index, 1);
    localStorage.setItem('jamure_cart', JSON.stringify(cart));
    displayCart();
}

function goToCheckout() {
    let cart = JSON.parse(localStorage.getItem('jamure_cart')) || [];
    if (cart.length === 0) {
        alert("購物車是空的！");
        return;
    }
    window.location.href = "checkout.html";
}

function clearCart() {
    if (confirm("確定要清空購物車嗎？")) {
        localStorage.removeItem('jamure_cart');
        displayCart();
    }
}


function renderOrder() {
    let cart = JSON.parse(localStorage.getItem('jamure_cart')) || [];
    let list = document.getElementById('order-list');
    checkoutTotalPrice = 0;
    
    if(!list) return;

    if(cart.length === 0) {
        list.innerHTML = "<p class='empty-msg'>購物車目前是空的</p>";
        return;
    }

    let html = "";
    cart.forEach(item => {
        let subtotal = item.price * item.count;
        html += `
            <div class="summary-item" style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span>${item.name} x ${item.count}</span>
                <span>$${subtotal}</span>
            </div>`;
        checkoutTotalPrice += subtotal;
    });

    list.innerHTML = html;
    updateTotalDisplay();
}


function applyCoupon() {
    let code = document.getElementById('coupon-code').value.trim(); 
    
    if (code === "HBD2026") {
        checkoutDiscount = Math.floor(checkoutTotalPrice * 0.3); 
        alert("🎉 祝您生日快樂！已套用 30% OFF 優惠");
    } else if (code === "SAVE10") {
        checkoutDiscount = 10;
        alert("成功套用優惠券！已折抵 $10");
    } else if (code === "") {
        alert("請輸入優惠碼");
        return;
    } else {
        alert("無效的優惠碼");
        checkoutDiscount = 0;
    }
    
    updateTotalDisplay();
}

function updateTotalDisplay() {
    let final = checkoutTotalPrice - checkoutDiscount;
    if (final < 0) final = 0;
    
    let finalElem = document.getElementById('final-total');
    if(finalElem) {
        if (checkoutDiscount > 0) {
            finalElem.innerHTML = `
                <span style="font-size: 0.8em; color: #999; text-decoration: line-through;">$${checkoutTotalPrice}</span>
                <span style="color: #d9534f; margin-left: 10px;">最終合計: $${final}</span>
            `;
        } else {
            finalElem.innerText = "最終合計: $" + final;
        }
    }
}

function showStep2() {
    const name = document.getElementById('name').value;
    const addr = document.getElementById('address').value;
    const phone = document.getElementById('phone').value;

    if(!name || !addr || !phone) {
        alert("請填寫完整的收件人資訊 ✨");
        return;
    }

    document.getElementById('confirm-text').innerText = `姓名：${name}\n地址：${addr}\n電話：${phone}`;
    document.getElementById('step-1').style.display = 'none';
    document.getElementById('step-2').style.display = 'block';
    window.scrollTo(0, 0);
}

function backToStep1() {
    document.getElementById('step-2').style.display = 'none';
    document.getElementById('step-1').style.display = 'block';
}

function showStep3() {
    document.getElementById('step-2').style.display = 'none';
    document.getElementById('step-3').style.display = 'block';
    window.scrollTo(0, 0);
}

function finishAll() {
    localStorage.removeItem('jamure_cart'); 
    window.location.href = "../index.html"; 
}

function togglePaymentDisplay() {
    document.getElementById('payment-credit').style.display = 'none';
    document.getElementById('payment-linepay').style.display = 'none';
    document.getElementById('payment-cod').style.display = 'none';


    const selectedPay = document.querySelector('input[name="pay"]:checked').value;


    if (selectedPay === 'credit') {
        document.getElementById('payment-credit').style.display = 'block';
    } else if (selectedPay === 'linepay') {
        document.getElementById('payment-linepay').style.display = 'block';
    } else if (selectedPay === 'cod') {
        document.getElementById('payment-cod').style.display = 'block';
    }
}
