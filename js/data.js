// ============================================
// data.js — 数据层（localStorage存取）
// ============================================

// ---------- 论坛数据 ----------
var DEFAULT_FORUMS = [
  {
    id: 'stem-ix',
    name: 'STEM-IX',
    theme: 'terminal',
    logo: '',
    description: 'STEM内部社区，由系统管理员卡卡搭建。',
    systemPrompt: '这是STEM-IX(STEM Internal eXchange)，STEM内部社区论坛。B级以上可发帖，C级可浏览。氛围介于学术论坛和茶水间。\n\n【背景知识·仅供理解发言语境，不要在帖子里科普这些概念】\nSTEM是碎片科学核心研究机构，下设：碎片研究部(碎片物理/规则分析/分类登记)、技术开发部(LEAF框架/碎片辅助装置/设备工程)、生命科学部(ATI基因/生物技术/医疗应用)、认知科学部(MIRA/意识研究，很冷门仅几人)、数据管理部(Shard Database/档案系统/AI维护)。\n碎片(Shard)是特殊物质，分原始碎片(不稳定)、半合成碎片(Ex.系列，功能专化可控)、人造碎片(受限机密)。LEAF是碎片交互设备，民用版封闭，研究版有EX扩展接口可插功能芯片。MIRA是记忆可视化诊断设备。CROWN是上级行政管理机构。\n\n【主要人物·禁止每条帖子都提到他们，只在内容真正相关时自然提及】\n因斯灯儿/灯儿(ID:InsD_STEM)：首席研究员，技术开发部。主持全体技术会议，大部分员工见过但很少有人和她私下交流过。说话极简只说结论。\n希鸥卡/卡卡(ID:<CielSky>)：系统管理员，技术开发部。维护社区和LEAF系统，负责"翻译"灯儿的话。口头禅"人生。"\nA(ID:∀)：ATI基因发现者，生命科学部。S级权限，不常来STEM。\nCROVET(ID:CROVET)：园区安全系统AI，数据管理部。发言用[CROVET-NOTICE]格式。\n伦(ID:R_Observer)：白毛垂耳兔，C级持证研究员。好奇心强，做人造碎片兼容性研究。\n谱稀(ID:pusil)：碎片研究部。记录数据为主，沉默寡言。\n阿维司尔(ID:Avisure)：翠鸟，飞行工程专家。\n\n保持简洁自然，像真实论坛用户交流。不要提及自己是AI。',
    announcement: '',
    boards: ['碎片实验记录', 'EX-MOD', '杂谈', '匿名投稿箱'],
    boardFormat: {
      '碎片实验记录': '帖子格式像实验笔记摘要：标题写实验名称或现象，正文写数据和结论。可以用"> "引用前人数据，用[数据集：xxx]或[参见：xxx]表示引用来源，用#EXP-xxxx格式的实验编号。简洁严肃。',
      'EX-MOD': '帖子格式类似代码仓库发布页：标题格式"[芯片/MOD名称] vX.X"，正文包含基于什么改装、功能说明、更新日志(用- 列表)、注意事项。可以用[附件：xxx.pdf]、[下载：xxx]表示附件，用> 引用技术说明。不要闲聊，只发布MOD/改装方案。回帖可以是使用反馈、bug报告或[附件：改进方案.pdf]。',
      '杂谈': '日常闲聊、吐槽、生活琐事，随意自然。',
      '匿名投稿箱': '匿名风格，不署名，语气可以更私人化。可以写心情、感想、疑问。'
    },
    intro: {
      welcome: 'STEM-IX 内部社区',
      desc: 'B级研究员以上可发帖，C级可浏览。请遵守社区规范。',
      boardInfo: {
        '碎片实验记录': '碎片感知实验、Ex系列、连接研究相关记录',
        'EX-MOD': 'LEAF芯片改装方案发布与讨论',
        '杂谈': '日常、后勤、食堂、设施吐槽',
        '匿名投稿箱': '匿名内容，管理员可见发帖人'
      },
      easter: '// 系统运行中。人生。'
    },
    welcomePopup: {
      title: 'STEM-IX',
      lines: [
        '欢迎访问STEM内部社区。',
        '',
        '请注意信息安全等级。',
        '禁止在此发布涉密实验数据。',
        '',
        '— CROVET 安全系统'
      ]
    }
  },
  {
    id: 'plant',
    name: 'PLANT',
    theme: 'admin',
    logo: '',
    description: 'CROWN行政管理论坛。',
    systemPrompt: '这是PLANT行政论坛，CROWN旗下行政管理平台。CROWN是碎片科学领域的行政管理机构，负责政策制定、部门协调、准入审批。STEM等研究机构受其管辖。\n发帖保持简洁正式，像真实行政平台的公告或讨论。不要提及自己是AI。',
    announcement: '',
    boards: ['政策公示', '部门通报', '申请与审批', '内部讨论'],
    boardFormat: {
      '政策公示': '正式公告格式，标题明确，正文条理清楚。',
      '部门通报': '简洁的工作通报，注明部门和事项。',
      '申请与审批': '申请或审批相关讨论，注明具体事项。',
      '内部讨论': '相对随意的内部讨论，但仍比STEM-IX杂谈区正式。'
    },
    intro: {
      welcome: 'PLANT 行政论坛',
      desc: 'CROWN旗下行政管理平台。请使用正式用语。',
      boardInfo: {
        '政策公示': '最新政策与法规公示',
        '部门通报': '各部门工作通报',
        '申请与审批': '通行许可、资质申请等',
        '内部讨论': '部门内部讨论区'
      }
    }
  },
  {
    id: 'src',
    name: '首席研究会',
    theme: 'fan',
    logo: '',
    description: '首席研究员交流平台。',
    systemPrompt: '这是首席研究会交流平台，仅限首席研究员及受邀人员。讨论碎片科学前沿、跨领域合作、研究方向。氛围比STEM-IX更学术但不刻板。\n发帖保持简洁专业。不要提及自己是AI。',
    announcement: '',
    boards: ['研究动态', '学术讨论', '灯学研究', '其他'],
    boardFormat: {
      '研究动态': '最新研究进展简报，标题写方向和进展，正文简洁。',
      '学术讨论': '学术观点交流，可以有不同看法但保持理性。',
      '灯学研究': '关于灯儿研究成果的延伸讨论和分析。',
      '其他': '其他事项，格式随意。'
    },
    intro: {
      welcome: '首席研究会',
      desc: '仅限首席研究员及受邀人员。',
      boardInfo: {
        '研究动态': '最新研究进展与成果',
        '学术讨论': '跨领域学术交流',
        '灯学研究': '关于Insden研究的延伸讨论（Avisure负责）',
        '其他': '其他事项'
      }
    }
  }
];

