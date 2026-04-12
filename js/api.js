// ============================================
// api.js — API调用层（支持角色独立API）
// v2 — 2026-04-12
// ============================================
console.log('[ShardBB] api.js v2 loaded');

// Mock 回复
var MOCK_POSTS = [
  { t:'碎片感知模式异常记录', c:'今天Lab-E的感知数据出现了0.3%的偏移，目前原因不明。已提交日志。' },
  { t:'LEAF-B模块散热问题', c:'有人遇到过连续使用2小时以上LEAF-B模块温度异常升高的情况吗？' },
  { t:'食堂的菌菇汤', c:'SEED食堂今天的symbia菌菇汤意外好喝，推荐尝试。' },
  { t:'通行许可又改了', c:'听说去Folium的通行许可办理流程又更新了，有人知道具体变化吗？' },
  { t:'关于Ex.Ruler的一个疑问', c:'公开文档里没提到Ex.Ruler的能耗分级机制，有人了解吗？' },
];
var MOCK_COMMENTS = [
  '已确认，数据已同步。',
  '这个问题我也遇到过，建议检查散热模块连接。',
  '同感，今天确实不错。',
  '人生……又改了。',
  '有意思，我去看看。',
  '已记录，会跟进。',
  '不太确定，建议问核心研究部。',
  '收到，谢谢提醒。',
  '嗯嗯，注意到了。',
  '这个角度值得深入。',
];

// 通过代理调用API
function stripThinking(text) {
  if (!text) return text;
  // 移除 <think>...</think> / <thinking>...</thinking> 块（含不闭合的情况）
  text = text.replace(/<think(?:ing)?>[\s\S]*?<\/think(?:ing)?>/gi, '');
  // 移除未闭合的 <think> 到末尾
  text = text.replace(/<think(?:ing)?>[\s\S]*$/gi, '');
  return text.trim();
}

function callAPI(apiCfg, systemPrompt, userMsg) {
  var isDefault = apiCfg._isDefault === true;
  var url = isDefault ? '' : apiCfg.url.replace(/\/+$/, '');
  var type = apiCfg.type || 'openai';
  var bodyObj, proxyHeaders;

  if (type === 'anthropic') {
    if (url.indexOf('/messages') < 0) {
      url = url.replace(/\/v1\/?$/, '') + '/v1/messages';
    }
    proxyHeaders = {
      'x-api-key': apiCfg.key,
      'anthropic-version': '2023-06-01',
    };
    bodyObj = {
      model: apiCfg.model,
      max_tokens: 1024,
      system: String(systemPrompt || ''),
      messages: [{ role: 'user', content: String(userMsg || '') }],
    };
  } else {
    if (!isDefault) {
      if (url.indexOf('/chat/completions') < 0) {
        if (!/\/v1\/?$/.test(url)) url += '/v1';
        url += '/chat/completions';
      }
    }
    proxyHeaders = isDefault ? {} : { 'Authorization': 'Bearer ' + apiCfg.key };
    var modelLower = (apiCfg.model || '').toLowerCase();
    var isThinkingModel = modelLower.indexOf('deepseek') >= 0
      || modelLower.indexOf('gemini') >= 0
      || modelLower.indexOf('think') >= 0
      || modelLower.indexOf('r1') >= 0
      || modelLower.indexOf('qwq') >= 0;
    bodyObj = {
      model: apiCfg.model,
      messages: [
        { role: 'system', content: String(systemPrompt || '') },
        { role: 'user', content: String(userMsg || '') },
      ],
    };
    if (isThinkingModel) {
      bodyObj.max_completion_tokens = 4096;
    } else {
      bodyObj.max_tokens = 1024;
    }
  }

  // 判断是否直连模式（不走代理）
  var proxyUrl = getProxyUrl();
  var isDirect = !proxyUrl || proxyUrl === 'direct';

  var requestUrl, requestBody, requestHeaders;
  if (isDirect) {
    // 直连：直接请求 API
    requestUrl = url;
    requestBody = JSON.stringify(bodyObj);
    requestHeaders = proxyHeaders;
    requestHeaders['Content-Type'] = 'application/json';
  } else if (apiCfg._isDefault) {
    // 默认API模式：不传key，Worker自动用内置key
    requestUrl = proxyUrl;
    requestBody = JSON.stringify(bodyObj);
    requestHeaders = { 'Content-Type': 'application/json' };
  } else {
    // 自定义API + CF Worker代理模式
    requestUrl = proxyUrl;
    requestBody = JSON.stringify(bodyObj);
    requestHeaders = {
      'Content-Type': 'application/json',
      'X-Target-URL': url
    };
    var authKey = proxyHeaders['Authorization'] || proxyHeaders['x-api-key'] || '';
    if (authKey) requestHeaders['Authorization'] = authKey;
  }

  return new Promise(function(resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', requestUrl, true);
    var hkeys = Object.keys(requestHeaders);
    for (var hi = 0; hi < hkeys.length; hi++) {
      xhr.setRequestHeader(hkeys[hi], requestHeaders[hkeys[hi]]);
    }
    xhr.onload = function() {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          if (!xhr.responseText || !xhr.responseText.trim()) {
            reject(new Error('代理返回空响应(status=' + xhr.status + ')'));
            return;
          }
          var data = JSON.parse(xhr.responseText);
          if (data.error) {
            reject(new Error(data.error.message || JSON.stringify(data.error)));
            return;
          }
          if (type === 'anthropic') {
            resolve(stripThinking((data.content && data.content[0] && data.content[0].text) || ''));
          } else {
            resolve(stripThinking((data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || ''));
          }
        } catch(e) {
          reject(new Error('响应解析失败: ' + (xhr.responseText || '(空)').slice(0, 100)));
        }
      } else {
        var errBody = '';
        try { errBody = JSON.parse(xhr.responseText).error.message; } catch(e2) { errBody = (xhr.responseText || '').slice(0, 100); }
        reject(new Error('API错误 ' + xhr.status + ': ' + errBody));
      }
    };
    xhr.onerror = function() {
      reject(new Error('网络错误(代理=' + getProxyUrl() + ')'));
    };
    xhr.timeout = 90000;
    xhr.ontimeout = function() { reject(new Error('请求超时(90s)，API可能响应过慢')); };
    xhr.send(requestBody);
  });
}

