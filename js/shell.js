// ============================================================
// shell.js —— 外壳交互：侧边抽屉、发帖页、召唤角色发帖
// 不改 app.js：沿用 app.js 依赖的 id（charBtn / userBtn /
// glossaryToggle / postCount / tab-ai / aiTopic / boardSelect）
// ============================================================

// ---------- 侧边抽屉 ----------
function toggleDrawer(force) {
  var d = document.getElementById('drawer');
  if (!d) return;
  var open = typeof force === 'boolean' ? force : !d.classList.contains('open');
  d.classList.toggle('open', open);
  document.body.classList.toggle('no-scroll', open);
  var btn = document.getElementById('drawerBtn');
  if (btn) btn.setAttribute('aria-expanded', open);
  if (open) syncDrawerUser();
}

// 抽屉项：先关抽屉再执行
function drawerGo(fn) {
  toggleDrawer(false);
  if (typeof fn === 'function') setTimeout(fn, 60);
}

// 抽屉顶部用户信息
function syncDrawerUser() {
  if (typeof getUserProfile !== 'function') return;
  var p = getUserProfile();
  var nm = document.getElementById('drawerUserName');
  if (nm) nm.textContent = p.name || '匿名研究员';
  var av = document.getElementById('drawerAvatar');
  if (av) {
    if (p.avatarType === 'image' && p.avatarImage) {
      av.innerHTML = '<img class="avatar-img" src="' + p.avatarImage + '" alt="">';
    } else {
      av.textContent = p.avatar || '?';
    }
  }
  var gl = document.getElementById('glossaryState');
  if (gl && typeof glossaryEnabled !== 'undefined') gl.textContent = glossaryEnabled ? 'ON' : 'OFF';
}

// 术语开关：包一层，顺便刷新抽屉里的 ON/OFF
function drawerToggleGlossary() {
  if (typeof toggleGlossary === 'function') toggleGlossary();
  syncDrawerUser();
}

// ---------- 召唤角色发帖 ----------
function openSummon() {
  document.getElementById('summonOverlay').classList.add('show');
  var t = document.getElementById('aiTopic');
  if (t) setTimeout(function () { t.focus({ preventScroll: true }); }, 50);
}
function closeSummon() {
  document.getElementById('summonOverlay').classList.remove('show');
}
function summonPost() {
  closeSummon();
  if (typeof aiPost === 'function') aiPost();
}

// ---------- 发帖页：编辑工具栏 ----------
function edInsert(before, after, placeholder) {
  var ta = document.getElementById('userContent');
  if (!ta) return;
  var s = ta.selectionStart, e = ta.selectionEnd;
  var sel = ta.value.slice(s, e) || placeholder || '';
  var ins = before + sel + (after || '');
  if (ta.maxLength > 0 && ta.value.length - (e - s) + ins.length > ta.maxLength) return;
  ta.value = ta.value.slice(0, s) + ins + ta.value.slice(e);
  ta.focus();
  ta.selectionStart = s + before.length;
  ta.selectionEnd = s + before.length + sel.length;
  updateCharCount();
}
function edQuote() {
  var ta = document.getElementById('userContent');
  if (!ta) return;
  var s = ta.selectionStart;
  var lineStart = ta.value.lastIndexOf('\n', s - 1) + 1;
  ta.value = ta.value.slice(0, lineStart) + '> ' + ta.value.slice(lineStart);
  ta.focus();
  ta.selectionStart = ta.selectionEnd = s + 2;
  updateCharCount();
}
function updateCharCount() {
  var ta = document.getElementById('userContent');
  var el = document.getElementById('charCount');
  if (!ta || !el) return;
  var max = ta.maxLength > 0 ? ta.maxLength : 500;
  el.textContent = ta.value.length + '/' + max;
  el.classList.toggle('warn', ta.value.length > max * 0.9);
}

// 发帖页署名
function syncComposeAs() {
  var el = document.getElementById('composeAs');
  if (!el || typeof getUserProfile !== 'function') return;
  el.textContent = '@' + (getUserProfile().name || '匿名研究员');
}

// ---------- 初始化 ----------
document.addEventListener('DOMContentLoaded', function () {
  var ta = document.getElementById('userContent');
  if (ta) ta.addEventListener('input', updateCharCount);
  updateCharCount();

  // 打开发帖页时刷新署名；发布后（app.js 会清空内容）刷新字数
  var c = document.getElementById('composer');
  if (c && window.MutationObserver) {
    new MutationObserver(function () {
      var open = c.classList.contains('open');
      document.body.classList.toggle('no-scroll', open);
      if (open) syncComposeAs();
      updateCharCount();
    }).observe(c, { attributes: true, attributeFilter: ['class'] });
  }

  // Esc：依次关闭 发帖页 / 召唤窗 / 抽屉
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (c && c.classList.contains('open') && typeof toggleComposer === 'function') { toggleComposer(false); return; }
    var so = document.getElementById('summonOverlay');
    if (so && so.classList.contains('show')) { closeSummon(); return; }
    toggleDrawer(false);
  });

  syncDrawerUser();
});
