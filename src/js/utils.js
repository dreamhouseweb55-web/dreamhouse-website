// ===== أدوات مساعدة =====
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: ${type === 'success' ? '#4CAF50' : '#3E2723'};
        color: white;
        padding: 12px 25px;
        border-radius: 30px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        z-index: 10000;
        font-weight: bold;
        transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        opacity: 0;
        bottom: -50px;
    `;
    notification.innerText = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.bottom = '30px';
    }, 10);

    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.bottom = '-50px';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
