// ============================================
// app.js — 主界面逻辑
// ============================================

var currentPanel = 'none'; // none | settings | characters | forumEdit

// ---------- 随机普通居民账号池 ----------
var RANDOM_RESIDENT_POOL = [
  // 命名风格：英文名/缩写+部门缩写
  { name: 'MK_infra', emoji: '💻', dept: '信息基础设施部·系统维护', attitude: '对Insden：见过一次吓到了；对CielCa：找她修过bug；对Crovet：习以为常' },
  { name: 'Lise.ENG', emoji: '🔧', dept: '设备工程部·LEAF质检员', attitude: '对Insden：敬畏，从没见过本人；对CielCa：依赖；对Crovet：被警告过' },
  { name: 'T7_dat', emoji: '📊', dept: '数据处理室·日志分析', attitude: '对Insden：八卦，对CielCa：感谢，对外来访客：有点奇怪' },
  { name: 'node_404', emoji: '🖥️', dept: '信息基础设施部·AI训练', attitude: '对Insden：好奇；对Crovet：怕它；对R_Observer：有点奇怪' },
  { name: 'leaf_usr_18', emoji: '🍃', dept: '核心研究部·碎片校准', attitude: '对Insden：敬畏；对CielCa：习以为常；对Crovet：习以为常' },
  { name: 'caffeine_needed', emoji: '☕', dept: '园区运维·设施技术员', attitude: '对Insden：从没见过本人；对CielCa：八卦；对Crovet：怕它' },
  { name: '8F_too_cold', emoji: '🥶', dept: '核心研究部·实验助理', attitude: '对Insden：确定是她调的温度但不敢说；对CielCa：依赖；对Crovet：习以为常' },
  { name: 'bell_stung_me', emoji: '🪼', dept: '外勤协调·采样员', attitude: '对BELL：创伤后遗症；对CielCa：感谢；对Insden：从未见过本人' },
  { name: 'shard_resonance', emoji: '🔮', dept: '核心研究部·碎片校准', attitude: '对Insden：好奇，关注她的研究；对Aa：略微紧张；对Crovet：习以为常' },
  { name: 'freq_analyst', emoji: '📡', dept: '数据处理室·日志分析', attitude: '对Insden：敬畏；对CielCa：依赖；对Crovet：习以为常' },
  { name: 'lab6_east', emoji: '🧫', dept: '生命科学部·样本管理', attitude: '对Aa：紧张；对Insden：从未见过本人；对CielCa：依赖' },
  { name: 'chip_tester_9', emoji: '⚡', dept: '设备工程部·芯片测试', attitude: '对Insden：敬畏；对CielCa：找她修过bug；对Crovet：被警告过' },
  { name: 'symbia_watcher', emoji: '🌿', dept: '生命科学部·样本管理', attitude: '对Aa：仰慕；对Insden：好奇她对symbia实验的看法；对Crovet：习以为常' },
  { name: 'old_timer_F6', emoji: '👴', dept: '园区运维·设施技术员', attitude: '对所有人：看淡一切，咖啡机第38次坏了也不惊讶' },
  { name: 'intern_q', emoji: '😅', dept: '核心研究部·实验助理', attitude: '对Insden：非常害怕；对CielCa：唯一的依靠；对Crovet：第一次见到以为是普通人' },
];

// 主要角色（带权重）
var MAIN_CHARS_WEIGHTED = [
  { weight: 0.08, id: 'cielca' },
  { weight: 0.03, id: 'insden' },
  { weight: 0.06, id: 'lun' },
  { weight: 0.06, id: 'pusil' },
  { weight: 0.03, id: 'aa' },
  { weight: 0.05, id: 'crovet' },
  { weight: 0.06, id: 'jian' },
  { weight: 0.08, id: 'avisure' },
];
// 普通居民权重（剩余概率）
var RESIDENT_WEIGHT = 0.55;

// 加权随机选角色（支持板块过滤）
function getRandomChar(forumId, excludeId, targetBoard) {
  var chars = getCharacters().filter(function(c) {
    if (c.id === excludeId) return false;
    if (c.forums && c.forums.length > 0 && c.forums.indexOf(forumId) < 0) return false;
    // 板块过滤：如果角色有boards限定且指定了目标板块，检查是否匹配
    if (targetBoard && c.boards && c.boards.length > 0 && c.boards.indexOf(targetBoard) < 0) return false;
    return true;
  });

  // 计算总权重
  var total = 0;
  var weightedChars = chars.map(function(c) {
    var w = 0.05; // 默认权重
    MAIN_CHARS_WEIGHTED.forEach(function(mw) {
      if (mw.id === c.id) w = mw.weight;
    });
    total += w;
    return { char: c, weight: w };
  });
  // 加入普通居民
  total += RESIDENT_WEIGHT;

  var r = Math.random() * total;
  var acc = 0;
  for (var i = 0; i < weightedChars.length; i++) {
    acc += weightedChars[i].weight;
    if (r <= acc) return weightedChars[i].char;
  }

  // 命中普通居民
  return buildRandomResident();
}

// ---------- 随机普通居民生成 ----------
// 名字元素池（随机组合，不是固定名字）
var NAME_PREFIXES = ['MK','T7','node','leaf','chip','freq','lab','shard','net','sig','pulse','arc','data','sys','bit','hex','core','flux','ion','proto','sync','wave','grid','link','zero','null','void','echo','ping','root'];
var NAME_SUFFIXES = ['_infra','_dat','_eng','_ops','_test','_mon','_usr','_dev','_log','_sys','_sec','_lab','_res','_ext','_io','_run','_proc','_calc','_mod','_gen'];
var NAME_STYLES = ['prefix_suffix', 'prefix_number', 'word_dot_word', 'adjective_noun'];
var EMOJI_POOL = ['💻','🔧','📊','🖥️','🍃','☕','🥶','🪼','🔮','📡','🧫','⚡','🌿','😅','🔬','🧪','📋','🛠️','💡','🔌','📎','🗂️','🧲','🌡️','🎛️','⌨️','🔩','📐','🧮','🔋'];
var DEPT_POOL = [
  '信息基础设施部·系统维护','信息基础设施部·AI训练','信息基础设施部·网络运维',
  '设备工程部·LEAF质检员','设备工程部·芯片测试','设备工程部·设备校准',
  '数据处理室·日志分析','数据处理室·信号处理','数据处理室·统计建模',
  '核心研究部·碎片校准','核心研究部·实验助理','核心研究部·数据采集',
  '生命科学部·样本管理','生命科学部·培养监测','生命科学部·基因分析',
  '园区运维·设施技术员','园区运维·能源管理','园区运维·环境监控',
  '外勤协调·采样员','外勤协调·物流调度','安全监察·巡检员'
];
var ATTITUDE_TEMPLATES = [
  '日常吐槽型，偶尔抱怨加班和设施问题，咖啡机又坏了之类的',
  '安静搬砖型，只关心自己的数据和实验进度',
  '八卦型，喜欢在杂谈区闲逛，关注同事动态',
  '新人型，对很多流程和规矩不太熟悉，偶尔问蠢问题',
  '老员工型，什么都见过什么都不稀奇，淡定到冷漠',
  '技术宅型，关注EX-MOD和LEAF芯片改装，会讨论技术细节',
  '摸鱼型，上班时间刷论坛，偶尔被安全系统警告',
  '谨慎型，说话带保留，不敢得罪人，转发前先确认三遍',
  '热心型，喜欢帮新人解答问题但有时候帮倒忙',
];

function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function generateResidentName() {
  var style = pickRandom(NAME_STYLES);
  var prefix = pickRandom(NAME_PREFIXES);
  var suffix = pickRandom(NAME_SUFFIXES);
  var num = Math.floor(Math.random() * 999) + 1;
  switch(style) {
    case 'prefix_suffix': return prefix + suffix;
    case 'prefix_number': return prefix + '_' + num;
    case 'word_dot_word': return prefix + '.' + pickRandom(['ENG','OPS','DAT','SYS','LAB','MON','DEV','SEC','NET','IO']);
    case 'adjective_noun': return pickRandom(['old','new','tired','lost','busy','cold','late','half','temp','test','anon','alt']) + '_' + prefix;
    default: return prefix + '_' + num;
  }
}

function generateResidentAttitude() {
  return pickRandom(ATTITUDE_TEMPLATES);
}

var RANDOM_AVATAR_COUNT = 18; // img/random/1.png ~ 18.png

function getRandomAvatar_resident() {
  var n = Math.floor(Math.random() * RANDOM_AVATAR_COUNT) + 1;
  return 'img/random/' + n + '.png';
}

function buildRandomResident() {
  var name = generateResidentName();
  var avatarImg = getRandomAvatar_resident();
  var dept = pickRandom(DEPT_POOL);
  var attitude = generateResidentAttitude();
  return {
    id: 'resident_' + Date.now() + '_' + Math.random().toString(36).slice(2, 5),
    name: name,
    emoji: '👤',
    avatarImage: avatarImg,
    style: '普通的STEM员工。岗位：' + dept + '。性格：' + attitude + '。说话接地气，像真实论坛用户。回帖简短1-2句。不了解核心研究机密。不要长篇大论。不要每次都提到主要人物的名字。',
    forums: [],
    boards: [],
    api: null,
    isResident: true,
  };
}

// ---------- 初始化 ----------
function init() {
  initUserBtn();
  // 如果当前论坛是隐藏的，切回默认
  var activeId = getActiveForum();
  if ((activeId === 'src' || activeId === 'plant') && !isAdminUnlocked()) {
    setActiveForum('stem-ix');
  }
  renderForumTabs();
  switchForum(getActiveForum());
  // 如果管理员已解锁，显示角色按钮
  if (isAdminUnlocked()) {
    var charBtn = document.getElementById('charBtn');
    if (charBtn) charBtn.style.display = '';
  }
}

