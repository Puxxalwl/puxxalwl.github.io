export function initClipboard() {
  const notif = document.getElementById('copy-notif');

  function showNotif(x, y) {
    if (!notif) return;
    notif.style.left = x + 'px';
    notif.style.top = (y - 30) + 'px';
    notif.style.opacity = '1';
    notif.style.transform = 'translateY(-10px)';
    setTimeout(() => {
      notif.style.opacity = '0';
      notif.style.transform = 'translateY(0)';
    }, 1500);
  }

  document.addEventListener('click', (e) => {
    const target = e.target.closest('[data-copy]');
    if (!target) return;
    const value = target.getAttribute('data-copy');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(value).catch(() => {});
    }
    showNotif(e.clientX, e.clientY);
  });
}
