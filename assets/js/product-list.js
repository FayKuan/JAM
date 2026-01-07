document.addEventListener('DOMContentLoaded', function() {
    
    // === 設定參數 ===
    // 你可以統一設定每頁顯示幾筆，這裡設為 9
    const itemsPerPage = 9; 
    let currentPage = 1;    
    let currentProducts = []; 

    // === 獲取 DOM 元素 ===
    const sortSelect = document.getElementById('sort-select');
    const productGrid = document.getElementById('product-list');
    const paginationContainer = document.getElementById('pagination');
    const totalCountSpan = document.getElementById('total-count');

    // === 1. 初始化 ===
    if (productGrid) {
        // ★★★ 關鍵修改：統一抓取 'common-product-card' ★★★
        // 這是你之前改 CSS 時統一使用的 Class 名稱
        const originalProducts = Array.from(productGrid.getElementsByClassName('common-product-card'));
        
        currentProducts = [...originalProducts];

        // 更新右上角的總數量文字
        if(totalCountSpan) {
            totalCountSpan.innerText = `共 ${currentProducts.length} 件商品`;
        }

        // 執行第一次渲染
        renderPage(currentPage);
        renderPagination();
    }

    // === 2. 渲染商品列表 ===
    function renderPage(page) {
        currentPage = page;
        
        // 清空列表
        productGrid.innerHTML = ''; 

        // 計算範圍
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const pageItems = currentProducts.slice(start, end);

        // 顯示商品
        pageItems.forEach(item => {
            productGrid.appendChild(item);
        });

        // 自動滾動到頂部 (平滑滾動)
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // 更新分頁按鈕
        updatePaginationActive();
    }

    // === 3. 渲染分頁按鈕 ===
    function renderPagination() {
        if (!paginationContainer) return;

        paginationContainer.innerHTML = ''; 
        const totalPages = Math.ceil(currentProducts.length / itemsPerPage);

        // 即使只有1頁或沒有商品，也要做防呆處理
        if (totalPages <= 1) return;

        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement('a');
            btn.href = '#';
            btn.classList.add('page-num'); // 對應 CSS 的 .page-num
            btn.innerText = i;
            
            if (i === currentPage) btn.classList.add('active');

            btn.addEventListener('click', function(e) {
                e.preventDefault(); 
                renderPage(i); 
            });

            paginationContainer.appendChild(btn);
        }
    }

    // === 4. 更新按鈕樣式 ===
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

    // === 5. 排序功能 ===
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            const sortType = this.value;
            
            currentProducts.sort((a, b) => {
                const priceA = parseInt(a.getAttribute('data-price'));
                const priceB = parseInt(b.getAttribute('data-price'));
                
                if (sortType === 'price-asc') {
                    return priceA - priceB;
                } else if (sortType === 'price-desc') {
                    return priceB - priceA;
                } else {
                    return 0; 
                }
            });

            renderPage(1);
            renderPagination(); 
        });
    }
});