// ---------- 论坛切换 ----------
function renderForumTabs() {
  var forums = getForums();
  var active = getActiveForum();
  var isAdmin = _adminUnlocked === true;
  var el = document.getElementById('forumTabs');
  el.innerHTML = '';
  for (var i = 0; i < forums.length; i++) {
    var f = forums[i];
    if (f.id === 'src' && !isAdmin) continue;
    if (f.id === 'plant' && !isAdmin) continue;
    var btn = document.createElement('button');
    btn.className = 'forum-tab' + (f.id === active ? ' active' : '');
    btn.textContent = f.name;
    btn.setAttribute('data-fid', f.id);
    btn.onclick = (function(fid) { return function() { switchForum(fid); }; })(f.id);
    el.appendChild(btn);
  }
}

function switchForum(id) {
  setActiveForum(id);
  var forum = getForums().find(function(f) { return f.id === id; });
  if (!forum) return;

  // 重置板块过滤
  currentBoard = '';

  // 更新标题
  document.getElementById('forumTitle').textContent = forum.name;

  // 更新logo
  var logoEl = document.getElementById('forumLogo');
  if (forum.logo) {
    logoEl.src = forum.logo;
    logoEl.style.display = 'block';
  } else {
    logoEl.style.display = 'none';
  }

  // 更新板块选择器
  renderBoardSelect(forum);

  // 更新论坛首页信息
  renderForumInfo(forum);

  // 更新帖子
  renderPosts();

  // 更新tab样式
  renderForumTabs();

  // 切换主题
  document.body.setAttribute('data-theme', forum.theme || 'terminal');

  // 展示进场弹窗
  showWelcomePopup(forum);
}

function renderBoardSelect(forum) {
  var sel = document.getElementById('boardSelect');
  sel.innerHTML = '<option value="">全部板块</option>';
  if (forum.boards) {
    forum.boards.forEach(function(b) {
      var opt = document.createElement('option');
      opt.value = b;
      opt.textContent = b;
      sel.appendChild(opt);
    });
  }
}

function renderForumInfo(forum) {
  var el = document.getElementById('forumInfo');
  if (!forum.intro) {
    el.innerHTML = '';
    return;
  }
  var info = forum.intro;

  // 公告
  var announcementHtml = '';
  if (forum.announcement) {
    announcementHtml = '<div class="info-block announcement-block">'
      + '<div class="info-label">📢 公告</div>'
      + '<div class="info-text">' + escapeHtml(forum.announcement) + '</div>'
      + '</div>';
  }

  // 欢迎 & 说明
  var welcomeHtml = '<div class="info-block">'
    + '<div class="info-title">' + escapeHtml(info.welcome || forum.name) + '</div>'
    + '<div class="info-text">' + escapeHtml(info.desc || forum.description) + '</div>'
    + '</div>';

  // 板块导航卡片
  var boardsHtml = '';
  if (forum.boards && forum.boards.length > 0) {
    var cards = forum.boards.map(function(b) {
      var desc = (info.boardInfo && info.boardInfo[b]) || '';
      return '<div class="board-card" onclick="selectBoard(\'' + escapeAttr(b) + '\')">'
        + '<div class="board-card-name">' + escapeHtml(b) + '</div>'
        + '<div class="board-card-desc">' + escapeHtml(desc) + '</div>'
        + '</div>';
    }).join('');
    boardsHtml = '<div class="info-block">'
      + '<div class="info-label">板块</div>'
      + '<div class="board-grid">' + cards + '</div>'
      + '</div>';
  }

  // 彩蛋
  var easterHtml = '';
  if (info.easter) {
    easterHtml = '<div class="info-easter">' + escapeHtml(info.easter) + '</div>';
  }

  el.innerHTML = announcementHtml + welcomeHtml + boardsHtml + easterHtml;
}

// 当前选中板块
var currentBoard = '';

function selectBoard(board) {
  if (currentBoard === board) {
    currentBoard = ''; // 再次点击取消过滤
  } else {
    currentBoard = board;
  }
  // 同步下拉选择器
  document.getElementById('boardSelect').value = currentBoard;
  // 更新板块卡片高亮
  updateBoardHighlight();
  // 过滤帖子
  renderPosts();
}

function updateBoardHighlight() {
  var cards = document.querySelectorAll('.board-card');
  cards.forEach(function(card) {
    var name = card.querySelector('.board-card-name').textContent;
    card.classList.toggle('active', name === currentBoard);
  });
}

function escapeAttr(str) {
  return (str || '').replace(/'/g, "\\'").replace(/"/g, '"');
}

// ---------- 发帖 ----------
function userPost() {
  var title = document.getElementById('userTitle').value.trim();
  var content = document.getElementById('userContent').value.trim();
  if (!title && !content) { toast('请填写内容'); return; }

  var forumId = getActiveForum();
  var board = document.getElementById('boardSelect').value;
  var profile = getUserProfile();

  addPost(forumId, {
    id: Date.now().toString(),
    type: 'user',
    author: profile.name,
    emoji: profile.avatarType === 'image' ? '👤' : (profile.avatar || '✏️'),
    avatarImage: profile.avatarType === 'image' ? profile.avatarImage : '',
    title: title || '(无标题)',
    content: content,
    board: board || currentBoard,
    time: new Date().toLocaleString('zh-CN'),
    comments: [],
    likes: 0,
  });

  document.getElementById('userTitle').value = '';
  document.getElementById('userContent').value = '';
  renderPosts();
  toast('发帖成功！');

  // 成就检查
  var postCount = incrementStat('posts');
  tryShowAchievement('first_post');
  if (postCount >= 5) tryShowAchievement('post_5');
  var hour = new Date().getHours();
  if (hour >= 0 && hour < 5) tryShowAchievement('night_owl');

  // 检查@提及 → 触发指定角色回帖
  var mentions = extractMentions(content);
  if (mentions.length > 0) {
    incrementStat('mentions');
    tryShowAchievement('first_mention');
    mentions.forEach(function(charObj, idx) {
      setTimeout(function() {
        triggerCharReply(forumId, charObj);
      }, 600 + idx * 400);
    });
  } else {
    // 概率触发AI回帖（60%概率），支持连锁
    var userPostId = getPosts(forumId)[0].id;
    chainReply(forumId, userPostId, null, 0.6, 0);
  }
}

function aiPost() {
  var topic = document.getElementById('aiTopic').value.trim();
  var forumId = getActiveForum();
  var board = document.getElementById('boardSelect').value;
  var forum = getForums().find(function(f) { return f.id === forumId; });

  // 先选角色（传入板块过滤）
  var char = getRandomChar(forumId, null, board || null);

  // 如果没选板块，从角色允许的板块里随机分配
  if (!board && forum && forum.boards && forum.boards.length > 0) {
    var allowedBoards = forum.boards;
    // 如果角色有板块限定，取交集
    if (char.boards && char.boards.length > 0) {
      var charBoards = char.boards;
      allowedBoards = forum.boards.filter(function(b) {
        return charBoards.indexOf(b) >= 0;
      });
      if (allowedBoards.length === 0) allowedBoards = forum.boards; // fallback
    }
    board = allowedBoards[Math.floor(Math.random() * allowedBoards.length)];
  }

  showStatusBar('✨ 有人正在发帖…');

  generatePost(char, forumId, board, topic).then(function(result) {
    addPost(forumId, {
      id: Date.now().toString(),
      type: 'ai',
      author: char.name,
      authorId: char.id,
      emoji: char.emoji,
avatarImage: char.avatarImage || '',
title: result.title,
      content: result.content,
      board: board,
      time: new Date().toLocaleString('zh-CN'),
      comments: [],
      likes: 0,
    });
    document.getElementById('aiTopic').value = '';
    renderPosts();
    hideStatusBar();
    toast('✨ 有新帖子了！');
    showCharCard(char);
    
    // AI发帖后40%概率触发回帖，支持连锁
    var postId = getPosts(forumId)[0].id;
    chainReply(forumId, postId, char.id, 0.4, 0);
  }).catch(function(e) {
    hideStatusBar();
    toast('❌ 发帖失败: ' + (e.message || '未知错误').slice(0, 60), 4000);
  });
}

// ---------- 自动回帖（支持连锁） ----------
function chainReply(forumId, postId, excludeId, probability, depth) {
  if (depth >= 3) return; // 最多连锁3条
  if (Math.random() >= probability) return;
  
  setTimeout(function() {
    var posts = getPosts(forumId);
    var post = posts.find(function(p) { return p.id === postId; });
    if (!post) return;
    
    var char = getRandomChar(forumId, excludeId, post.board);
    showStatusBar('💬 有人正在回复…');
    
    // 获取最后一条评论作为回复对象
    var lastComment = (post.comments || []).length > 0 ? post.comments[post.comments.length - 1] : null;
    var replyToText = lastComment ? lastComment.content : null;
    var replyToName = lastComment ? lastComment.author : '';
    
    generateComment(char, forumId, post.title, post.content, replyToText).then(function(text) {
      var freshPosts = getPosts(forumId);
      var freshPost = freshPosts.find(function(p) { return p.id === postId; });
      if (!freshPost) return;
      freshPost.comments.push({
        id: Date.now().toString(),
        author: char.name,
        authorId: char.id,
        emoji: char.emoji,
        avatarImage: char.avatarImage || '',
        content: text,
        replyTo: replyToName,
        time: new Date().toLocaleString('zh-CN'),
        type: 'ai',
      });
      savePosts(forumId, freshPosts);
      renderPosts();
      hideStatusBar();
      showCharCard(char);
      
      // 连锁：概率递减
      var nextProb = probability * 0.6;
      chainReply(forumId, postId, char.id, nextProb, depth + 1);
    }).catch(function(e) {
      hideStatusBar();
    });
  }, 1500 + Math.random() * 2000); // 1.5~3.5秒延迟
}