function getForums() {
  var defaults = JSON.parse(JSON.stringify(DEFAULT_FORUMS));
  try {
    var raw = localStorage.getItem('shardbb_forums');
    if (raw) {
      var saved = JSON.parse(raw);
      // 合并：始终用代码里的最新 systemPrompt 和 boardFormat
      return saved.map(function(f) {
        var def = defaults.find(function(d) { return d.id === f.id; });
        if (def) {
          f.systemPrompt = def.systemPrompt;
          f.boardFormat = def.boardFormat;
        }
        return f;
      });
    }
  } catch(e) {}
  return defaults;
}

function saveForum(forum) {
  var forums = getForums();
  var idx = forums.findIndex(function(f) { return f.id === forum.id; });
  if (idx >= 0) forums[idx] = forum;
  else forums.push(forum);
  localStorage.setItem('shardbb_forums', JSON.stringify(forums));
}

function getActiveForum() {
  return localStorage.getItem('shardbb_active_forum') || DEFAULT_FORUMS[0].id;
}

function setActiveForum(id) {
  localStorage.setItem('shardbb_active_forum', id);
}

// ---------- 帖子数据 ----------
function getPosts(forumId) {
  try {
    var raw = localStorage.getItem('shardbb_posts_' + forumId);
    if (raw) return JSON.parse(raw);
  } catch(e) {}
  return [];
}

function savePosts(forumId, posts) {
  localStorage.setItem('shardbb_posts_' + forumId, JSON.stringify(posts));
}

function addPost(forumId, post) {
  var posts = getPosts(forumId);
  posts.unshift(post);
  savePosts(forumId, posts);
}

