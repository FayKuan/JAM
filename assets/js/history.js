//history order
document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.tab');
    const panels = document.querySelectorAll('.content-panel');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetId = tab.getAttribute('data-target');

            // 1. 切換標籤 active 狀態
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // 2. 切換內容面板 active 狀態
            panels.forEach(p => p.classList.remove('active'));

            // 重要：先確認元素存在，再執行動作
            const targetPanel = document.getElementById(targetId);
            if (targetPanel) {
                targetPanel.classList.add('active');
            } else {
                console.warn(`找不到對應的面板 ID: ${targetId}`);
            }
        });
    });
});
