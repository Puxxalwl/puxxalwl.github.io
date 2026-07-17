export function initTyping() {
  const el = document.getElementById('typing-text');
  if (!el) return;
  const text = 'Developer';
  let idx = 0;
  function step() {
    if (idx < text.length) {
      el.textContent += text.charAt(idx);
      idx++;
      setTimeout(step, 150);
    }
  }
  setTimeout(step, 1000);
}
