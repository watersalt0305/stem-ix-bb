// ============================================
// STEM-IX Banner：CROVET 状态条 / 标题入场 / 板块元素格 / 系统回话 / 彩蛋
// 从 mock/c_banner 移植。依赖 app.js 的 selectBoard / currentBoard，data.js 的 BOARD_META / getUserProfile
// ============================================
(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hoverable = matchMedia('(hover: hover)').matches;
  var $ = function (id) { return document.getElementById(id); };
  var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, reduce ? 0 : ms); }); };

  // ---------- 打字 / 删除 ----------
  // alive：可选，返回 false 时中止（防止两段打字交错）
  async function type(el, text, speed, alive) {
    speed = speed || 28;
    if (reduce) { el.textContent = text; return; }
    el.textContent = '';
    for (var i = 0; i < text.length; i++) {
      if (alive && !alive()) return;
      el.textContent += text[i];
      await sleep(speed + Math.random() * speed * 0.8);   // 不均匀 = 更像在敲
    }
  }
  async function erase(el, speed, alive) {
    while (el.textContent.length) { if (alive && !alive()) return; el.textContent = el.textContent.slice(0, -1); await sleep(speed || 14); }
  }

  // ---------- 1. 状态条逐项上线 ----------
  async function bootStatus() {
    var items = document.querySelectorAll('.sys .item');
    for (var i = 0; i < items.length; i++) { items[i].classList.add('on'); await sleep(140); }
  }

  // ---------- 2. 标题入场：先出现实心 IX，其余字母从 IX 处展开，最后 IX 变空心 ----------
  var TITLE = 'Internal\neXchange', KEY = { 0: true, 10: true };
  function buildTitle() {
    var title = $('ixTitle'); title.innerHTML = '';
    var spans = [];
    TITLE.split('').forEach(function (c, i) {
      if (c === '\n') { title.appendChild(document.createElement('br')); return; }
      var sp = document.createElement('span');
      sp.className = 'ch' + (KEY[i] ? ' k' : '');
      sp.textContent = c;
      sp.setAttribute('aria-hidden', 'true');
      title.appendChild(sp); spans.push(sp);
    });
    return spans;
  }
  async function introTitle() {
    var spans = buildTitle();
    if (reduce) return;
    var keys = spans.filter(function (s) { return s.classList.contains('k'); });
    var rest = spans.filter(function (s) { return !s.classList.contains('k'); });
    var I = keys[0], X = keys[1];

    // 先把 X 挪到 I 右边，组成 “IX”
    rest.forEach(function (s) { s.classList.add('hide3'); s.style.transition = 'none'; });
    X.style.transition = I.style.transition = 'none';
    var ri = I.getBoundingClientRect(), rx = X.getBoundingClientRect();
    X.style.transform = 'translate(' + ((ri.right + 4) - rx.left) + 'px,' + (ri.top - rx.top) + 'px)';
    I.style.opacity = X.style.opacity = '0';
    I.classList.add('solid'); X.classList.add('solid');
    void X.offsetWidth;
    await sleep(200);
    I.style.opacity = X.style.opacity = '1';          // 直接出现，不渐入
    void X.offsetWidth;
    I.style.transition = X.style.transition = '';
    await sleep(700);
    // X 回到原位，其余字母依次滑出
    X.style.transform = '';
    rest.forEach(function (s) { s.style.transition = ''; });
    await sleep(120);
    for (var m = 0; m < rest.length; m++) { rest[m].classList.remove('hide3'); await sleep(28); }
    await sleep(220);
    I.classList.remove('solid'); X.classList.remove('solid');
  }

  // ---------- 3. 时钟 ----------
  function clock() {
    var d = new Date(), p = function (n) { return String(n).padStart(2, '0'); };
    $('ixClock').textContent = p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds());
  }

  // ---------- 4. 状态条播报（打字 → 停留 → 删除） ----------
  var TICKS = [
    'TOWER-A/8F −2.3℃',
    'COFFEE-6F ERR#37',
    'LAB-E/6F 第三个按钮：请勿按压',
    'SYMBIA 周三蘑菇汤 · 已送达食堂',
    'BUNKER 访问请求 · 权限不足',
    '@∀ 双终端在线 · 已归档',
    '<CielSky> 状态：喝咖啡。人生。'
  ];
  async function ticker() {
    var el = $('ixTick'), i = 0;
    while (true) {
      await type(el, TICKS[i % TICKS.length], 38);
      await sleep(3200);
      await erase(el, 16);
      await sleep(400);
      i++;
    }
  }

  // ---------- 5. 系统回话：悬停（触屏为点按）徽章/板块格时，副题行改由 CROVET 说话 ----------
  var KICK = 'STRATEGIC TECHNOLOGY ENHANCEMENT MINISTRY';
  var ELEM = '元素 09 · IX · Internal eXchange · 半衰期：未测定';
  var swapId = 0, current = null, backTimer, booted = false;
  async function say(text, owner) {
    if (!booted || text === current) return;
    current = text; var my = ++swapId;
    $('ixBadge').classList.toggle('on', owner === $('ixBadge'));
    var alive = function () { return my === swapId; };
    var k = $('kick'); await erase(k, 5, alive); if (!alive()) return;
    k.classList.toggle('sysvoice', text !== KICK);
    await type(k, text, text === KICK ? 8 : 14, alive);
  }
  function bindSay(el, getText) {
    el.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') say(getText(), el); });
    el.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') say(KICK, null); });
    el.addEventListener('focus', function () { say(getText(), el); });
    el.addEventListener('blur', function () { say(KICK, null); });
    el.addEventListener('click', function () {
      if (hoverable) return;
      clearTimeout(backTimer); say(getText(), el);
      backTimer = setTimeout(function () { say(KICK, null); }, 3500);
    });
  }
  bindSay($('ixBadge'), function () { return ELEM; });

  // ---------- 6. 板块元素格（由 app.js 的 switchForum 调用） ----------
  function metaFor(board) {
    var m = (typeof BOARD_META !== 'undefined' && BOARD_META[board]) || {};
    // 管理员新增的板块没有预设：拉丁取前两个字母，中文取第一个字
    var sym = m.sym || (/^[A-Za-z]/.test(board) ? board[0].toUpperCase() + (board[1] || '').toLowerCase() : board[0]);
    return { sym: sym, lv: m.lv || '·', say: m.say || '' };
  }
  function makeEl(board, sym, num, nm, sayText) {
    var el = document.createElement('button');
    el.type = 'button';
    el.className = 'el';
    el.dataset.board = board;
    el.innerHTML = '<span class="s"></span><span class="meta"><span class="n"></span><span class="nm"></span></span>';
    el.querySelector('.s').textContent = sym;
    el.querySelector('.n').textContent = num;
    el.querySelector('.nm').textContent = nm;
    el.title = nm;
    bindSay(el, function () { return sayText; });
    el.addEventListener('click', function () {
      // 再点一次已选中的板块 = 回到全部（和原来的板块卡片行为一致）
      selectBoard(board);
    });
    return el;
  }
  window.renderBannerBoards = function (forum) {
    var nav = $('ixBoards'); if (!nav) return;
    nav.innerHTML = '';
    nav.appendChild(makeEl('', 'Σ', '00 · ALL', '全部', '全部板块 · 所有帖子'));
    var info = (forum.intro && forum.intro.boardInfo) || {};
    (forum.boards || []).forEach(function (b, i) {
      var m = metaFor(b), no = String(i + 1).padStart(2, '0');
      var tail = m.say || info[b] || '';
      nav.appendChild(makeEl(b, m.sym, no + ' · ' + m.lv, b,
        '板块 ' + no + ' · ' + m.sym + ' · ' + b + (tail ? ' · ' + tail : '')));
    });
    if (typeof updateBoardHighlight === 'function') updateBoardHighlight();
  };

  // ---------- 7. 彩蛋 ----------
  var noticeTimer;
  function notice(msg) {
    var n = $('ixNotice'); n.textContent = msg; n.classList.add('show');
    clearTimeout(noticeTimer); noticeTimer = setTimeout(function () { n.classList.remove('show'); }, 3600);
  }
  // 连点水印 3 次（水印 pointer-events:none，所以按坐标判断）
  var clicks = 0, clickTimer;
  $('banner').addEventListener('click', function (e) {
    if (e.target.closest('.el, .badge')) return;
    var r = $('ixWm').getBoundingClientRect();
    if (e.clientX < r.left || e.clientY < r.top) return;
    clicks++; clearTimeout(clickTimer); clickTimer = setTimeout(function () { clicks = 0; }, 900);
    if (clicks === 3) { clicks = 0; notice('检测到对机构标识的非常规交互。已记录。'); }
  });
  // 键盘输入 “ix”（在输入框里打字不算）
  var buf = '';
  document.addEventListener('keydown', function (e) {
    var t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) { buf = ''; return; }
    if (!e.key || e.key.length !== 1) return;
    buf = (buf + e.key.toLowerCase()).slice(-2);
    if (buf === 'ix') {
      var name = (typeof getUserProfile === 'function' && getUserProfile().name) || 'U-??????';
      notice('欢迎回来，' + name + '。');
    }
  });

  // ---------- 启动序列 ----------
  (async function () {
    await bootStatus();
    clock(); setInterval(clock, 1000);
    await introTitle();
    $('banner').classList.add('ready');
    await sleep(150);
    await type($('kick'), KICK, 18);
    current = KICK; booted = true;
    setTimeout(function () { $('kcur').style.display = 'none'; }, 2400);
    ticker();
  })();
})();
