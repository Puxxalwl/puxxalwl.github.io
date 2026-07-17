function readCount(url, onOk, onErr) {
  try {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.timeout = 8000;
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try { onOk(JSON.parse(xhr.responseText)); }
        catch (e) { onErr(); }
      } else {
        onErr();
      }
    };
    xhr.onerror = onErr;
    xhr.ontimeout = onErr;
    xhr.send();
  } catch (e) {
    onErr();
  }
}

export function initAnalytics() {
  const widget = document.getElementById('viewsWidget');
  const el = document.getElementById('viewCount');
  if (!widget || !el) return;

  const base = widget.dataset.countUrl;
  if (!base) { el.textContent = '—'; return; }

  const url = base + (base.indexOf('?') >= 0 ? '&' : '?') + 'v=' + Date.now();

  readCount(
    url,
    (data) => { el.textContent = (data && data.count != null) ? data.count : '—'; },
    () => { el.textContent = 'err'; }
  );
}
