export function meuDomInspectorPlugin() {
  return {
    name: 'vite-plugin-dom-inspector',

    transformIndexHtml(html, ctx) {
      if (!ctx || !ctx.server) return html;

      const injectedScript = `
<script type="module">
(function() {
  var state = { active: false, currentEl: null, feedbackTimeout: null, rafId: null };
  var inspectIcon = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>';
  var closeIcon = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

  var btn = document.createElement('button');
  btn.type = 'button';
  btn.setAttribute('aria-label', 'Toggle DOM inspector');
  btn.innerHTML = inspectIcon + 'Inspect';
  btn.setAttribute('data-di-btn', '');
  Object.assign(btn.style, {
    position: 'fixed',
    bottom: '16px',
    right: '16px',
    zIndex: '2147483647',
    padding: '10px 18px',
    background: 'rgba(28, 28, 35, 0.75)',
    color: '#fff',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '12px',
    cursor: 'pointer',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontSize: '13px',
    fontWeight: '500',
    letterSpacing: '0.01em',
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.25), 0 0 0 0.5px rgba(255, 255, 255, 0.08) inset',
    lineHeight: '1',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    transition: 'background 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease, transform 0.2s ease',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '7px',
    userSelect: 'none'
  });

  var overlay = document.createElement('div');
  overlay.setAttribute('aria-live', 'polite');
  overlay.setAttribute('data-di-overlay', '');
  overlay.style.cssText = [
    'display:none',
    'position:fixed',
    'z-index:2147483646',
    'pointer-events:none',
    'background:rgba(0,0,0,0.85)',
    'color:#fff',
    'padding:6px 10px',
    'border-radius:4px',
    'font-family:monospace',
    'font-size:12px',
    'line-height:1.4',
    'max-width:400px',
    'white-space:nowrap',
    'overflow:hidden',
    'text-overflow:ellipsis',
    'transition:opacity 0.15s'
  ].join(';');

  function getClasses(el) {
    var cls = el.getAttribute('class');
    if (!cls || typeof cls !== 'string') return '';
    var parts = cls.trim().split(/\\s+/).filter(Boolean);
    return parts.length ? '.' + parts.join('.') : '';
  }

  function setActive(active) {
    state.active = active;
    btn.style.background = active ? 'rgba(220, 53, 69, 0.75)' : 'rgba(28, 28, 35, 0.75)';
    btn.style.borderColor = active ? 'rgba(220, 53, 69, 0.4)' : 'rgba(255, 255, 255, 0.12)';
    btn.style.boxShadow = active ? '0 4px 24px rgba(220, 53, 69, 0.3), 0 0 0 0.5px rgba(255, 255, 255, 0.08) inset' : '0 4px 24px rgba(0, 0, 0, 0.25), 0 0 0 0.5px rgba(255, 255, 255, 0.08) inset';
    btn.innerHTML = active ? closeIcon + 'Close' : inspectIcon + 'Inspect';
    btn.style.transform = 'scale(1)';
    overlay.style.display = active ? 'block' : 'none';
    if (active) {
      document.addEventListener('mousemove', onMove);
      document.addEventListener('click', onClick, true);
      document.addEventListener('keydown', onKeyDown);
    } else {
      cleanup();
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('keydown', onKeyDown);
    }
  }

  function onKeyDown(e) {
    if (e.key === 'Escape') setActive(false);
  }

  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    setActive(!state.active);
  });

  btn.addEventListener('mouseenter', function () {
    btn.style.transform = 'scale(1.04)';
  });
  btn.addEventListener('mouseleave', function () {
    btn.style.transform = 'scale(1)';
  });

  function cleanup() {
    if (state.currentEl) {
      state.currentEl.style.boxShadow = '';
      state.currentEl = null;
    }
    if (state.feedbackTimeout) {
      clearTimeout(state.feedbackTimeout);
      state.feedbackTimeout = null;
    }
    if (state.rafId) {
      cancelAnimationFrame(state.rafId);
      state.rafId = null;
    }
    overlay.textContent = '';
    overlay.style.background = 'rgba(0,0,0,0.85)';
    overlay.style.display = 'none';
    overlay.style.bottom = '';
  }

  function isOwn(el) {
    while (el) {
      if (el === btn || el === overlay) return true;
      if (el.getAttribute('data-di-btn') !== null || el.getAttribute('data-di-overlay') !== null) return true;
      el = el.parentElement;
    }
    return false;
  }

  function onMove(e) {
    if (!state.active || state.feedbackTimeout) return;
    var cx = e.clientX, cy = e.clientY;
    if (state.rafId) cancelAnimationFrame(state.rafId);
    state.rafId = requestAnimationFrame(function () {
      state.rafId = null;
      handleMove(cx, cy);
    });
  }

  function handleMove(cx, cy) {
    var el = document.elementFromPoint(cx, cy);
    if (!el || isOwn(el)) {
      overlay.style.display = 'none';
      if (state.currentEl) {
        state.currentEl.style.boxShadow = '';
        state.currentEl = null;
      }
      return;
    }

    if (el !== state.currentEl) {
      if (state.currentEl) state.currentEl.style.boxShadow = '';
      el.style.boxShadow = '0 0 0 2px #4A90D9, 0 0 16px rgba(74,144,217,0.4)';
      state.currentEl = el;
    }

    var tag = el.tagName.toLowerCase();
    var id = el.id ? '#' + el.id : '';
    var cls = getClasses(el);
    overlay.textContent = tag + id + cls;
    overlay.style.display = 'block';
    overlay.style.background = 'rgba(0,0,0,0.85)';
    void overlay.offsetHeight;
    var left = Math.min(cx + 16, window.innerWidth - overlay.offsetWidth - 8);
    overlay.style.left = Math.max(0, left) + 'px';
    overlay.style.top = cy + 'px';
  }

  function onClick(e) {
    if (!state.active) return;
    var el = document.elementFromPoint(e.clientX, e.clientY);
    if (!el || isOwn(el)) return;

    e.preventDefault();
    e.stopPropagation();

    var tag = el.tagName.toLowerCase();
    var id = el.id ? '#' + el.id : '';
    var cls = '';
    var rawCls = el.getAttribute('class');
    if (rawCls && typeof rawCls === 'string') {
      var parts = rawCls.trim().split(/\\s+/).filter(Boolean);
      var shown = parts.slice(0, 5);
      if (parts.length > 5) shown.push('..');
      if (shown.length) cls = '.' + shown.join('.');
    }
    var origShadow = el.style.boxShadow;
    el.style.boxShadow = '';
    var html = el.outerHTML.replace(/\\s+/g, ' ').replace(/>\\s+</g, '><').trim();
    el.style.boxShadow = origShadow;
    var rect = el.getBoundingClientRect();
    var text = tag + id + cls + '\\n' + html;

    navigator.clipboard.writeText(text).then(function () {
      showFeedback('\\u2713 Copiado!', rect);
    }).catch(function () {
      showFeedback('Erro ao copiar', rect);
    });
  }

  function showFeedback(msg, rect) {
    if (state.feedbackTimeout) clearTimeout(state.feedbackTimeout);
    overlay.textContent = msg;
    overlay.style.background = 'rgba(39, 174, 96, 0.9)';
    overlay.style.display = 'block';
    overlay.style.bottom = '';
    var cx = rect.left + rect.width / 2;
    var top = rect.top - 32;
    if (top < 4) top = rect.bottom + 4;
    void overlay.offsetHeight;
    var left = Math.min(cx - overlay.offsetWidth / 2, window.innerWidth - overlay.offsetWidth - 8);
    overlay.style.left = Math.max(4, left) + 'px';
    overlay.style.top = top + 'px';
    state.feedbackTimeout = setTimeout(function () {
      state.feedbackTimeout = null;
      overlay.style.background = 'rgba(0,0,0,0.85)';
      overlay.textContent = '';
      overlay.style.display = 'none';
      overlay.style.bottom = '';
    }, 1200);
  }

  try {
    document.body.appendChild(btn);
    document.body.appendChild(overlay);
  } catch (e) {}
})();
</script>
`;

      var bodyIndex = html.lastIndexOf('</body>');
      if (bodyIndex === -1) {
        bodyIndex = html.lastIndexOf('</html>');
        if (bodyIndex === -1) return html;
        return html.slice(0, bodyIndex) + injectedScript + '\n' + html.slice(bodyIndex);
      }
      return html.slice(0, bodyIndex) + injectedScript + '\n' + html.slice(bodyIndex);
    }
  };
}

export default meuDomInspectorPlugin;