// 生成帖子
function generatePost(char, forum, board, topic) {
  var forumData = getForums().find(function(f) { return f.id === forum; });
  var sysBase = forumData ? forumData.systemPrompt : '';
  var sys = sysBase + '\n\n你现在是论坛用户"' + char.name + '"。严格按照以下人设发言，不要脱离角色：\n' + char.style + '\n\n重要规则：直接写帖子内容，不要加"我是XX"之类的自我介绍。不要说教、不要给建议、不要写meta描述。像真的在论坛发帖一样自然。';
  if (board) {
    sys += '\n当前板块：' + board;
    // 注入板块格式要求
    if (forumData && forumData.boardFormat && forumData.boardFormat[board]) {
      sys += '\n【板块格式要求】' + forumData.boardFormat[board];
    }
  }

  var usr = topic
    ? '请围绕这个话题发一个帖子：' + topic.slice(0,200) + '\n第一行是标题(20字内)，空行后是正文(120字内)。'
    : '请随机选一个适合当前社区和板块的话题发帖。第一行是标题(20字内)，空行后是正文(120字内)。';

  if (!isApiReady(char.id)) {
    var m = MOCK_POSTS[Math.floor(Math.random() * MOCK_POSTS.length)];
    return Promise.resolve({ title: m.t, content: m.c });
  }

  var api = getCharApi(char.id);
  return callAPI(api, sys, usr).then(function(raw) {
    if (!raw || !raw.trim()) throw new Error('API返回空内容');
    var lines = raw.split('\n').filter(function(l) { return l.trim(); });
    var title = (lines[0] || '随想').replace(/^[《「#]+|[》」]+$/g, '').trim();
    var content = lines.slice(1).join('\n').trim() || raw;
    return { title: title, content: content };
  });
}

// 生成评论
function generateComment(char, forum, postTitle, postContent, replyTo) {
  var forumData = getForums().find(function(f) { return f.id === forum; });
  var sysBase = forumData ? forumData.systemPrompt : '';
  var sys = sysBase + '\n\n你现在是论坛用户"' + char.name + '"。严格按照以下人设回帖，不要脱离角色：\n' + char.style + '\n\n重要规则：直接写评论内容，不要加用户名前缀、不要自我介绍、不要写meta描述。保持简短，像真人在论坛随手回帖。';

  var usr = '帖子标题：' + (postTitle || '') + '\n内容：' + (postContent || '').slice(0, 150);
  if (replyTo) usr += '\n你要回复的评论：' + replyTo.slice(0, 80);
  usr += '\n请写一条评论(60字内)。';

  if (!isApiReady(char.id)) {
    return Promise.resolve(MOCK_COMMENTS[Math.floor(Math.random() * MOCK_COMMENTS.length)]);
  }

  var api = getCharApi(char.id);
  return callAPI(api, sys, usr).then(function(raw) {
    if (!raw || !raw.trim()) throw new Error('API返回空内容');
    return raw.trim();
  });
}

// 拉取模型列表
function fetchModelList(url, key, type) {
  url = url.replace(/\/+$/, '');
  if (type === 'anthropic') {
    return Promise.resolve([
      'claude-sonnet-4-20250514',
      'claude-3-5-sonnet-20241022',
      'claude-3-5-haiku-20241022',
    ]);
  }
  return fetch(url + '/models', {
    headers: { 'Authorization': 'Bearer ' + key },
  }).then(function(res) {
    if (!res.ok) throw new Error('拉取失败: ' + res.status);
    return res.json();
  }).then(function(data) {
    var models = data.data || data;
    if (!Array.isArray(models)) throw new Error('格式异常');
    return models.map(function(m) { return m.id || m.name || m; }).filter(Boolean).sort();
  });
}