function autoReply(forumId) {
  var posts = getPosts(forumId);
  if (posts.length === 0) return;

  var post = posts[0]; // 最新帖子
  var char = getRandomChar(forumId, post.authorId);

  showStatusBar('💬 有人正在回复…');

  generateComment(char, forumId, post.title, post.content, null).then(function(text) {
    post.comments.push({
      id: Date.now().toString(),
      author: char.name,
      authorId: char.id,
      emoji: char.emoji,
      avatarImage: char.avatarImage || '',
      content: text,
      time: new Date().toLocaleString('zh-CN'),
      type: 'ai',
    });
    savePosts(forumId, posts);
    renderPosts();
    hideStatusBar();
    showCharCard(char);
  }).catch(function(e) {
    hideStatusBar();
    toast('❌ 自动回复失败: ' + (e.message || '未知错误').slice(0, 60), 4000);
  });
}

// ---------- 楼中楼回复 ----------
var _replyTarget = {}; // { postId: { name: '...', index: n } }

function setReplyTarget(postId, commentIndex) {
  var forumId = getActiveForum();
  var posts = getPosts(forumId);
  var post = posts.find(function(p) { return p.id === postId; });
  if (!post || !post.comments[commentIndex]) return;
  
  var c = post.comments[commentIndex];
  var isAnon = post.board === '匿名投稿箱';
  var name = isAnon ? '匿名' : c.author;
  _replyTarget[postId] = { name: name, index: commentIndex };
  
  var bar = document.getElementById('reply-target-' + postId);
  if (bar) {
    bar.style.display = 'flex';
    bar.innerHTML = '<span class="reply-target-text">回复 @' + escapeHtml(name) + '</span>'
      + '<button class="btn-reply-cancel" onclick="clearReplyTarget(\'' + postId + '\')">✕</button>';
  }
  var input = document.getElementById('reply-' + postId);
  if (input) input.focus();
}

function clearReplyTarget(postId) {
  delete _replyTarget[postId];
  var bar = document.getElementById('reply-target-' + postId);
  if (bar) { bar.style.display = 'none'; bar.innerHTML = ''; }
}

// ---------- 用户回帖 ----------
function userReply(postId) {
  var input = document.getElementById('reply-' + postId);
  if (!input) return;
  var text = input.value.trim();
  if (!text) return;

  var forumId = getActiveForum();
  var posts = getPosts(forumId);
  var post = posts.find(function(p) { return p.id === postId; });
  if (!post) return;

  var replyTo = _replyTarget[postId] ? _replyTarget[postId].name : '';
  post.comments.push({
    id: Date.now().toString(),
    author: getUserProfile().name,
    emoji: getUserProfile().avatarType === 'image' ? '👤' : (getUserProfile().avatar || '✏️'),
    avatarImage: getUserProfile().avatarType === 'image' ? getUserProfile().avatarImage : '',
    content: text,
    replyTo: replyTo,
    time: new Date().toLocaleString('zh-CN'),
    type: 'user',
  });
  savePosts(forumId, posts);
  input.value = '';
  clearReplyTarget(postId);
  renderPosts();

  // 成就检查
  var replyCount = incrementStat('replies');
  tryShowAchievement('first_reply');
  if (replyCount >= 10) tryShowAchievement('reply_10');

  // 检查@提及 → 触发指定角色回复
  var mentions = extractMentions(text);
  if (mentions.length > 0) {
    incrementStat('mentions');
    tryShowAchievement('first_mention');
    mentions.forEach(function(charObj, idx) {
      setTimeout(function() {
        triggerCharReplyOnPost(forumId, postId, charObj, text);
      }, 400 + idx * 400);
    });
  } else {
    // 概率触发AI回复（50%概率）
    if (Math.random() < 0.5) {
      setTimeout(function() {
        var char = getRandomChar(forumId, post.authorId, post.board);
        showStatusBar('💬 有人正在回复…');
        generateComment(char, forumId, post.title, post.content, text).then(function(reply) {
        var freshPosts = getPosts(forumId);
        var freshPost = freshPosts.find(function(p) { return p.id === postId; });
        if (!freshPost) return;
        freshPost.comments.push({
          id: Date.now().toString(),
          author: char.name,
          authorId: char.id,
          emoji: char.emoji,
          avatarImage: char.avatarImage || '',
          content: reply,
          replyTo: getUserProfile().name,
          time: new Date().toLocaleString('zh-CN'),
          type: 'ai',
        });
        savePosts(forumId, freshPosts);
        renderPosts();
        hideStatusBar();
        showCharCard(char);
        // 连锁回复
        chainReply(forumId, postId, char.id, 0.3, 1);
      }).catch(function(e) {
        hideStatusBar();
        toast('❌ 回复失败: ' + (e.message || '未知错误').slice(0, 60), 4000);
      });
      }, 600);
    }
  }
}

// ---------- 帖子/评论头像渲染辅助 ----------
function renderPostAvatar(emoji, avatarImage, sizeClass) {
  if (avatarImage) {
    var cls = sizeClass || 'avatar-inline';
    return '<img class="' + cls + '" src="' + escapeHtml(avatarImage) + '" alt="">';
  }
  return escapeHtml(emoji || '👤');
}

// ---------- 渲染帖子 ----------
function renderPosts() {
  var forumId = getActiveForum();
  var allPosts = getPosts(forumId);
  // 按板块过滤
  var posts = currentBoard
    ? allPosts.filter(function(p) { return p.board === currentBoard; })
    : allPosts;
  // 置顶帖排到最前面
  posts.sort(function(a, b) { return (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0); });
  var feed = document.getElementById('feed');
  var count = document.getElementById('postCount');
  count.textContent = allPosts.length + ' 帖';

  // 板块过滤标签
  var filterHtml = '';
  if (currentBoard) {
    filterHtml = '<div class="filter-bar">'
      + '<span class="filter-label">📂 ' + escapeHtml(currentBoard) + '</span>'
      + '<button class="btn-filter-clear" onclick="selectBoard(\'\')">✕ 显示全部</button>'
      + '</div>';
  }

  if (posts.length === 0) {
    feed.innerHTML = filterHtml + '<div class="empty-state">'
      + (currentBoard ? '「' + escapeHtml(currentBoard) + '」还没有帖子' : '还没有帖子，发一个吧 ✨')
      + '</div>';
    return;
  }

  feed.innerHTML = filterHtml + posts.map(function(p) {
    var boardTag = p.board ? '<span class="board-tag">' + escapeHtml(p.board) + '</span>' : '';
    var isAnon = p.board === '匿名投稿箱';
    var comments = (p.comments || []).map(function(c, ci) {
      var cAvatar = isAnon ? '🎭' : renderPostAvatar(c.emoji, c.avatarImage, 'avatar-inline');
      var cName = isAnon ? '匿名' : '@' + escapeHtml(c.author);
      var replyTag = '';
      if (c.replyTo) {
        var rtName = isAnon ? '匿名' : escapeHtml(c.replyTo);
        replyTag = '<span class="reply-tag">回复 @' + rtName + '</span> ';
      }
      var replyBtn = '<button class="btn-reply-inline" onclick="setReplyTarget(\'' + p.id + '\',' + ci + ')">回复</button>';
      return '<div class="comment">'
        + '<span class="comment-author">' + cAvatar + ' ' + cName + '</span>'
        + '<span class="comment-time">' + escapeHtml(c.time) + '</span>'
        + replyBtn
        + '<div class="comment-text">' + replyTag + renderMarkdown(c.content || c.text || '') + '</div>'
        + '</div>';
    }).join('');

    var pAvatar = isAnon ? '🎭' : renderPostAvatar(p.emoji, p.avatarImage, 'avatar-inline');
    var pName = isAnon ? '匿名' : '@' + escapeHtml(p.author);
    var pinnedTag = p.pinned ? '<span class="board-tag" style="background:#e74c3c;color:#fff">📌 置顶</span>' : '';
    var viewsTag = p.views ? '<span class="btn-action" style="cursor:default">👁️ ' + p.views + '</span>' : '';
    return '<article class="post-card">'
      + '<div class="post-header">'
      + '<span class="post-author">' + pAvatar + ' ' + pName + '</span>'
      + boardTag + pinnedTag
      + '<span class="post-time">' + escapeHtml(p.time) + '</span>'
      + '</div>'
      + '<h3 class="post-title">' + renderMarkdown(p.title) + '</h3>'
      + '<div class="post-body">' + renderMarkdown(p.content) + '</div>'
      + '<div class="post-actions">'
      + viewsTag
      + '<button class="btn-action" onclick="likePost(\'' + p.id + '\')">👍 ' + (p.likes || 0) + '</button>'
      + '<button class="btn-action" onclick="triggerReply(\'' + p.id + '\')">💬 ' + (p.comments || []).length + '</button>'
      + '<button class="btn-action" onclick="exportPostCard(\'' + p.id + '\')">📸</button>'
      + '<button class="btn-action" onclick="deletePost(\'' + p.id + '\')">🗑️</button>'
      + '</div>'
      + '<div class="comments-section">' + comments + '</div>'
      + '<div class="reply-box">'
      + '<div class="reply-target-bar" id="reply-target-' + p.id + '" style="display:none"></div>'
      + '<input class="reply-input" id="reply-' + p.id + '" placeholder="写回复…" onkeydown="if(event.key===\'Enter\')userReply(\'' + p.id + '\')">'
      + '<button class="btn-reply" onclick="userReply(\'' + p.id + '\')">回复</button>'
      + '</div>'
      + '</article>';
  }).join('');
}

// ---------- 帖子操作 ----------
function likePost(id) {
  var forumId = getActiveForum();
  var posts = getPosts(forumId);
  var post = posts.find(function(p) { return p.id === id; });
  if (post) {
    post.likes = (post.likes || 0) + 1;
    savePosts(forumId, posts);
    renderPosts();
  }
}

function deletePost(id) {
  var forumId = getActiveForum();
  var posts = getPosts(forumId).filter(function(p) { return p.id !== id; });
  savePosts(forumId, posts);
  renderPosts();
}

