document.addEventListener('DOMContentLoaded', function() {

   

    // === 設定參數 ===

    // 設定每頁顯示幾筆商品 (可依需求調整，例如 9 或 12)

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

        // 這是搭配 product-list.css 中統一的 Class 名稱

        const originalProducts = Array.from(productGrid.getElementsByClassName('common-product-card'));

       

        // 複製一份原始陣列，避免直接修改 DOM 造成資料遺失

        currentProducts = [...originalProducts];



        // 更新右上角的總數量文字

        if(totalCountSpan) {

            totalCountSpan.innerText = `共 ${currentProducts.length} 件商品`;

        }



        // 執行第一次渲染 (預設顯示第一頁)

        renderPage(currentPage);

        renderPagination();

    }



    // === 2. 渲染商品列表 (核心分頁邏輯) ===

    function renderPage(page) {

        currentPage = page;

       

        // 先清空目前的列表內容

        productGrid.innerHTML = '';



        // 計算該頁面要顯示的商品範圍 (索引值)

        const start = (page - 1) * itemsPerPage;

        const end = start + itemsPerPage;

       

        // 從目前的商品陣列中切割出該頁要顯示的項目

        const pageItems = currentProducts.slice(start, end);



        // 將選中的商品加回 DOM 顯示

        pageItems.forEach(item => {

            productGrid.appendChild(item);

        });



        // 自動滾動到頂部 (平滑滾動)

        // 若不希望自動滾動，可註解掉下面這行

        window.scrollTo({ top: 0, behavior: 'smooth' });



        // 更新分頁按鈕的 Active 狀態

        updatePaginationActive();

    }



    // === 3. 渲染分頁按鈕 ===

    function renderPagination() {

        // 若頁面上沒有分頁容器，則不執行

        if (!paginationContainer) return;



        paginationContainer.innerHTML = '';

       

        // 計算總頁數 (無條件進位)

        const totalPages = Math.ceil(currentProducts.length / itemsPerPage);



        // 如果只有 1 頁或沒有商品，就不顯示分頁按鈕 (可依需求改為強制顯示)

        if (totalPages <= 1) return;



        // 迴圈產生頁碼按鈕

        for (let i = 1; i <= totalPages; i++) {

            const btn = document.createElement('a');

            btn.href = '#';

            btn.classList.add('page-num'); // 對應 CSS 的 .page-num 樣式

            btn.innerText = i;

           

            // 如果是當前頁，加上 active class

            if (i === currentPage) btn.classList.add('active');



            // 綁定點擊事件

            btn.addEventListener('click', function(e) {

                e.preventDefault(); // 防止頁面跳轉 (錨點失效)

                renderPage(i);      // 重新渲染該頁面

            });



            paginationContainer.appendChild(btn);

        }

    }



    // === 4. 更新按鈕 Active 樣式 ===

    function updatePaginationActive() {

        if (!paginationContainer) return;

       

        const btns = paginationContainer.getElementsByClassName('page-num');

        Array.from(btns).forEach(btn => {

            btn.classList.remove('active');

            // 比對按鈕文字與目前頁數

            if (parseInt(btn.innerText) === currentPage) {

                btn.classList.add('active');

            }

        });

    }



    // === 5. 排序功能 ===

    if (sortSelect) {

        sortSelect.addEventListener('change', function() {

            const sortType = this.value;

           

            // 對 currentProducts 陣列進行排序

            currentProducts.sort((a, b) => {

                // 從 HTML 標籤上的 data-price 屬性獲取價格

                const priceA = parseInt(a.getAttribute('data-price'));

                const priceB = parseInt(b.getAttribute('data-price'));

               

                if (sortType === 'price-asc') {

                    return priceA - priceB; // 價格低到高

                } else if (sortType === 'price-desc') {

                    return priceB - priceA; // 價格高到低

                } else {

                    return 0; // 預設或其他排序 (可擴充 ID 排序還原)

                }

            });



            // 排序後，強制回到第一頁並重新渲染列表與分頁

            renderPage(1);

            renderPagination();

        });

    }

}); 