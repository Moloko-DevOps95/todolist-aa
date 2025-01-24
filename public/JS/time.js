document.addEventListener("DOMContentLoaded", () => {
    function updateTime() {
        const now = new Date();
        const datetimeElement = document.getElementById("datetime");
        datetimeElement.textContent = now.toLocaleString();
    }

    updateTime();
    setInterval(updateTime, 1000);
});