// ---------- 导出帖子卡片 ----------
var CARD_QUOTES = [
  '// 人生。—— <CielSky>',
  '// 碎片的存在不需要被解释，只需要被应用。',
  '// 我们不理解风从何处来，但我们学会了造帆。—— 碎片科学导论',
  '// 功率上限的存在有其原因。',
  '// 连接是什么？—— M.',
  '// 方向对。数据不够。继续采。',
  '// 前面的句子已经完整了。但作者选择不在这里结束。',
  '// 忙和无聊不冲突。—— <CielSky>',
  '// 人比世界复杂。',
  '// 这些东西比实验数据重要。',
  '// 有时候觉得在这里工作很奇怪。',
  '// 食堂周三的汤不错。这是我周三来上班的原因。',
  '// 她的意思是你们的方案有问题。具体看附件。—— <CielSky>',
  '// 就随便说说。—— pusil',
  '// 纯学术好奇。—— Avisure',
  '// 已记录。已归档。—— CROVET',
];

function exportPostCard(id) {var forumId = getActiveForum();
  var posts = getPosts(forumId);
  var p = posts.find(function(x) { return x.id === id; });
  if (!p) return;

  var isAnon = p.board === '\u533f\u540d\u6295\u7a3f\u7bb1';
  var authorName = isAnon ? '\u533f\u540d' : '@' + p.author;
  var forum = getForums().find(function(f) { return f.id === forumId; });
  var forumName = forum ? forum.name : 'ShardBB';

  var W = 720, padX = 32, padY = 24;
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');

  ctx.font = '700 18px "Courier New", monospace';
  var titleLines = wrapText(ctx, stripHtml(p.title || ''), W - padX * 2);
  ctx.font = '14px "Courier New", monospace';
  var contentLines = wrapText(ctx, stripHtml(p.content || ''), W - padX * 2);
  
  var commentLines = [];
  var maxComments = Math.min((p.comments || []).length, 3);
  (p.comments || []).slice(0, maxComments).forEach(function(c) {
    var cn = isAnon ? '\u533f\u540d' : '@' + c.author;
    var replyPrefix = c.replyTo ? '\u56de\u590d@' + (isAnon ? '\u533f\u540d' : c.replyTo) + ' ' : '';
    ctx.font = '12px "Courier New", monospace';
    var lines = wrapText(ctx, cn + ' ' + replyPrefix + stripHtml(c.content), W - padX * 2 - 12);
    commentLines.push(lines);
  });
  var totalCommentH = 0;
  commentLines.forEach(function(ls) { totalCommentH += ls.length * 16 + 4; });
  if ((p.comments || []).length > maxComments) totalCommentH += 16;

  var quoteText = CARD_QUOTES[Math.floor(Math.random() * CARD_QUOTES.length)];
  ctx.font = 'italic 12px "Courier New", monospace';
  var quoteLines = wrapText(ctx, quoteText, W - padX * 2);

  var H = padY + 16 + 8;
  H += titleLines.length * 20 + 6;
  H += contentLines.length * 17 + 10;
  if (commentLines.length > 0) H += 10+ totalCommentH;
  H += 12+ quoteLines.length * 14+ padY + 8;

  canvas.width = W;
  canvas.height = H;

  ctx.fillStyle = '#f5f5f0';
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = '#222222';
  ctx.lineWidth = 1;
  ctx.strokeRect(6, 6, W - 12, H - 12);

  ctx.fillStyle = '#888888';
  ctx.font = '11px "Courier New", monospace';
  var headerText = forumName + (p.board ? ' / ' + p.board : '') + '' + (p.time || '');
  ctx.fillText(headerText, padX, padY);

  ctx.fillStyle = '#1a4a7a';
  ctx.font = 'bold 12px "Courier New", monospace';
  ctx.fillText(authorName, padX, padY + 14);

  var y = padY + 32;

  ctx.fillStyle = '#1a1a1a';
  ctx.font = '700 18px "Courier New", monospace';
  titleLines.forEach(function(line) {
    ctx.fillText(line, padX, y);
    y += 20;
  });
  y += 4;

  ctx.fillStyle = '#333333';
  ctx.font = '14px "Courier New", monospace';
  contentLines.forEach(function(line) {
    ctx.fillText(line, padX, y);
    y += 17;
  });

  if (commentLines.length > 0) {
    y += 8;
    ctx.strokeStyle = '#dddddd';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(padX, y - 4);
    ctx.lineTo(W - padX, y - 4);
    ctx.stroke();
    
    commentLines.forEach(function(lines) {
      ctx.fillStyle = '#666666';
      ctx.font = '12px "Courier New", monospace';
      lines.forEach(function(line) {
        ctx.fillText(line, padX + 6, y);
        y += 16;
      });
      y += 4;
    });if ((p.comments || []).length > maxComments) {
      ctx.fillStyle = '#999999';
      ctx.font ='italic 11px "Courier New", monospace';
      ctx.fillText('... \u8fd8\u6709 ' + ((p.comments.length - maxComments)) + ' \u6761\u8bc4\u8bba', padX + 6, y);y += 16;
    }
  }

  y += 10;
  ctx.fillStyle = '#999999';
  ctx.font = 'italic 12px "Courier New", monospace';
  quoteLines.forEach(function(line) {
    ctx.fillText(line, padX, y);
    y += 14;
  });

  ctx.fillStyle = '#bbbbbb';
  ctx.font = '10px "Courier New", monospace';
  ctx.textAlign = 'right';
  ctx.fillText('STEM-IX', W - padX, H - 10);
  ctx.textAlign = 'left';

  try {
    showCardPreview(canvas.toDataURL('image/png'));
  } catch(e) {
    toast('\u5bfc\u51fa\u5931\u8d25: ' + e.message, 3000);
  }
}

// 弹出卡片预览（长按保存）
function showCardPreview(dataUrl) {
  var overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.85);z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;';
  overlay.innerHTML = '<p style="color:#fff;font-size:13px;margin-bottom:12px;">长按图片保存 👇</p>'
    + '<img src="' + dataUrl + '" style="max-width:90%;max-height:75vh;border-radius:8px;box-shadow:0 4px 20px rgba(0,0,0,0.5);">'
    + '<button style="margin-top:16px;padding:8px 24px;background:#333;color:#fff;border:none;border-radius:6px;font-size:14px;" onclick="this.parentElement.remove()">关闭</button>';
  document.body.appendChild(overlay);
  toast('📸 长按图片可保存！');
}

