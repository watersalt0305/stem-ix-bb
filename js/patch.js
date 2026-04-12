// patch.js - 覆盖修正
var _origRFT = renderForumTabs;
renderForumTabs = function() {
  _origRFT();
  if (!_adminUnlocked) {
    var el = document.getElementById('forumTabs');
    var btns = el.getElementsByTagName('button');
    for (var i = btns.length - 1; i >= 0; i--) {
      var t = btns[i].textContent;
      if (t === '首席研究会' || t === 'PLANT') btns[i].remove();
    }
  }
};
renderMarkdown = function(text) {
  if (!text) return '';
  var html = escapeHtml(text);
  html = html.replace(/```([\s\S]*?)```/g, '<pre class="md-code-block">$1</pre>');
  html = html.replace(/`([^`]+)`/g, '<code class="md-code-inline">$1</code>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');
  var lines = html.split('\n');
  for (var i = 0; i < lines.length; i++) {
    if (/^&gt;\s?/.test(lines[i])) {
      lines[i] = '<blockquote class="md-quote">' + lines[i].replace(/^&gt;\s?/, '') + '</blockquote>';
    } else if (/^\s*-\s+/.test(lines[i])) {
      lines[i] = '<li class="md-li">' + lines[i].replace(/^\s*-\s+/, '') + '</li>';
    }
  }
  html = lines.join('\n');
  html = html.replace(/\[([^\]]+?)[:\uff1a]([^\]]+)\]/g, '<span class="md-link">[$1: $2]</span>');
  html = html.replace(/\n/g, '<br>');
  html = html.replace(/@([^\s@,\uff0c\u3002!?\uff01\uff1f<]+)/g, '<span class="mention">@$1</span>');
  return html;
};