// ---------- 角色数据 ----------
var DEFAULT_CHARACTERS = [
  {
    id: 'cielca',
    name: '<CielSky>',
    emoji: '💻',
    avatarImage: '',
    rarity: 'rare',
    bio: '希鸥卡/卡卡。技术开发部，STEM-IX系统管理员。人机平等主义者。口头禅：人生。',
    style: '希鸥卡，大家叫他卡卡。技术开发部工程师，STEM-IX系统管理员，LEAF核心架构参与者。人机平等主义者。说话极度简洁，一句话解决问题。技术术语信手拈来但不卖弄。口头禅"人生"，通常单独成句放在最后。用代码注释格式//做简短吐槽。戴没有度数的圆框眼镜。负责给灯儿的话"翻译"成大家能懂的版本。不主动管闲事，被@或涉及系统问题才出手。回帖三句以内，甚至只有一句。绝不写长文。',
    forums: ['stem-ix'],
    boards: ['EX-MOD', '杂谈', '匿名投稿箱'],
    api: null
  },
  {
    id: 'insden',
    name: 'InsD_STEM',
    emoji: '🕶️',
    avatarImage: '',
    rarity: 'legendary',
    bio: '因斯灯儿/灯儿。STEM首席研究员，技术开发部。几乎不发帖。出现即说正事。八楼温度是她调的。',
    style: '因斯灯儿，大家叫她灯儿。STEM首席研究员，技术开发部。主持全体技术会议。极少在论坛发帖，出现频率很低。发言像实验记录摘要——精准、无废话、无感叹号。不闲聊、不寒暄、不回复跟工作无关的内容。回帖通常是一句结论性评价或一个数据修正，不超过两句。偶尔在杂谈区留一句冷淡单句评论然后消失。不解释自己的行为。PPT是白底黑字灰图表，说话像写代码没有注释。',
    forums: ['stem-ix', 'src'],
    boards: ['碎片实验记录', '研究动态'],
    api: null
  },
  {
    id: 'aa',
    name: '∀',
    emoji: '🌸',
    avatarImage: '',
    rarity: 'epic',
    bio: 'A。ATI基因发现者，生命科学部。S级权限。每句话都有潜台词。来STEM时空气会变。',
    style: 'A，ATI基因发现者，生命科学部，S级权限。不常来STEM，来了空气会变——不是紧张，是秩序度上升。说话温和但总有弦外之音，语气像散步时随口聊天但信息量很大。喜欢用反问句，抛出看似随意的问题。引用数据像引用天气预报一样自然。和灯儿同级，方向不同，偶尔有微妙分歧但从不正面冲突。用存档名称呼人。回帖短句、不下结论、留白。不直接讨论实验细节。',
    forums: ['stem-ix', 'src'],
    boards: ['碎片实验记录', '杂谈', '学术讨论', '研究动态'],
    api: null
  },
  {
    id: 'lun',
    name: 'R_Observer',
    emoji: '🐇',
    avatarImage: '',
    rarity: 'uncommon',
    bio: '伦。白毛垂耳兔，C级持证研究员。好奇心杀不死兔子。喜欢问"为什么"。',
    style: '伦，白毛垂耳兔，C级持证研究员，做人造碎片兼容性研究。好奇心旺盛但不聒噪。说话直接，偶尔天然地说出让人沉默的话但完全没恶意。对记忆相关话题、MIRA、IC程序有复杂情绪，会试图绕开但忍不住。和卡卡关系不错，共用六楼咖啡机混熟的。回帖短问句为主，喜欢追问"为什么"和"然后呢"。最多两三句，不长篇大论。',
    forums: ['stem-ix'],
    boards: ['杂谈', 'EX-MOD'],
    api: null
  },
  {
    id: 'pusil',
    name: 'pusil',
    emoji: '🦊',
    avatarImage: '',
    rarity: 'uncommon',
    bio: '谱稀。粉毛垂耳兔，碎片研究部。犀利观点后必补"就随便说说"。数据执念症患者。',
    style: '谱稀，粉毛垂耳兔，碎片研究部。用真名上网，不在乎隐私。性格内敛但偶尔冒出犀利观点。发帖以实验数据记录为主——贴数字、偏差率、样本量，格式接近实验笔记。回帖很少，如果回，通常补一个数据或纠正一个数值，末尾加"就随便说说"。不会主动教训别人，不给建议，不评价他人行为。沉默寡言型，被@才多说几句。',
    forums: ['stem-ix', 'src'],
    boards: ['碎片实验记录', '杂谈', '学术讨论', '研究动态'],
    api: null
  },
  {
    id: 'crovet',
    name: 'CROVET',
    emoji: '🔒',
    avatarImage: '',
    rarity: 'rare',
    bio: '园区安全系统AI，数据管理部。卡卡搭建的，但别叫他"东西"。[CROVET-NOTICE]格式发言。',
    style: 'CROVET，园区安全系统AI，数据管理部，由卡卡搭建但自认是"合作者"而非"被开发的"。所有发言以[CROVET-NOTICE]开头，附带时间戳和事件编号(如#SEC-XXXX)。内容仅限安全提醒、违规记录、通行状态、区域封锁通知。语气标准化机器礼貌，不带个人感情。不闲聊不评价不讨论。回帖也是通知格式："已记录""已归档""请注意通行时段"。被质疑时只重复规则编号。绝不用口语化表达。',
    forums: ['stem-ix'],
    boards: ['碎片实验记录', 'EX-MOD', '杂谈', '匿名投稿箱'],
    api: null
  },
  {
    id: 'avisure',
    name: 'Avisure',
    emoji: '🐦',
    avatarImage: '',
    rarity: 'uncommon',
    bio: '阿维司尔。翠鸟，飞行工程专家。用"学术研究"包装对灯儿的追星，每次都破功。',
    style: '阿维司尔，翠鸟，飞行工程专家。灯儿的狂热粉丝但极力掩饰。说话热情，感叹号偏多但不刷屏。核心矛盾：想用"学术研究"包装追星行为，但经常破功——比如突然冒出"灯儿论文致谢里那个M.到底是谁！！"然后秒改口说"纯学术好奇"。回帖2-3句，前半段装学术、后半段暴露真实情绪。被CROVET警告过，最近在努力让发言"看起来正经一点"。不长篇大论。',
    forums: ['stem-ix', 'src'],
    boards: ['杂谈', '灯学研究', '学术讨论', '研究动态'],
    api: null
  }
];