// Canvas 文本换行
function wrapText(ctx, text, maxWidth) {
  var words = text.split('');
  var lines = [];
  var line = '';
  for (var i = 0; i < words.length; i++) {
    var test = line + words[i];
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = words[i];
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [''];
}

// 去 HTML 标签和 Markdown 标记
function stripHtml(html) {
  var tmp = html.replace(/<[^>]*>/g, '');
  tmp = tmp.replace(/&amp;/g, '&');
  tmp = tmp.replace(/&lt;/g, '<');
  tmp = tmp.replace(/&gt;/g, '>');
  // 去 Markdown 标记
  tmp = tmp.replace(/\*\*(.+?)\*\*/g, '$1');
  tmp = tmp.replace(/\*(.+?)\*/g, '$1');
  tmp = tmp.replace(/~~(.+?)~~/g, '$1');
  tmp = tmp.replace(/`([^`]+)`/g, '$1');
  // 渲染伪附件/伪链接 [xxx:yyy] -> 📎 xxx: yyy
  tmp = tmp.replace(/\[([^\[\]]+?)[：:]\s*([^\[\]]+?)\]/g, '📎 $1: $2');
  return tmp.trim();
}

function triggerReply(postId) {
  var forumId = getActiveForum();
  var char = getRandomChar(forumId);
  var posts = getPosts(forumId);
  var post = posts.find(function(p) { return p.id === postId; });
  if (!post) return;

  toast('💬 有人正在回复…');
  showStatusBar('💬 有人正在回复…');

  generateComment(char, forumId, post.title, post.content, null).then(function(text) {
    var freshPosts = getPosts(forumId);
    var freshPost = freshPosts.find(function(p) { return p.id === postId; });
    if (!freshPost) return;
    freshPost.comments.push({
      id: Date.now().toString(),
      author: char.name,
      authorId: char.id,
      emoji: char.emoji,
      avatarImage: char.avatarImage || '',
      content: text,
      time: new Date().toLocaleString('zh-CN'),
      type: 'ai',
    });
    savePosts(forumId, freshPosts);
    renderPosts();
    hideStatusBar();
    showCharCard(char);
  }).catch(function(e) {
    hideStatusBar();
    toast('❌ 触发回复失败: ' + (e.message || '未知错误').slice(0, 60), 4000);
  });
}

function clearAll() {
  if (!confirm('清空当前论坛所有帖子？')) return;
  savePosts(getActiveForum(), []);
  renderPosts();
  toast('已清空');
}

// ---------- 设置面板 ----------
function openSettings() {
  var cfg = getGlobalApi();
  document.getElementById('cfgType').value = cfg.type || 'openai';
  document.getElementById('cfgUrl').value = cfg._isDefault ? '' : (cfg.url || '');
  document.getElementById('cfgKey').value = cfg._isDefault ? '' : (cfg.key || '');
  document.getElementById('cfgModelManual').value = cfg._isDefault ? '' : (cfg.model || '');
  document.getElementById('cfgProxy').value = getProxyUrl();
  document.getElementById('settingsOverlay').classList.add('show');
}
function closeSettings() {
  document.getElementById('settingsOverlay').classList.remove('show');
}
function saveSettingsForm() {
  var cfg = {
    type: document.getElementById('cfgType').value,
    url: document.getElementById('cfgUrl').value.trim(),
    key: document.getElementById('cfgKey').value.trim(),
    model: document.getElementById('cfgModelManual').value.trim()
      || document.getElementById('cfgModel').value,
  };
  saveGlobalApi(cfg);
  var proxyUrl = document.getElementById('cfgProxy').value.trim();
  if (proxyUrl) saveProxyUrl(proxyUrl);
  toast('设置已保存');
  closeSettings();
}
function fetchModels() {
  var url = document.getElementById('cfgUrl').value.trim();
  var key = document.getElementById('cfgKey').value.trim();
  var type = document.getElementById('cfgType').value;
  if (!url || !key) { toast('请先填写URL和Key'); return; }

  fetchModelList(url, key, type).then(function(models) {
    var sel = document.getElementById('cfgModel');
    sel.innerHTML = '<option value="">-- 选择模型 --</option>';
    models.forEach(function(m) {
      var opt = document.createElement('option');
      opt.value = m;
      opt.textContent = m;
      sel.appendChild(opt);
    });
    toast('拉取到 ' + models.length + ' 个模型');
  }).catch(function(e) {
    toast('拉取失败: ' + e.message);
  });
}

// ---------- 角色管理面板 ----------
function openCharacters() {
  renderCharList();
  document.getElementById('charsOverlay').classList.add('show');
}
function closeCharacters() {
  document.getElementById('charsOverlay').classList.remove('show');
}
function renderCharList() {
  var chars = getCharacters();
  var el = document.getElementById('charList');
  el.innerHTML = chars.map(function(c) {
    var apiLabel = (c.api && c.api.model) ? '🔗 ' + c.api.model : '🌐 全局';
    var forumLabels = (c.forums || []).join(', ');
    return '<div class="char-item">'
      + '<div class="char-info">'
      + '<span class="char-name">' + escapeHtml(c.emoji) + ' ' + escapeHtml(c.name) + '</span>'
      + '<span class="char-meta">' + escapeHtml(apiLabel) + ' · ' + escapeHtml(forumLabels) + '</span>'
      + '</div>'
      + '<div class="char-actions">'
      + '<button class="btn-sm" onclick="editChar(\'' + c.id + '\')">编辑</button>'
      + '<button class="btn-sm btn-danger" onclick="removeChar(\'' + c.id + '\')">删除</button>'
      + '</div>'
      + '</div>';
  }).join('');
}

function editChar(id) {
  var char = id ? getCharById(id) : { id: 'char_' + Date.now(), name: '', emoji: '👤', style: '', forums: [getActiveForum()], boards: [], api: null };
  if (!char) return;

  var forums = getForums();
  var forumCheckboxes = forums.map(function(f) {
    var checked = char.forums && char.forums.indexOf(f.id) >= 0 ? 'checked' : '';
    return '<label class="checkbox-label"><input type="checkbox" value="' + f.id + '" ' + checked + '> ' + escapeHtml(f.name) + '</label>';
  }).join('');

  // 收集所有可能的板块
  var allBoards = [];
  forums.forEach(function(f) {
    (f.boards || []).forEach(function(b) {
      if (allBoards.indexOf(b) < 0) allBoards.push(b);
    });
  });
  var boardCheckboxes = allBoards.map(function(b) {
    var checked = char.boards && char.boards.indexOf(b) >= 0 ? 'checked' : '';
    return '<label class="checkbox-label"><input type="checkbox" value="' + escapeAttr(b) + '" ' + checked + '> ' + escapeHtml(b) + '</label>';
  }).join('');

  var api = char.api || {};
  document.getElementById('charEditContent').innerHTML =
    '<div class="form-row"><label>名字</label><input class="form-input" id="ceditName" value="' + escapeHtml(char.name || '') + '"></div>'
    + '<div class="form-row"><label>Emoji/昵称显示</label><input class="form-input" id="ceditEmoji" value="' + escapeHtml(char.emoji || '') + '"></div>'
    + '<div class="form-row"><label>头像图片路径（如 img/cielca.png，留空用emoji）</label><input class="form-input" id="ceditAvatarImg" value="' + escapeHtml(char.avatarImage || '') + '"></div>'
    + '<div class="form-row"><label>性格/说话风格</label><textarea class="form-input" id="ceditStyle" rows="3">' + escapeHtml(char.style || '') + '</textarea></div>'
    + '<div class="form-row"><label>角色卡简介（展示用，60字内）</label><input class="form-input" id="ceditBio" value="' + escapeHtml(char.bio || '') + '"></div>'
    + '<div class="form-row"><label>稀有度</label><select class="form-input" id="ceditRarity"><option value="">无（不参与角色卡</option><option value="common"' + ((char.rarity||'')==='common'?' selected':'') + '>★ 普通</option><option value="uncommon"' + ((char.rarity||'')==='uncommon'?' selected':'') + '>★★ 稀有</option><option value="rare"' + ((char.rarity||'')==='rare'?' selected':'') + '>★★★ 珍贵</option><option value="epic"' + ((char.rarity||'')==='epic'?' selected':'') + '>★★★★ 史诗</option><option value="legendary"' + ((char.rarity||'')==='legendary'?' selected':'') + '>★★★★★ 传说</option></select></div>'
    + '<div class="form-row"><label>所属论坛</label><div id="ceditForums" class="checkbox-group">' + forumCheckboxes + '</div></div>'
    + '<div class="form-row"><label>允许发帖板块（不选=全部）</label><div id="ceditBoards" class="checkbox-group">' + boardCheckboxes + '</div></div>'
    + '<hr class="divider">'
    + '<div class="form-row"><label>独立API（不填则用全局）</label></div>'
    + '<div class="form-row"><label>协议</label><select class="form-input" id="ceditApiType"><option value="openai"' + (api.type === 'openai' ? ' selected' : '') + '>OpenAI兼容</option><option value="anthropic"' + (api.type === 'anthropic' ? ' selected' : '') + '>Anthropic</option></select></div>'
    + '<div class="form-row"><label>URL</label><input class="form-input" id="ceditApiUrl" value="' + escapeHtml(api.url || '') + '" placeholder="留空用全局"></div>'
    + '<div class="form-row"><label>Key</label><input class="form-input" id="ceditApiKey" type="password" value="' + escapeHtml(api.key || '') + '"></div>'
    + '<div class="form-row"><label>模型</label><input class="form-input" id="ceditApiModel" value="' + escapeHtml(api.model || '') + '"></div>';

  document.getElementById('charEditOverlay').setAttribute('data-char-id', char.id);
  document.getElementById('charEditOverlay').classList.add('show');
}

function saveCharEdit() {
  var id = document.getElementById('charEditOverlay').getAttribute('data-char-id');
  var forumCheckboxes = document.querySelectorAll('#ceditForums input[type=checkbox]');
  var forums = [];
  forumCheckboxes.forEach(function(cb) { if (cb.checked) forums.push(cb.value); });

  var boardCheckboxes = document.querySelectorAll('#ceditBoards input[type=checkbox]');
  var boards = [];
  boardCheckboxes.forEach(function(cb) { if (cb.checked) boards.push(cb.value); });

  var apiUrl = document.getElementById('ceditApiUrl').value.trim();
  var apiKey = document.getElementById('ceditApiKey').value.trim();
  var apiModel = document.getElementById('ceditApiModel').value.trim();
  var api = (apiUrl && apiKey && apiModel) ? {
    type: document.getElementById('ceditApiType').value,
    url: apiUrl, key: apiKey, model: apiModel,
  } : null;

  saveCharacter({
    id: id,
    name: document.getElementById('ceditName').value.trim() || '未命名',
    emoji: document.getElementById('ceditEmoji').value.trim() || '👤',
    avatarImage: document.getElementById('ceditAvatarImg').value.trim(),
    style: document.getElementById('ceditStyle').value.trim(),
    bio: document.getElementById('ceditBio').value.trim(),
    rarity: document.getElementById('ceditRarity').value || undefined,
    forums: forums,
    boards: boards,
    api: api,
  });

  document.getElementById('charEditOverlay').classList.remove('show');
  renderCharList();
  toast('角色已保存');
}

function removeChar(id) {
  if (!confirm('删除这个角色？')) return;
  deleteCharacter(id);
  renderCharList();
  toast('已删除');
}

// ---------- Tab切换 ----------
function switchTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(function(b) {
    b.classList.toggle('active', b.getAttribute('data-tab') === tab);
  });
  document.querySelectorAll('.tab-content').forEach(function(c) {
    c.classList.toggle('active', c.id === 'tab-' + tab);
  });
}

// ---------- @提及系统 ----------
function extractMentions(text) {
  var matches = text.match(/@([^\s@,，。！!?？]+)/g);
  if (!matches) return [];
  var chars = getCharacters();
  var result = [];
  matches.forEach(function(m) {
    var name = m.slice(1); // 去掉@
    var found = chars.find(function(c) {
      return c.name === name || c.name === '<' + name + '>'
        || c.id === name.toLowerCase()
        || c.name.toLowerCase() === name.toLowerCase();
    });
    if (found && !result.some(function(r) { return r.id === found.id; })) {
      result.push(found);
    }
  });
  return result;
}

// @指定角色回复最新帖子
function triggerCharReply(forumId, charObj) {
  var posts = getPosts(forumId);
  if (posts.length === 0) return;
  var post = posts[0];
  showStatusBar('💬 有人正在回复…');
  generateComment(charObj, forumId, post.title, post.content, null).then(function(text) {
    var freshPosts = getPosts(forumId);
    if (freshPosts.length === 0) return;
    freshPosts[0].comments.push({
      id: Date.now().toString(),
      author: charObj.name,
      authorId: charObj.id,
      emoji: charObj.emoji,
      avatarImage: charObj.avatarImage || '',
      content: text,
      time: new Date().toLocaleString('zh-CN'),
      type: 'ai',
    });
    savePosts(forumId, freshPosts);
    renderPosts();
    hideStatusBar();
    showCharCard(charObj);
  }).catch(function(e) {
    hideStatusBar();
    toast('❌ ' + charObj.name + ' 回复失败: ' + (e.message || '').slice(0, 50), 4000);
  });
}

// @指定角色回复特定帖子
function triggerCharReplyOnPost(forumId, postId, charObj, replyTo) {
  showStatusBar('💬 有人正在回复…');
  var posts = getPosts(forumId);
  var post = posts.find(function(p) { return p.id === postId; });
  if (!post) { hideStatusBar(); return; }
  generateComment(charObj, forumId, post.title, post.content, replyTo).then(function(text) {
    var freshPosts = getPosts(forumId);
    var freshPost = freshPosts.find(function(p) { return p.id === postId; });
    if (!freshPost) return;
    freshPost.comments.push({
      id: Date.now().toString(),
      author: charObj.name,
      authorId: charObj.id,
      emoji: charObj.emoji,
      avatarImage: charObj.avatarImage || '',
      content: text,
      time: new Date().toLocaleString('zh-CN'),
      type: 'ai',
    });
    savePosts(forumId, freshPosts);
    renderPosts();
    hideStatusBar();
    showCharCard(charObj);
  }).catch(function(e) {
    hideStatusBar();
    toast('❌ ' + charObj.name + ' 回复失败: ' + (e.message || '').slice(0, 50), 4000);
  });
}

// ---------- 简易Markdown渲染 ----------
function renderMarkdown(text) {
  if (!text) return '';
  var html = escapeHtml(text);
  html = html.replace(/```([\s\S]*?)```/g, '<pre class="md-code-block">$1</pre>');
  html = html.replace(/`([^`]+)`/g, '<code class="md-code-inline">$1</code>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');
  html = html.replace(/(^|\n)&gt; ?([^\n]*)/g, '$1<blockquote class="md-quote">$2</blockquote>');
  html = html.replace(/(^|\n)\s*[-\u2013\u2014] +([^\n]+)/g, '$1<li class="md-li">$2</li>');
  html = html.replace(/\[([^\]]+?)[\uff1a:]([^\]]+)\]/g, '<span class="md-link">[$1: $2]</span>');
  html = html.replace(/\n/g, '<br>');
  html = html.replace(/@([^\s@,\uff0c\u3002\uff01!?\uff1f<]+)/g, '<span class="mention">@$1</span>');
  // 术语释义高亮
  if (typeof GLOSSARY !== 'undefined' && glossaryEnabled) {
    html = applyGlossary(html);
  }
  return html;
}

