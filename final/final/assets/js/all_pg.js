document.addEventListener('DOMContentLoaded', function() {

    // ==========================================
    // 1. 數量增減功能 (通用)
    // ==========================================
    // 定義在 window 下，讓 HTML 的 onclick="updateQty()" 可以呼叫到
    window.updateQty = function(change) {
        let input = document.getElementById('qtyInput');
        if(input){
            let newValue = parseInt(input.value) + change;
            // 限制數量最少為 1
            if (newValue >= 1) {
                input.value = newValue;
            }
        }
    };

    // ==========================================
    // 2. 錨點平滑捲動功能 (通用)
    // ==========================================
    // 適用於點擊「商品介紹」、「規格說明」等連結
    document.querySelectorAll('.anchor-link').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault(); // 防止預設跳轉
            const targetId = this.getAttribute('href'); 
            const targetElement = document.querySelector(targetId);
            
            if(targetElement){
                // 平滑捲動到目標位置
                targetElement.scrollIntoView({ behavior: 'smooth' });
                
                // 切換導覽列按鈕的 active 樣式
                document.querySelectorAll('.anchor-link').forEach(a => a.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });

    // ==========================================
    // 3. 加入購物車功能 (智慧合併版)
    // ==========================================
    const addToCartBtn = document.querySelector('.btn-add-to-cart');
    
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', function() {
            
            // --- A. 獲取基礎資訊 (所有商品都有) ---
            const productId = this.getAttribute('data-id') || 'unknown_product';
            
            // 抓標題
            const titleEl = document.querySelector('.pd-title');
            let productName = titleEl ? titleEl.innerText : '未命名商品';
            
            // 抓圖片
            const imgEl = document.getElementById('mainImage');
            const productImgSrc = imgEl ? imgEl.getAttribute('src') : '';
            
            // 抓價格 (自動移除 'NT$' 和非數字符號)
            const priceEl = document.querySelector('.pd-price');
            const priceText = priceEl ? priceEl.innerText : '0';
            const price = parseInt(priceText.replace(/[^0-9]/g, '')); 
            
            // 抓購買數量
            const qtyInput = document.getElementById('qtyInput');
            const count = qtyInput ? parseInt(qtyInput.value) : 1;

            // --- B. 偵測並處理「口味選擇」 (僅組合商品有) ---
            const flavor1El = document.getElementById('flavor1');
            const flavor2El = document.getElementById('flavor2');
            
            // 預設 ID 與名稱 (適用於一般商品)
            let uniqueId = productId;
            let finalName = productName;
            let details = {}; // 用來存額外資訊
            let unitName = "罐"; // 提示訊息的單位

            // 如果頁面上找得到這兩個下拉選單，代表是「送禮組合頁面」
            if (flavor1El && flavor2El) {
                const flavor1 = flavor1El.value;
                const flavor2 = flavor2El.value;

                // 修改商品名稱：加上口味備註
                finalName = `${productName} (${flavor1} + ${flavor2})`;

                // 修改商品 ID：加上口味作為唯一識別
                // 這樣「A+B口味」和「C+D口味」在購物車會被視為不同商品
                uniqueId = `${productId}_${flavor1}_${flavor2}`;
                
                // 儲存詳細資訊
                details = { flavor1, flavor2 };
                unitName = "組"; // 組合商品單位改為「組」
            }

            // --- C. 建立商品物件 ---
            const product = {
                id: uniqueId,           // 最終 ID
                originalId: productId,  // 原始 ID (供後端或分類參考用)
                name: finalName,        // 最終名稱
                image: productImgSrc,
                price: price,
                count: count,
                details: details        // 若是一般商品則為空物件
            };

            // --- D. 存入 LocalStorage ---
            // 1. 讀取目前購物車 (若無則建立空陣列)
            let cart = JSON.parse(localStorage.getItem('jamure_cart')) || [];
            
            // 2. 檢查購物車內是否已有「完全相同 ID」的商品
            const existingItem = cart.find(item => item.id === uniqueId);

            if (existingItem) {
                // 如果已經有了，就增加數量
                existingItem.count += count; 
            } else {
                // 如果沒有，就新增進去
                cart.push(product); 
            }

            // 3. 存回瀏覽器
            localStorage.setItem('jamure_cart', JSON.stringify(cart));
            
            // --- E. 成功提示 ---
            alert(`已將 ${count} ${unitName}「${finalName}」加入購物車！`);
        });
    }
});