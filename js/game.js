export function initGame() {
  const avatarBtn = document.getElementById('avatarClicker');
  const overlay = document.getElementById('game-overlay');
  const area = document.getElementById('game-area');
  const scoreEl = document.getElementById('game-score');
  if (!avatarBtn || !overlay || !area) return;

  let clicks = 0;
  let decayTimer = 0;

  avatarBtn.addEventListener('click', () => {
    clicks++;
    if (clicks >= 5) { clicks = 0; startGame(); return; }
    clearTimeout(decayTimer);
    decayTimer = setTimeout(() => { clicks = 0; }, 3000);
  });

  function startGame() {
    overlay.style.display = 'flex';
    let score = 0;
    scoreEl.textContent = score;

    const cat = document.createElement('div');
    cat.className = 'game-cat';
    cat.textContent = '🐈';
    cat.addEventListener('click', () => {
      score++;
      scoreEl.textContent = score;
      if (score >= 10) { end(); return; }
      place();
    });
    area.appendChild(cat);
    place();

    function place() {
      cat.style.left = Math.random() * 80 + 10 + '%';
      cat.style.top = Math.random() * 80 + 10 + '%';
    }
    function end() {
      overlay.style.display = 'none';
      area.innerHTML = '';
    }
  }
}
