// CF Pages Function - API Proxy
// 路由: POST /api

var DEFAULT_API_URL = 'https://zenmux.ai/api/v1/chat/completions';
var DEFAULT_API_KEY = 'sk-ai-v1-e4f0279761930b6e1d126b59456f0e416bbce3184e495f22250d23c02a1d8fa9';
var DEFAULT_MODEL = 'anthropic/claude-sonnet-4.5';

export async function onRequest(context) {
  var request = context.request;
  
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Max-Age': '86400'
      }
    });
  }

  var corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*'
  };

  try {
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ok: true, mode: 'shardbb-pages-proxy'}), {
        headers: Object.assign({'Content-Type': 'application/json'}, corsHeaders)
      });
    }

    var body = await request.json();
    var targetUrl = request.headers.get('X-Target-URL');
    var apiKey;

    if (targetUrl) {
      apiKey = request.headers.get('Authorization') || '';
      if (targetUrl.indexOf('/chat/completions') < 0) {
        if (!/\/v1\/?$/.test(targetUrl)) targetUrl += '/v1';
        targetUrl += '/chat/completions';
      }
    } else {
      targetUrl = DEFAULT_API_URL;
      apiKey = 'Bearer ' + DEFAULT_API_KEY;
      if (!body.model) body.model = DEFAULT_MODEL;
    }

    var fetchHeaders = { 'Content-Type': 'application/json' };
    if (apiKey) fetchHeaders['Authorization'] = apiKey;

    var resp = await fetch(targetUrl, {
      method: 'POST',
      headers: fetchHeaders,
      body: JSON.stringify(body)
    });

    var respBody = await resp.text();
    return new Response(respBody, {
      status: resp.status,
      headers: Object.assign({
        'Content-Type': resp.headers.get('Content-Type') || 'application/json'
      }, corsHeaders)
    });

  } catch (e) {
    return new Response(JSON.stringify({error: e.message}), {
      status: 500,
      headers: Object.assign({'Content-Type': 'application/json'}, corsHeaders)
    });
  }
}