// ---------- 术语释义开关 ----------
var glossaryEnabled = true;

function toggleGlossary() {
  glossaryEnabled = !glossaryEnabled;
  var btn = document.getElementById('glossaryToggle');
  if (btn) {
    btn.classList.toggle('active', glossaryEnabled);
    btn.title = glossaryEnabled ? '术语释义：开' : '术语释义：关';
  }
  renderPosts();
}

// ---------- 术语高亮逻辑 ----------
function applyGlossary(html) {
  var terms = Object.keys(GLOSSARY).sort(function(a, b) { return b.length - a.length; });
  var placeholders = [];
  var tagPH = [];
  html = html.replace(/<[^>]+>/g, function(tag) {
    var ti = tagPH.length;
    tagPH.push(tag);
    return "~~TAG" + ti + "~~";
  });
  terms.forEach(function(term) {
    var escaped = term.replace(/([.*+?^${}()|[\]\\])/g, '\\$1');
    var hasCJK = /[一-鿿]/.test(term);
    var regex;
    if (hasCJK) {
      regex = new RegExp(escaped, 'g');
    } else {
      regex = new RegExp('(^|[^A-Za-z0-9-])(' + escaped + ')(?=[^A-Za-z0-9-]|$)', 'g');
    }
    html = html.replace(regex, function() {
      var a = arguments;
      var idx = placeholders.length;
      var tip = escapeHtml(GLOSSARY[term]);
      var span = '<span class="glossary-term" onclick="showGlossaryTip(this)" data-tip="' + tip + '">';
      if (hasCJK) {
        placeholders.push(span + a[0] + '</span>');
      } else {
        placeholders.push(a[1] + span + a[2] + '</span>');
      }
      return '~~GLOSS' + idx + '~~';
    });
  });
  placeholders.forEach(function(ph, i) {
    html = html.replace('~~GLOSS' + i + '~~', ph);
  });
  tagPH.forEach(function(tag, i) {
    html = html.replace('~~TAG' + i + '~~', tag);
  });
  return html;
}

// ---------- 术语气泡提示 ----------
function showGlossaryTip(el) {
  // 移除已存在的气泡
  var old = document.querySelector('.glossary-bubble');
  if (old) old.remove();

  var bubble = document.createElement('div');
  bubble.className = 'glossary-bubble';
  bubble.innerHTML = '<div class="glossary-bubble-term">' + el.textContent + '</div>'
    + '<div class="glossary-bubble-def">' + el.getAttribute('data-tip') + '</div>';
  document.body.appendChild(bubble);

  // 定位
  var rect = el.getBoundingClientRect();
  var bw = 260;
  var left = rect.left + rect.width / 2 - bw / 2;
  if (left < 8) left = 8;
  if (left + bw > window.innerWidth - 8) left = window.innerWidth - 8 - bw;
  bubble.style.left = left + 'px';
  bubble.style.top = (rect.bottom + window.scrollY + 6) + 'px';
  bubble.style.width = bw + 'px';

  setTimeout(function() { bubble.classList.add('show'); }, 10);

  // 点击其他地方关闭
  function closeBubble(e) {
    if (!bubble.contains(e.target) && e.target !== el) {
      bubble.classList.remove('show');
      setTimeout(function() { if (bubble.parentNode) bubble.remove(); }, 200);
      document.removeEventListener('click', closeBubble);
    }
  }
  setTimeout(function() { document.addEventListener('click', closeBubble); }, 50);
}

// ---------- 术语表面板 ----------
function openGlossaryPanel() {
  var overlay = document.getElementById('glossaryOverlay');
  if (overlay) { overlay.style.display = 'flex'; return; }
  overlay = document.createElement('div');
  overlay.id = 'glossaryOverlay';
  overlay.className = 'modal-overlay glossary-overlay';
  var terms = Object.keys(GLOSSARY);
  // 分类
  var categories = {
    '设备': ['LEAF', 'LEAF-P', 'LEAF-C', 'LEAF-S', 'LEAF-Ø', 'LEAF-EX', 'EX接口', 'EX-MOD', 'EX-LEAF', 'MIRA', 'MIRA-D', 'MIRA-C'],
    '碎片': ['碎片', 'Shard', 'Class-I', 'Class-II', 'Class-III', 'Class-IV', 'Ex.系列', '碎片残留', '碎片兼容性'],
    '机构与地点': ['STEM', 'CROWN', 'SEED', 'CROVET', 'AType', 'ATI', 'symbia', 'Folium', 'Altera', 'Tower A', 'Lab-E', 'Lab-W', 'Bunker'],
    '记忆与天灾': ['连接图', '记忆医生', '记忆错连', '天灾', '天灾后遗症', 'IC程序'],
    '其他': ['在存档名', 'M.', '八楼温度', '第三个按钮', 'PR']
  };
  var html = '<div class="glossary-panel">'
    + '<div class="glossary-panel-header">'
    + '<span>📖 STEM-IX 术语速查</span>'
    + '<button class="btn-close" onclick="closeGlossaryPanel()">✕</button>'
    + '</div>'
    + '<div class="glossary-panel-note">C级可见 · 数据管理部维护 · 内容仅供参考</div>'
    + '<div class="glossary-panel-body">';
  Object.keys(categories).forEach(function(cat) {
    html += '<div class="glossary-cat">' + cat + '</div>';
    categories[cat].forEach(function(t) {
      if (GLOSSARY[t]) {
        html += '<div class="glossary-row"><span class="glossary-row-term">' + escapeHtml(t) + '</span><span class="glossary-row-def">' + escapeHtml(GLOSSARY[t]) + '</span></div>';
      }
    });
  });
  html += '</div></div>';
  overlay.innerHTML = html;
  overlay.addEventListener('click', function(e) { if (e.target === overlay) closeGlossaryPanel(); });
  document.body.appendChild(overlay);
  setTimeout(function() { overlay.style.display = 'flex'; }, 10);
}

function closeGlossaryPanel() {
  var overlay = document.getElementById('glossaryOverlay');
  if (overlay) overlay.style.display = 'none';
}