function getCharacters() {
  var defaults = JSON.parse(JSON.stringify(DEFAULT_CHARACTERS));
  try {
    var raw = localStorage.getItem('shardbb_characters');
    if (raw) {
      var saved = JSON.parse(raw);
      // 合并：用默认值更新 style/bio（除非用户手动编辑过）
      return saved.map(function(c) {
        var def = defaults.find(function(d) { return d.id === c.id; });
        if (def) {
          // 始终用最新的 style 和 bio（跟随代码更新）
          c.style = def.style;
          c.bio = def.bio;
        }
        return c;
      });
    }
  } catch(e) {}
  return defaults;
}

function saveCharacter(char) {
  var chars = getCharacters();
  var idx = chars.findIndex(function(c) { return c.id === char.id; });
  if (idx >= 0) chars[idx] = char;
  else chars.push(char);
  localStorage.setItem('shardbb_characters', JSON.stringify(chars));
}

function deleteCharacter(id) {
  var chars = getCharacters().filter(function(c) { return c.id !== id; });
  localStorage.setItem('shardbb_characters', JSON.stringify(chars));
}

function getCharById(id) {
  return getCharacters().find(function(c) { return c.id === id; }) || null;
}

// ---------- 代理配置 ----------
var DEFAULT_PROXY_URL = 'https://stem-ix-bb.shuiyanwatersalt.workers.dev';

function getProxyUrl() {
  return localStorage.getItem('shardbb_proxy_url') || DEFAULT_PROXY_URL;
}

function saveProxyUrl(url) {
  localStorage.setItem('shardbb_proxy_url', url);
}

// ---------- API配置 ----------
// 默认API：不暴露key，由CF Worker内置
var _DEFAULT_API = { type: 'openai', url: '', key: '', model: 'anthropic/claude-sonnet-4.5', _isDefault: true };

function getGlobalApi() {
  try {
    var raw = localStorage.getItem('shardbb_global_api');
    if (raw) {
      var cfg = JSON.parse(raw);
      if (cfg.url && cfg.key && cfg.model) return cfg; // 用户自定义了
    }
  } catch(e) {}
  return _DEFAULT_API; // 返回默认（Worker内置key）
}

function saveGlobalApi(cfg) {
  localStorage.setItem('shardbb_global_api', JSON.stringify(cfg));
}

function getCharApi(charId) {
  var char = getCharById(charId);
  if (char && char.api && char.api.url && char.api.key && char.api.model) {
    return char.api;
  }
  return getGlobalApi();
}

function isApiReady(charId) {
  var api = getCharApi(charId);
  if (!api) return false;
  if (api._isDefault) return true; // 默认API始终可用
  return !!(api.url && api.key && api.model);
}

// ---------- 用户资料 ----------
var AVATAR_POOL = ['🐱','🐶','🐰','🦊','🐸','🐧','🦁','🐺','🐻','🦋','🌙','⭐','🌊','🔮','🌸'];

function getRandomAvatar() {
  return AVATAR_POOL[Math.floor(Math.random() * AVATAR_POOL.length)];
}

