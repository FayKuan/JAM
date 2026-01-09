document.addEventListener('DOMContentLoaded', () => {
    
    // 1. 初始化 Tab 切換功能
    const tabs = document.querySelectorAll('.tab');
    const panels = document.querySelectorAll('.content-panel');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetId = tab.getAttribute('data-target');
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            panels.forEach(p => p.classList.remove('active'));
            
            const targetPanel = document.getElementById(targetId);
            if (targetPanel) targetPanel.classList.add('active');
        });
    });

    // 2. 初始化：渲染我的歷史評論
    renderMyReviews();

    // --- 變數：暫存當前要評價的商品資訊 ---
    let currentReviewData = {};

    // --- 全域函式：給 HTML onclick 使用 ---

    // 開啟彈窗 (接收 4 個參數)
    window.openReviewModal = function(id, name, imgSrc, linkUrl) {
        currentReviewData = {
            id: id,
            name: name,
            img: imgSrc,
            link: linkUrl
        };
        document.getElementById('modal-product-id').value = id;
        document.getElementById('modal-product-name').innerText = '評價：' + name;
        document.getElementById('reviewModal').style.display = 'block';
    }

    window.closeReviewModal = function() {
        document.getElementById('reviewModal').style.display = 'none';
        currentReviewData = {}; // 清空暫存
    }

    // 儲存評價
    window.saveReview = function() {
        const rating = document.getElementById('review-rating').value;
        const content = document.getElementById('review-content').value;
        
        if(!content.trim()) { alert('請輸入留言內容'); return; }

        // 1. 建立完整評論物件
        const newReview = {
            productId: currentReviewData.id,
            productName: currentReviewData.name,   
            productImg: currentReviewData.img,     
            productLink: currentReviewData.link,   
            username: '王曉明', // 模擬會員
            date: new Date().toLocaleDateString(),
            rating: parseInt(rating),
            content: content
        };

        // 2. 存入 LocalStorage
        let allReviews = JSON.parse(localStorage.getItem('jamure_reviews')) || [];
        allReviews.push(newReview);
        localStorage.setItem('jamure_reviews', JSON.stringify(allReviews));

        alert('感謝您的評價！評價已送出。');
        
        closeReviewModal();
        document.getElementById('reviewForm').reset();

        // 3. 立即更新畫面上的歷史評論
        renderMyReviews();
    }

    // 點擊視窗外部關閉 Modal
    window.onclick = function(event) {
        const modal = document.getElementById('reviewModal');
        if (event.target == modal) modal.style.display = "none";
    }

    // --- 核心功能：渲染歷史評論紀錄 ---
    function renderMyReviews() {
        // 使用 id 抓取更精準
        const reviewListContainer = document.getElementById('my-review-list') || document.querySelector('.review-list');
        if (!reviewListContainer) return;

        const allReviews = JSON.parse(localStorage.getItem('jamure_reviews')) || [];
        // 篩選出目前使用者的評論
        const myReviews = allReviews.filter(r => r.username === '王曉明');

        // ★ 關鍵：先移除舊的「動態產生」的評論，避免重複顯示
        const oldDynamicItems = reviewListContainer.querySelectorAll('.dynamic-review');
        oldDynamicItems.forEach(item => item.remove());

        // 遍歷並產生 HTML (反轉陣列，讓最新的在最上面)
        [...myReviews].reverse().forEach(review => {
            let starsHtml = '';
            for(let i=0; i<5; i++) {
                starsHtml += (i < review.rating) ? '★' : '☆';
            }

            // 確保圖片和名稱不是 undefined
            const safeImg = review.productImg || '../../assets/picture/logo/logo.png';
            const safeName = review.productName || '未知商品';
            const safeLink = review.productLink || '#';

            const reviewHtml = `
                <a href="${safeLink}" style="text-decoration: none;" class="dynamic-review">
                    <div class="review-item" style="background-color: #fffbf2; border-left: 4px solid #BDA068;">
                        <img src="${safeImg}" alt="${safeName}">
                        <div class="review-content">
                            <p class="product-name">${safeName} <span style="font-size:12px; color:#999;">(新)</span></p>
                            <p class="stars" style="color:#BDA068;">${starsHtml} (${review.rating}.0)</p>
                            <p class="comment-text" style="color:#555;">${review.content}</p>
                            <p style="font-size:12px; color:#aaa; margin-top:4px;">${review.date}</p>
                        </div>
                    </div>
                </a>
            `;
            // 插入到容器最上方
            reviewListContainer.insertAdjacentHTML('afterbegin', reviewHtml);
        });
    }
});