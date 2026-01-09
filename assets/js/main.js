document.addEventListener('DOMContentLoaded', function() {

    // ==========================================
    // A. 全域通用功能 (所有頁面都會用到)
    // ==========================================

    /**
     * 1. 數量增減功能
     * 用途：給商品詳情頁的 (+ / -) 按鈕使用
     * 邏輯：限制數量最小為 1，並更新 input 欄位
     */
    window.updateQty = function(change) {
        let input = document.getElementById('qtyInput');
        if(input){
            let newValue = parseInt(input.value) + change;
            if (newValue >= 1) {
                input.value = newValue;
            }
        }
    };

    /**
     * 2. 錨點平滑捲動功能
     * 用途：點擊「商品介紹」、「規格說明」等連結時，平滑滑動到該區塊
     * 邏輯：攔截點擊事件 -> 抓取目標 ID -> 使用 scrollIntoView 滑動
     */
    document.querySelectorAll('.anchor-link').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href'); 
            const targetElement = document.querySelector(targetId);
            
            if(targetElement){
                targetElement.scrollIntoView({ behavior: 'smooth' });
                // 切換按鈕的 active 樣式 (變色)
                document.querySelectorAll('.anchor-link').forEach(a => a.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });


    // ==========================================
    // B. 商品列表頁專用邏輯 (Product List Page)
    // 判斷方式：檢查頁面上是否有 id="product-list" 的元素
    // ==========================================
    const productGrid = document.getElementById('product-list');
    
    if (productGrid) {
        // --- 設定參數 ---
        const itemsPerPage = 9;  // 每頁顯示幾筆
        let currentPage = 1;     // 目前頁碼
        let currentProducts = []; // 存放目前要顯示的商品陣列

        // --- 獲取 DOM 元素 ---
        const sortSelect = document.getElementById('sort-select');
        const paginationContainer = document.getElementById('pagination');
        const totalCountSpan = document.getElementById('total-count');

        // --- 1. 初始化列表 ---
        // 抓取 HTML 中所有 class 為 'common-product-card' 的商品
        const originalProducts = Array.from(productGrid.getElementsByClassName('common-product-card'));
        currentProducts = [...originalProducts]; // 複製一份，避免直接修改 DOM

        // 更新左上角的「共 X 件商品」
        if(totalCountSpan) {
            totalCountSpan.innerText = `共 ${currentProducts.length} 件商品`;
        }

        // 執行第一次渲染
        renderPage(currentPage);
        renderPagination();

        /**
         * 函式：渲染頁面
         * 用途：根據目前頁碼，切算出要顯示哪幾筆商品，並塞回 HTML
         */
        function renderPage(page) {
            currentPage = page;
            productGrid.innerHTML = ''; // 清空目前列表

            const start = (page - 1) * itemsPerPage;
            const end = start + itemsPerPage;
            const pageItems = currentProducts.slice(start, end);

            pageItems.forEach(item => {
                productGrid.appendChild(item);
            });

            // 自動滾動到頂部
            window.scrollTo({ top: 0, behavior: 'smooth' });
            updatePaginationActive();
        }

        /**
         * 函式：產生分頁按鈕
         * 用途：計算總頁數，動態產生 1, 2, 3... 的按鈕
         */
        function renderPagination() {
            if (!paginationContainer) return;
            paginationContainer.innerHTML = ''; 
            const totalPages = Math.ceil(currentProducts.length / itemsPerPage);

            if (totalPages <= 1) return; // 只有一頁就不顯示分頁

            for (let i = 1; i <= totalPages; i++) {
                const btn = document.createElement('a');
                btn.href = '#';
                btn.classList.add('page-num');
                btn.innerText = i;
                if (i === currentPage) btn.classList.add('active');

                // 點擊頁碼時重新渲染
                btn.addEventListener('click', function(e) {
                    e.preventDefault(); 
                    renderPage(i); 
                });
                paginationContainer.appendChild(btn);
            }
        }

        /**
         * 函式：更新頁碼樣式
         * 用途：讓當前頁碼變色
         */
        function updatePaginationActive() {
            if (!paginationContainer) return;
            const btns = paginationContainer.getElementsByClassName('page-num');
            Array.from(btns).forEach(btn => {
                btn.classList.remove('active');
                if (parseInt(btn.innerText) === currentPage) {
                    btn.classList.add('active');
                }
            });
        }

        // --- 5. 排序功能 (價格高低) ---
        if (sortSelect) {
            sortSelect.addEventListener('change', function() {
                const sortType = this.value;
                
                // 根據 data-price 屬性進行排序
                currentProducts.sort((a, b) => {
                    const priceA = parseInt(a.getAttribute('data-price'));
                    const priceB = parseInt(b.getAttribute('data-price'));
                    
                    if (sortType === 'price-asc') {
                        return priceA - priceB; // 低到高
                    } else if (sortType === 'price-desc') {
                        return priceB - priceA; // 高到低
                    } else {
                        return 0; // 預設
                    }
                });

                // 排序後回到第一頁並重新渲染
                renderPage(1);
                renderPagination(); 
            });
        }
    }


    // ==========================================
    // C. 商品詳細頁專用邏輯 (Product Detail Page)
    // 判斷方式：檢查頁面上是否有 class="btn-add-to-cart" 的按鈕
    // ==========================================
    const addToCartBtn = document.querySelector('.btn-add-to-cart');
    
    if (addToCartBtn) {
        
        // ★★★ 特殊功能 1：頁面載入時，自動讀取並顯示該商品的評論 ★★★
        // 抓取按鈕上的 data-id (例如 'jam_classic_strawberry_01')
        loadProductReviews(addToCartBtn.getAttribute('data-id'));

        // ★★★ 特殊功能 2：加入購物車點擊事件 ★★★
        addToCartBtn.addEventListener('click', function() {
            
            // 1. 抓取頁面上的商品資訊 (ID, 名稱, 圖片, 價格)
            const productId = this.getAttribute('data-id') || 'unknown_product';
            const titleEl = document.querySelector('.pd-title');
            let productName = titleEl ? titleEl.innerText : '未命名商品';
            const imgEl = document.getElementById('mainImage');
            const productImgSrc = imgEl ? imgEl.getAttribute('src') : '';
            const priceEl = document.querySelector('.pd-price');
            const priceText = priceEl ? priceEl.innerText : '0';
            const price = parseInt(priceText.replace(/[^0-9]/g, '')); // 去除 NT$ 只留數字
            
            // 2. 抓取數量
            const qtyInput = document.getElementById('qtyInput');
            const count = qtyInput ? parseInt(qtyInput.value) : 1;

            // 3. 判斷是否有口味選擇 (針對送禮組合頁面)
            const flavor1El = document.getElementById('flavor1');
            const flavor2El = document.getElementById('flavor2');
            
            let uniqueId = productId;
            let finalName = productName;
            let details = {}; 
            let unitName = "罐"; 

            // 如果有口味選單，就要把口味加進名稱與 ID，確保購物車能區分不同組合
            if (flavor1El && flavor2El) {
                const flavor1 = flavor1El.value;
                const flavor2 = flavor2El.value;
                finalName = `${productName} (${flavor1} + ${flavor2})`;
                uniqueId = `${productId}_${flavor1}_${flavor2}`;
                details = { flavor1, flavor2 };
                unitName = "組";
            }

            // 4. 建立商品物件
            const product = {
                id: uniqueId,
                originalId: productId,
                name: finalName,
                image: productImgSrc,
                price: price,
                count: count,
                details: details
            };

            // 5. 存入 LocalStorage (模擬後端購物車)
            let cart = JSON.parse(localStorage.getItem('jamure_cart')) || [];
            
            // 檢查是否已存在購物車，有則加數量，無則新增
            const existingItem = cart.find(item => item.id === uniqueId);
            if (existingItem) {
                existingItem.count += count; 
            } else {
                cart.push(product); 
            }

            localStorage.setItem('jamure_cart', JSON.stringify(cart));
            
            // 6. 成功提示
            alert(`已將 ${count} ${unitName}「${finalName}」加入購物車！`);
        });

        // ★★★ 特殊功能 3：讀取評論函式 (核心邏輯) ★★★
        function loadProductReviews(currentProductId) {
            // 找到評論顯示的容器
            const reviewListContainer = document.querySelector('.review-list');
            if (!currentProductId || !reviewListContainer) return;

            // 1. 從 LocalStorage 撈出所有評論資料
            const allReviews = JSON.parse(localStorage.getItem('jamure_reviews')) || [];
            
            // 2. 篩選出「屬於這個商品 ID」的評論
            const productReviews = allReviews.filter(review => review.productId === currentProductId);

            // 3. 如果有找到新評論，動態產生 HTML 並插入頁面
            if (productReviews.length > 0) {
                
                // 反轉陣列，讓最新的留言顯示在最上面
                productReviews.reverse().forEach(review => {
                    
                    // 根據評分產生星星 HTML
                    let starsHtml = '';
                    for(let i=0; i<5; i++) {
                        if(i < review.rating) {
                            starsHtml += '<i class="fas fa-star"></i>'; // 實心星
                        } else {
                            starsHtml += '<i class="far fa-star"></i>'; // 空心星
                        }
                    }

                    // 建立單則評論的 HTML 結構 (背景色微調以區分新留言)
                    const reviewHtml = `
                        <div class="review-item" style="background-color: #fff9f0; border-left: 3px solid #BDA068;">
                            <div class="avatar">${review.username.charAt(0)}</div>
                            <div class="review-right-content">
                                <div class="user-meta">
                                    <span class="username">${review.username}</span>
                                    <span class="date">${review.date}</span>
                                </div>
                                <div class="review-rating-row">
                                    <div class="stars gold">${starsHtml}</div>
                                </div>
                                <div class="review-content">
                                    <p>${review.content}</p>
                                </div>
                            </div>
                        </div>
                    `;
                    
                    // 將新 HTML 插入到列表的最前面
                    reviewListContainer.insertAdjacentHTML('afterbegin', reviewHtml);
                });

                // 4. 更新標題上的評論總數量 (例如: 評價 (3) -> 評價 (4))
                const titleEl = document.querySelector('#reviews .section-title');
                if(titleEl) {
                    const currentText = titleEl.innerText;
                    const match = currentText.match(/\d+/); // 抓取原本的數字
                    // 假設原本 HTML 寫死 3 則，再加上新增的數量
                    let baseCount = match ? parseInt(match[0]) : 0;
                    titleEl.innerText = `評價 (${baseCount + productReviews.length})`;
                }
            }
        }
    }

});