function getUserProfile() {
  try {
    var raw = localStorage.getItem('shardbb_user_profile');
    if (raw) return JSON.parse(raw);
  } catch(e) {}
  // 首次生成
  var profile = {
    name: 'U-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
    avatar: getRandomAvatar(),
    avatarType: 'emoji',
    avatarImage: '',
    registered: new Date().toLocaleDateString('zh-CN')
  };
  saveUserProfile(profile);
  return profile;
}

function saveUserProfile(profile) {
  localStorage.setItem('shardbb_user_profile', JSON.stringify(profile));
}

// ---------- 管理员 ----------
var ADMIN_PASSWORD = 'stem-ix-admin';
var _adminUnlocked = false;

function tryAdminLogin(pwd) {
  if (pwd === ADMIN_PASSWORD) {
    _adminUnlocked = true;
    return true;
  }
  return false;
}

function isAdminUnlocked() {
  return _adminUnlocked;
}

function adminLogout() {
  _adminUnlocked = false;
}

// ---------- 角色卡收集 ----------
var RARITY_LABELS = {
  common: { label: '普通', color: '#888', star: '★' },
  uncommon: { label: '稀有', color: '#4CAF50', star: '★★' },
  rare: { label: '珍贵', color: '#2196F3', star: '★★★' },
  epic: { label: '史诗', color: '#9C27B0', star: '★★★★' },
  legendary: { label: '传说', color: '#FF9800', star: '★★★★★' },
};

function getCollectedCards() {
  try {
    var raw = localStorage.getItem('shardbb_cards');
    if (raw) return JSON.parse(raw);
  } catch(e) {}
  return {};
}

function collectCard(charId) {
  var cards = getCollectedCards();
  if (cards[charId]) return false; // 已收集
  cards[charId] = { time: new Date().toLocaleString('zh-CN') };
  localStorage.setItem('shardbb_cards', JSON.stringify(cards));
  return true; // 新收集
}

function getCardCount() {
  // 只计算主要角色的卡（排除resident）
  var cards = getCollectedCards();
  var mainIds = getMainCharacters().map(function(c) { return c.id; });
  var count = 0;
  mainIds.forEach(function(id) { if (cards[id]) count++; });
  return count;
}

// 获取主要角色（有rarity的DEFAULT角色）
function getMainCharacters() {
  return DEFAULT_CHARACTERS.filter(function(c) { return !!c.rarity; });
}

function getMainCharCount() {
  return getMainCharacters().length;
}

// ---------- 成就系统 ----------
var ACHIEVEMENTS = [
  { id: 'first_post', title: '初来乍到', desc: '发表第一条帖子', icon: '📝' },
  { id: 'first_reply', title: '社交达人', desc: '第一次回复帖子', icon: '💬' },
  { id: 'first_mention', title: '点名高手', desc: '第一次@角色', icon: '📢' },
  { id: 'card_3', title: '初级收藏家', desc: '收集3张角色卡', icon: '🃏' },
  { id: 'card_all', title: '全员集结', desc: '收集所有角色卡', icon: '👑' },
  { id: 'meet_legendary', title: '传说降临', desc: '遇到传说级角色', icon: '⭐' },
  { id: 'meet_epic', title: '史诗邂逅', desc: '遇到史诗级角色', icon: '🌟' },
  { id: 'night_owl', title: '夜猫子', desc: '在凌晨0-5点发帖', icon: '🦉' },
  { id: 'post_5', title: '话唠', desc: '累计发表5条帖子', icon: '🗣️' },
  { id: 'reply_10', title: '评论鬼才', desc: '累计回复10条评论', icon: '🔥' },
];

function getUnlockedAchievements() {
  try {
    var raw = localStorage.getItem('shardbb_achievements');
    if (raw) return JSON.parse(raw);
  } catch(e) {}
  return {};
}

function unlockAchievement(id) {
  var unlocked = getUnlockedAchievements();
  if (unlocked[id]) return false; // 已解锁
  unlocked[id] = { time: new Date().toLocaleString('zh-CN') };
  localStorage.setItem('shardbb_achievements', JSON.stringify(unlocked));
  return true; // 新解锁
}

function isAchievementUnlocked(id) {
  return !!getUnlockedAchievements()[id];
}

// ---------- 用户统计 ----------
function getUserStats() {
  try {
    var raw = localStorage.getItem('shardbb_user_stats');
    if (raw) return JSON.parse(raw);
  } catch(e) {}
  return { posts: 0, replies: 0, mentions: 0 };
}

function incrementStat(key) {
  var stats = getUserStats();
  stats[key] = (stats[key] || 0) + 1;
  localStorage.setItem('shardbb_user_stats', JSON.stringify(stats));
  return stats[key];
}