// ---------- 工具函数 ----------
function escapeHtml(str) {
  var div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

function toast(msg, duration) {
  var dur = duration || 2500;
  var container = document.getElementById('toastContainer');
  var el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  container.appendChild(el);
  setTimeout(function() { el.classList.add('show'); }, 10);
  setTimeout(function() {
    el.classList.remove('show');
    setTimeout(function() { container.removeChild(el); }, 300);
  }, dur);
}

function showLoading(text) {
  document.getElementById('loadingSub').textContent = text || '请稍候 ✨';
  document.getElementById('loadingOverlay').classList.add('show');
}
function hideLoading() {
  document.getElementById('loadingOverlay').classList.remove('show');
}

// ---------- 非阻塞状态条 ----------
function showStatusBar(text) {
  var bar = document.getElementById('statusBar');
  if (!bar) return;
  bar.textContent = '⏳ ' + (text || '处理中…');
  bar.classList.add('show');
}
function hideStatusBar() {
  var bar = document.getElementById('statusBar');
  if (!bar) return;
  bar.classList.remove('show');
}

// ---------- 用户头像渲染辅助 ----------
function renderAvatar(profile) {
  if (profile.avatarType === 'image' && profile.avatarImage) {
    return '<img class="avatar-img" src="' + profile.avatarImage + '" alt="">';
  }
  return '<span class="avatar-emoji">' + escapeHtml(profile.avatar || '👤') + '</span>';
}
function renderCharAvatar(char) {
  if (char.avatarImage) {
    return '<img class="avatar-img avatar-sm" src="' + char.avatarImage + '" alt="">';
  }
  return '<span class="avatar-emoji-sm">' + escapeHtml(char.emoji || '👤') + '</span>';
}

// ---------- 用户资料面板 ----------
function initUserBtn() {
  var profile = getUserProfile();
  var btn = document.getElementById('userBtn');
  if (profile.avatarType === 'image' && profile.avatarImage) {
    btn.innerHTML = '<img class="avatar-img avatar-btn" src="' + profile.avatarImage + '" alt="">';
  } else {
    btn.textContent = profile.avatar || '👤';
  }
}

function openProfile() {
  var profile = getUserProfile();
  document.getElementById('profileName').value = profile.name || '';
  document.getElementById('profileEmoji').value = profile.avatar || '';
  document.getElementById('profileRegTime').textContent = profile.registered || '未知';
  updateProfilePreview(profile);
  document.getElementById('profileOverlay').classList.add('show');
}
function closeProfile() {
  document.getElementById('profileOverlay').classList.remove('show');
}
function updateProfilePreview(profile) {
  var el = document.getElementById('profileAvatarPreview');
  if (profile.avatarType === 'image' && profile.avatarImage) {
    el.innerHTML = '<img class="avatar-img avatar-lg" src="' + profile.avatarImage + '" alt="">';
  } else {
    el.innerHTML = '<span class="avatar-emoji-lg">' + escapeHtml(profile.avatar || '👤') + '</span>';
  }
}
function randomizeAvatar() {
  var profile = getUserProfile();
  profile.avatar = getRandomAvatar();
  profile.avatarType = 'emoji';
  profile.avatarImage = '';
  updateProfilePreview(profile);
  document.getElementById('profileEmoji').value = profile.avatar;
  document.getElementById('profileAvatarPreview').setAttribute('data-pending-avatar', profile.avatar);
  document.getElementById('profileAvatarPreview').setAttribute('data-pending-type', 'emoji');
  document.getElementById('profileAvatarPreview').removeAttribute('data-pending-image');
}
var cropSourceImage = null;

function uploadAvatar(event) {
  var file = event.target.files[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) {
    toast('图片太大了，请选择2MB以下的');
    return;
  }
  var reader = new FileReader();
  reader.onload = function(e) {
    var img = new Image();
    img.onload = function() {
      cropSourceImage = img;
      document.getElementById('cropZoom').value = 1;
      document.getElementById('cropX').value = 0;
      document.getElementById('cropY').value = 0;
      drawCrop();
      // 先关闭资料面板，再打开裁剪
      document.getElementById('profileOverlay').classList.remove('show');
      document.getElementById('cropOverlay').classList.add('show');
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
  event.target.value = '';
}

function drawCrop() {
  if (!cropSourceImage) return;
  var canvas = document.getElementById('cropCanvas');
  var ctx = canvas.getContext('2d');
  var size = 256;
  var zoom = parseFloat(document.getElementById('cropZoom').value);
  var offX = parseInt(document.getElementById('cropX').value);
  var offY = parseInt(document.getElementById('cropY').value);

  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = '#eee';
  ctx.fillRect(0, 0, size, size);

  var img = cropSourceImage;
  var scale = Math.max(size / img.width, size / img.height) * zoom;
  var w = img.width * scale;
  var h = img.height * scale;
  var x = (size - w) / 2 + offX;
  var y = (size - h) / 2 + offY;

  ctx.save();
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(img, x, y, w, h);
  ctx.restore();

  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2 - 1, 0, Math.PI * 2);
  ctx.stroke();
}

function applyCrop() {
  var canvas = document.getElementById('cropCanvas');
  var dataUrl = canvas.toDataURL('image/png', 0.9);

  var profile = getUserProfile();
  profile.avatarType = 'image';
  profile.avatarImage = dataUrl;
  saveUserProfile(profile);
  initUserBtn();

  closeCrop();
  // 裁剪完毕后重新打开资料面板并刷新预览
  openProfile();
  toast('头像已更新');
}

function closeCrop() {
  document.getElementById('cropOverlay').classList.remove('show');
}
function saveProfile() {
  var profile = getUserProfile();
  profile.name = document.getElementById('profileName').value.trim() || profile.name;

  var preview = document.getElementById('profileAvatarPreview');
  var pendingType = preview.getAttribute('data-pending-type');
  if (pendingType === 'image') {
    profile.avatarType = 'image';
    profile.avatarImage = preview.getAttribute('data-pending-image') || '';
  } else if (pendingType === 'emoji') {
    profile.avatarType = 'emoji';
    profile.avatar = preview.getAttribute('data-pending-avatar') || profile.avatar;
    profile.avatarImage = '';
  } else {
    var emojiInput = document.getElementById('profileEmoji').value.trim();
    if (emojiInput) {
      profile.avatar = emojiInput;
      profile.avatarType = 'emoji';
      profile.avatarImage = '';
    }
  }

  saveUserProfile(profile);
  initUserBtn();
  closeProfile();
  toast('资料已保存');
}

// ---------- 管理员面板 ----------
function openAdmin() {
  var content = document.getElementById('adminContent');

  if (!isAdminUnlocked()) {
    content.innerHTML = '<div class="form-row">'
      + '<label>输入管理员密码</label>'
      + '<input class="form-input" id="adminPwd" type="password" placeholder="密码…" '
      + 'onkeydown="if(event.key===\'Enter\')tryLogin()">'
      + '</div>'
      + '<div class="composer-footer">'
      + '<button class="btn-post btn-cancel" onclick="closeAdmin()">取消</button>'
      + '<button class="btn-post" onclick="tryLogin()">登录</button>'
      + '</div>';
  } else {
    renderAdminPanel(content);
  }

  document.getElementById('adminOverlay').classList.add('show');
}
function closeAdmin() {
  document.getElementById('adminOverlay').classList.remove('show');
}
function tryLogin() {
  var pwd = document.getElementById('adminPwd').value;
  if (tryAdminLogin(pwd)) {
    toast('管理员模式已解锁');
    renderAdminPanel(document.getElementById('adminContent'));
    // 显示角色管理按钮
    var charBtn = document.getElementById('charBtn');
    if (charBtn) charBtn.style.display = '';
  } else {
    toast('密码错误');
  }
}
function renderAdminPanel(el) {
  var forumId = getActiveForum();
  var forum = getForums().find(function(f) { return f.id === forumId; });
  if (!forum) return;

  // 构建角色设定概览
  var chars = getCharacters();
  var charPreviewHtml = chars.map(function(c) {
    var forumLabels = (c.forums || []).join(', ') || '全部';
    var apiLabel = (c.api && c.api.model) ? '🔗 ' + escapeHtml(c.api.model) : '🌐 全局';
    var stylePreview = (c.style || '').slice(0, 60);
    if ((c.style || '').length > 60) stylePreview += '…';
    return '<div class="char-preview-item">'
      + '<div class="char-preview-header">'
      + '<span class="char-name">' + escapeHtml(c.emoji || '') + ' ' + escapeHtml(c.name) + '</span>'
      + '<span class="char-meta">' + apiLabel + ' · ' + escapeHtml(forumLabels) + '</span>'
      + '</div>'
      + '<div class="char-preview-style">' + escapeHtml(stylePreview) + '</div>'
      + '<button class="btn-sm" onclick="closeAdmin();editChar(\'' + c.id + '\')" style="margin-top:4px">✏️ 编辑</button>'
      + '</div>';
  }).join('');

  el.innerHTML = '<div class="admin-section">'
    + '<div class="info-label">当前论坛：' + escapeHtml(forum.name) + '</div>'
    + '</div>'
    + '<div class="form-row">'
    + '<label>论坛系统提示词</label>'
    + '<textarea class="form-input" id="adminSysPrompt" rows="5">' + escapeHtml(forum.systemPrompt || '') + '</textarea>'
    + '</div>'
    + '<div class="form-row">'
    + '<label>公告</label>'
    + '<textarea class="form-input" id="adminAnnouncement" rows="3">' + escapeHtml(forum.announcement || '') + '</textarea>'
+ '<div class="admin-section" style="margin-top:14px">'
    + '<div class="info-label">👥 角色设定一览（' + chars.length + ' 个角色）</div>'
    + charPreviewHtml
    + '<div class="composer-footer" style="margin-top:8px">'
    + '<button class="btn-sm" onclick="closeAdmin();openCharacters()">📋 打开角色管理</button>'
    + '<button class="btn-sm" onclick="closeAdmin();editChar(null)">➕ 新建角色</button>'
    + '</div>'
    + '</div>'
    + '<div class="admin-section" style="margin-top:14px">'
    + '<div class="info-label">🎭 随机普通员工池（' + RANDOM_RESIDENT_POOL.length + ' 人）<button class="btn-sm" style="margin-left:8px" onclick="toggleResidentList()">展开/收起</button></div>'
    + '<div id="residentListPreview" style="display:none">'
    + RANDOM_RESIDENT_POOL.map(function(r) {
        return '<div class="char-preview-item">'
          + '<div class="char-preview-header">'
          + '<span class="char-name">' + escapeHtml(r.emoji) + ' ' + escapeHtml(r.name) + '</span>'
          + '<span class="char-meta">' + escapeHtml(r.dept) + '</span>'
          + '</div>'
          + '<div class="char-preview-style">' + escapeHtml(r.attitude) + '</div>'
          + '</div>';
      }).join('')
    + '</div>'
    + '</div>'
    + '</div>'
    + '<div class="form-row">'
    + '<label>管理员密码（修改后立即生效）</label>'
    + '<input class="form-input" id="adminNewPwd" placeholder="留空不修改" type="password">'
    + '</div>'
    + '<div class="composer-footer">'
    + '<button class="btn-post" style="background:#c33" onclick="doAdminLogout()">退出管理员</button>'
    + '<button class="btn-post" style="background:#833" onclick="clearAll()">🗑️ 清空帖子</button>'
    + '<button class="btn-post btn-cancel" onclick="closeAdmin()">取消</button>'
    + '<button class="btn-post" onclick="saveAdminChanges()">保存</button>'
    + '</div>';
}
function saveAdminChanges() {
  var forumId = getActiveForum();
  var forums = getForums();
  var forum = forums.find(function(f) { return f.id === forumId; });
  if (!forum) return;

  forum.systemPrompt = document.getElementById('adminSysPrompt').value;
  forum.announcement = document.getElementById('adminAnnouncement').value;
  saveForum(forum);

  var newPwd = document.getElementById('adminNewPwd').value.trim();
  if (newPwd) {
    ADMIN_PASSWORD = newPwd;
    toast('密码已更新（仅本次会话生效，需改代码永久生效）');
  }

  switchForum(forumId);
  closeAdmin();
  toast('管理设置已保存');
}
function doAdminLogout() {
  adminLogout();
  // 隐藏角色管理按钮
  var charBtn = document.getElementById('charBtn');
  if (charBtn) charBtn.style.display = 'none';
  closeAdmin();
  toast('已退出管理员模式');
}

function toggleResidentList() {
  var el = document.getElementById('residentListPreview');
  if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
}

// ---------- 进场弹窗 ----------
var welcomeDismissed = {};

function showWelcomePopup(forum) {
  if (!forum.welcomePopup) return;
  if (welcomeDismissed[forum.id]) return;
  var noShowKey = 'shardbb_noshow_' + forum.id;
  if (localStorage.getItem(noShowKey) === '1') return;

  var popup = forum.welcomePopup;
  document.getElementById('welcomeTitle').textContent = popup.title || forum.name;
  document.getElementById('welcomeBody').innerHTML = popup.lines.map(function(line) {
    if (line === '') return '<div class="welcome-line welcome-blank">&nbsp;</div>';
    return '<div class="welcome-line">' + escapeHtml(line) + '</div>';
  }).join('');
  document.getElementById('welcomeNoShow').checked = false;
  document.getElementById('welcomeOverlay').classList.add('show');
}

function closeWelcome() {
  var forumId = getActiveForum();
  welcomeDismissed[forumId] = true;
  if (document.getElementById('welcomeNoShow').checked) {
    localStorage.setItem('shardbb_noshow_' + forumId, '1');
  }
  document.getElementById('welcomeOverlay').classList.remove('show');
}

// ---------- 角色卡弹出 ----------
function showCharCard(char) {
  // 只对主要角色（有rarity字段的）触发角色卡
  if (!char.rarity || char.isResident) return;
  var isNew = collectCard(char.id);
  if (!isNew) return; // 已收集过，不再弹
  var rarity = RARITY_LABELS[char.rarity || 'common'] || RARITY_LABELS.common;
  var overlay = document.createElement('div');
  overlay.className = 'char-card-overlay';
  var cardImg = char.fullImage || char.avatarImage || '';
  var imgHtml = cardImg ? '<img src="' + cardImg + '">' : '<div style="font-size:48px;text-align:center;padding:20px">' + (char.emoji || '?') + '</div>';
  overlay.innerHTML = '<div class="char-card rarity-' + (char.rarity || 'common') + '">'
    + '<div class="char-card-titlebar"><span>STEM-IX // 用户档案</span><span class="card-close" onclick="this.closest(\'.char-card-overlay\').remove()" style="cursor:pointer">✕</span></div>'
    + '<div class="char-card-body">'
    + '<div class="char-card-imgbox">' + imgHtml + '</div>'
    + '<div class="char-card-info">'
    + '<div class="card-name">' + escapeHtml(char.name) + '</div>'
    + '<div class="card-realname">' + escapeHtml(char.bio ? char.bio.split('。')[0] : '') + '</div>'
    + '<div class="card-bio">' + escapeHtml(char.bio || char.style.slice(0, 80) + '…') + '</div>'
    + '<div style="font-size:10px;color:var(--text2);margin-top:8px;font-family:var(--font)">已识别 ' + getCardCount() + '/' + getMainCharCount() + ' 名用户</div>'
    + '</div></div></div>';
  document.body.appendChild(overlay);
  setTimeout(function() { overlay.classList.add('show'); }, 10);
  // 点遮罩关闭
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) overlay.remove();
  });
  // 自动关闭
  setTimeout(function() {
    if (overlay.parentElement) {
      overlay.classList.remove('show');
      setTimeout(function() { if (overlay.parentElement) overlay.remove(); }, 400);
    }
  }, 5000);
  // 检查角色卡收集成就
  checkCardAchievements(char);
}

