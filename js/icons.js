// icons.js - STEM-IX 内联SVG图标库
// 单色线条风格，stroke 使用 currentColor，自动继承主题文字颜色
// 用法：ICONS.get('name') 返回 svg 字符串；ICONS.get('name', 18) 指定尺寸
var ICONS = (function() {
  // 统一模板：24x24 viewBox，线宽1.8，圆角线帽
  function wrap(inner, size) {
    size = size || 18;
    return '<svg class="sx-icon" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + inner + '</svg>';
  }

  var PATHS = {
    // 📖 术语释义（书本）
    book: '<path d="M12 6c-1.5-1.4-3.6-2-6-2v14c2.4 0 4.5.6 6 2 1.5-1.4 3.6-2 6-2V4c-2.4 0-4.5.6-6 2z"/><path d="M12 6v14"/>',
    // ☰ 术语速查表（列表）
    list: '<path d="M8 6h12M8 12h12M8 18h12"/><path d="M4 6h.01M4 12h.01M4 18h.01"/>',
    // 👥 角色管理（双人）
    users: '<circle cx="9" cy="8" r="3.2"/><path d="M3.5 19c.6-3 2.8-4.6 5.5-4.6s4.9 1.6 5.5 4.6"/><path d="M15.5 5.4a3.2 3.2 0 0 1 0 5.2"/><path d="M17.5 14.6c1.7.7 2.7 2.2 3 4.4"/>',
    // ✦ 成就&角色卡（四芒星）
    spark: '<path d="M12 3l1.8 6.2L20 11l-6.2 1.8L12 19l-1.8-6.2L4 11l6.2-1.8z"/>',
    // ⚙ 设置（齿轮）
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1"/>',
    // ⊕ 管理员（圆加）
    admin: '<circle cx="12" cy="12" r="8.5"/><path d="M12 8v8M8 12h8"/>',
    // ✎ 我来发帖（笔）
    pen: '<path d="M4 20l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19l-4 1z"/><path d="M14.5 6.5l3 3"/>',
    // ◈ 让角色发帖（菱形）
    diamond: '<path d="M12 3l7 9-7 9-7-9z"/><path d="M12 8.5L14.7 12 12 15.5 9.3 12z"/>',
    // ✨ 随机/生成（星尘）
    sparkles: '<path d="M11 4l1.5 4.5L17 10l-4.5 1.5L11 16l-1.5-4.5L5 10l4.5-1.5z"/><path d="M18 15l.8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8z"/>',
    // 📝 编辑（文档+笔）
    edit: '<path d="M13 4H6a1.5 1.5 0 0 0-1.5 1.5v13A1.5 1.5 0 0 0 6 20h11a1.5 1.5 0 0 0 1.5-1.5V11"/><path d="M17.3 3.7a1.9 1.9 0 0 1 2.7 2.7L13 13.5 9.5 14.5l1-3.5z"/>',
    // ✂️ 裁剪（剪刀）
    scissors: '<circle cx="6" cy="6.5" r="2.5"/><circle cx="6" cy="17.5" r="2.5"/><path d="M8.2 8.2L20 20M20 4L8.2 15.8"/>',
    // 👤 我的资料（单人）
    user: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20c.8-3.5 3.4-5.4 7-5.4s6.2 1.9 7 5.4"/>',
    // 🔐 管理员面板（锁）
    lock: '<rect x="5" y="11" width="14" height="9" rx="1.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/><path d="M12 14.5v2.5"/>',
    // 📡 拉取模型（天线）
    antenna: '<circle cx="12" cy="13" r="2"/><path d="M12 15v6"/><path d="M8.5 9.5a5 5 0 0 1 7 0M6 7a8.5 8.5 0 0 1 12 0"/>',
    // 🎲 随机头像（骰子）
    dice: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M9 9h.01M15 9h.01M12 12h.01M9 15h.01M15 15h.01"/>',
    // 📷 上传头像（相机）
    camera: '<path d="M4 8.5A1.5 1.5 0 0 1 5.5 7H8l1.5-2h5L16 7h2.5A1.5 1.5 0 0 1 20 8.5v9A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5z"/><circle cx="12" cy="13" r="3.2"/>',
    // ➕ 新建（加号）
    plus: '<path d="M12 5v14M5 12h14"/>',
    // 💡 提示（灯泡）
    bulb: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 1 3.5 10.9c-.8.6-1 1.3-1 2.1h-5c0-.8-.2-1.5-1-2.1A6 6 0 0 1 12 3z"/>',
    // 🏆 成就（奖杯）
    trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 5H5a3 3 0 0 0 3 4M16 5h3a3 3 0 0 1-3 4"/><path d="M12 13v3M9 20h6M10 16h4l.5 4h-5z"/>',
    // ✕ 关闭（叉）
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    // 📸 导出图片（下载）
    download: '<path d="M12 4v10M8 10l4 4 4-4"/><path d="M5 19h14"/>',
    // 💬 回复气泡
    chat: '<path d="M4.5 5.5h15v10.5h-9L6 20v-4H4.5z"/>',
    // ❌ 错误（圆叉）
    error: '<circle cx="12" cy="12" r="8.5"/><path d="M9 9l6 6M15 9l-6 6"/>',
    // 🦉 夜猫子（月亮）
    moon: '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"/>',
    // 🗣️ 话唠（喇叭）
    megaphone: '<path d="M4 10v4h3l7 4V6l-7 4z"/><path d="M17.5 9a4.5 4.5 0 0 1 0 6"/>',
    // 🃏 角色卡（卡片）
    card: '<rect x="5" y="3.5" width="14" height="17" rx="2"/><path d="M9 8h6M9 12h6M9 16h3"/>',
    // 👑 全员集结（皇冠）
    crown: '<path d="M4 17h16M4 17l-1-9 5 3.5L12 5l4 6.5L21 8l-1 9"/>',
    // ⭐ 传说（五角星）
    star: '<path d="M12 3.5l2.5 5.3 5.8.7-4.3 4 1.1 5.7-5.1-2.9-5.1 2.9 1.1-5.7-4.3-4 5.8-.7z"/>',
    // 🌟 史诗（星+光晕）
    starburst: '<path d="M12 6l1.7 3.6 3.9.5-2.9 2.7.8 3.9L12 14.7l-3.5 2 .8-3.9-2.9-2.7 3.9-.5z"/><path d="M12 2v1.5M12 20.5V22M2 12h1.5M20.5 12H22"/>',
    // 🔥 评论鬼才（火焰）
    flame: '<path d="M12 3c1 3-.5 4.5-1.5 6C9.5 10.5 9 12 9 13.5a3.5 3.5 0 0 0 7 0c0-1-.3-2-.8-2.9-.3.7-.8 1.2-1.5 1.4.6-2.3.3-5.5-1.7-9z"/><path d="M7.5 9.5C6.5 11 6 12.7 6 14.5a6 6 0 0 0 12 0c0-1.4-.4-2.7-1-3.9"/>',
    // 🔓 未解锁（锁-闭）
    locked: '<rect x="6" y="10.5" width="12" height="9" rx="1.5"/><path d="M9 10.5V7.5a3 3 0 0 1 6 0v3"/>'
  };

  return {
    get: function(name, size) {
      var p = PATHS[name];
      if (!p) return '';
      return wrap(p, size);
    },
    has: function(name) { return !!PATHS[name]; }
  };
})();

// 页面加载后，把带 data-icon 属性的元素内容替换成 SVG
document.addEventListener('DOMContentLoaded', function() {
  var els = document.querySelectorAll('[data-icon]');
  for (var i = 0; i < els.length; i++) {
    var name = els[i].getAttribute('data-icon');
    var size = parseInt(els[i].getAttribute('data-icon-size') || '18', 10);
    if (ICONS.has(name)) els[i].innerHTML = ICONS.get(name, size);
  }
});