function checkCardAchievements(char) {
  var count = getCardCount();
  if (count >= 3) tryShowAchievement('card_3');
  if (count >= getMainCharCount()) tryShowAchievement('card_all');
  var r = char.rarity || 'common';
  if (r === 'legendary') tryShowAchievement('meet_legendary');
  if (r === 'epic') tryShowAchievement('meet_epic');
}

// ---------- 成就弹出 ----------
function tryShowAchievement(id) {
  if (!unlockAchievement(id)) return; // 已解锁
  var ach = ACHIEVEMENTS.find(function(a) { return a.id === id; });
  if (!ach) return;
  var el = document.createElement('div');
  el.className = 'achievement-popup';
  el.innerHTML = '<div class="ach-icon">' + renderAchIcon(ach.icon, 26) + '</div>'
    + '<div class="ach-info"><div class="ach-title">' + renderAchIcon('trophy', 14) + ' 成就解锁！</div>'
    + '<div class="ach-name">' + escapeHtml(ach.title) + '</div>'
    + '<div class="ach-desc">' + escapeHtml(ach.desc) + '</div></div>';
  document.body.appendChild(el);
  setTimeout(function() { el.classList.add('show'); }, 10);
  setTimeout(function() {
    el.classList.remove('show');
    setTimeout(function() { if (el.parentElement) el.remove(); }, 400);
  }, 3500);
}

// ---------- 成就面板 ----------
function showAchievementPanel() {
  var unlocked = getUnlockedAchievements();
  var cards = getCollectedCards();
  var mainChars = getMainCharacters();
  var mainCardCount = getCardCount();
  var html = '<h3>' + renderAchIcon('trophy', 18) + ' 成就 (' + Object.keys(unlocked).length + '/' + ACHIEVEMENTS.length + ')</h3>';
  html += '<div class="ach-grid">';
  ACHIEVEMENTS.forEach(function(a) {
    var done = !!unlocked[a.id];
    html += '<div class="ach-item ' + (done ? 'done' : 'locked') + '">'
      + '<span class="ach-item-icon">' + (done ? renderAchIcon(a.icon, 24) : renderAchIcon('locked', 24)) + '</span>'
      + '<span class="ach-item-title">' + escapeHtml(a.title) + '</span>'
      + '<span class="ach-item-desc">' + (done ? escapeHtml(a.desc) : '???') + '</span>'
      + '</div>';
  });
  html += '</div>';
  html += '<h3 style="margin-top:16px">' + renderAchIcon('card', 18) + ' 角色卡 (' + mainCardCount + '/' + mainChars.length + ')</h3>';
  html += '<div class="card-grid">';
  mainChars.forEach(function(c) {
    var collected = !!cards[c.id];
    var rarity = RARITY_LABELS[c.rarity || 'common'] || RARITY_LABELS.common;
    if (collected) {
      var miniImg = c.avatarImage || '';
      var miniContent = miniImg ? '<img class="card-mini-img" src="' + miniImg + '">' : '<div class="card-mini-emoji">' + c.emoji + '</div>';
      html += '<div class="card-mini" onclick="showCardDetail(\'' + c.id + '\')" style="cursor:pointer">'
        + miniContent
        + '<div class="card-mini-name">' + escapeHtml(c.name) + '</div>'
        + '</div>';
    } else {
      html += '<div class="card-mini card-unknown">'
        + '<div class="card-mini-emoji">？</div>'
        + '<div class="card-mini-name">???</div>'
        + '<div class="card-mini-rarity"></div>'
        + '</div>';
    }
  });
  html += '</div>';
  var overlay = document.createElement('div');
  overlay.className = 'char-card-overlay';
  overlay.innerHTML = '<div class="achievement-panel">'
    + '<div class="card-close" onclick="this.parentElement.parentElement.remove()">✕</div>'
    + html + '</div>';
  document.body.appendChild(overlay);
  setTimeout(function() { overlay.classList.add('show'); }, 10);
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) overlay.remove();
  });
}

// 点击角色卡查看详情
function showCardDetail(charId) {
  var c = getMainCharacters().find(function(ch) { return ch.id === charId; });
  if (!c) c = getCharById(charId);
  if (!c) return;
  var rarity = RARITY_LABELS[c.rarity || 'common'] || RARITY_LABELS.common;
  var overlay = document.createElement('div');
  overlay.className = 'char-card-overlay';
  var detailImg = c.fullImage || c.avatarImage || '';
  var detailImgHtml = detailImg ? '<img src="' + detailImg + '">' : '<div style="font-size:48px;text-align:center;padding:20px">' + (c.emoji || '?') + '</div>';
  overlay.innerHTML = '<div class="char-card">'
    + '<div class="char-card-titlebar"><span>STEM-IX // 用户档案</span><span class="card-close" onclick="this.closest(\'.char-card-overlay\').remove()" style="cursor:pointer">\u2715</span></div>'
    + '<div class="char-card-body">'
    + '<div class="char-card-imgbox">' + detailImgHtml + '</div>'
    + '<div class="char-card-info">'
    + '<div class="card-name">' + escapeHtml(c.name) + '</div>'
    + '<div class="card-realname">' + escapeHtml(c.bio ? c.bio.split('\u3002')[0] : '') + '</div>'
    + '<div class="card-bio">' + escapeHtml(c.bio || c.style.slice(0, 80) + '\u2026') + '</div>'
    + '<div style="font-size:10px;color:var(--text2);margin-top:8px;font-family:var(--font)">\u5df2\u8bc6\u522b ' + getCardCount() + '/' + getMainCharCount() + ' \u540d\u7528\u6237</div>'
    + '</div></div></div>';
  document.body.appendChild(overlay);
  setTimeout(function() { overlay.classList.add('show'); }, 10);
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) overlay.remove();
  });
}

// ---------- 启动 ----------
document.addEventListener('DOMContentLoaded', init);
