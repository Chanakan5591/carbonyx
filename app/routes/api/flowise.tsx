import type { Route } from './+types/flowise'
import { getAuth } from '@clerk/react-router/ssr.server';
import { data } from 'react-router'
import webJsContent from '~/assets/flowise-web?raw'
import { env } from '~/env';

// Parse chatflow ID and domains from environment variable
const getChatflowConfig = () => {
  const chatflowId = env.FLOWISE_CHATFLOW?.split(',')[0]?.trim();
  if (!chatflowId) throw new Error('Missing chatflow ID');

  const defaultDomains = process.env.NODE_ENV === 'production' ? [] : ['http://localhost:5678'];
  const configuredDomains = env.FLOWISE_CHATFLOW?.split(',').slice(1).map(d => d.trim()) || [];
  const domains = [...new Set([...defaultDomains, ...configuredDomains])];

  return { chatflowId, domains };
};

// Proxy request to Flowise API
const proxyRequest = async (request, targetUrl, auth, modifyRequest = false) => {
  const orgId = auth.orgId;
  const method = request.method;
  const headers = new Headers();

  // Copy relevant headers
  for (const [key, value] of request.headers.entries()) {
    if (!['host', 'connection', 'content-length'].includes(key.toLowerCase())) {
      headers.set(key, value);
    }
  }

  // Add authorization header
  headers.set('Authorization', `Bearer ${env.FLOWISE_API_KEY}`);

  // Prepare request body
  let body;
  if (method !== 'GET' && method !== 'HEAD') {
    if (request.headers.get('content-type')?.includes('multipart/form-data')) {
      body = await request.formData();
    } else if (request.headers.get('content-type')?.includes('application/json')) {
      try {
        const jsonBody = await request.json();
        if (modifyRequest && jsonBody.question) {
          jsonBody.question = `orgId: ${orgId}\n${jsonBody.question}`;
        }
        body = JSON.stringify(jsonBody);
        headers.set('Content-Type', 'application/json');
      } catch (error) {
        console.error('Failed to parse JSON request:', error);
        return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400 });
      }
    } else {
      body = await request.arrayBuffer();
    }
  }

  // Execute request
  try {
    const response = await fetch(targetUrl, { method, headers, body });
    const responseHeaders = new Headers(response.headers);
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('text/event-stream')) {
      // Handle streaming responses (SSE)
      return new Response(response.body, {
        status: response.status,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        }
      });
    } else if (contentType.includes('application/json') && modifyRequest) {
      // Modify JSON responses if needed
      try {
        const data = await response.json();
        if (data.botSettings?.chatSettings) {
          if (data.botSettings.chatSettings.initialMessage) {
            data.botSettings.chatSettings.initialMessage = `orgId: ${orgId}\n${data.botSettings.chatSettings.initialMessage}`;
          }
          if (data.botSettings.chatSettings.prompt) {
            data.botSettings.chatSettings.prompt = `orgId: ${orgId}\n${data.botSettings.chatSettings.prompt}`;
          }
        }
        return new Response(JSON.stringify(data), { status: response.status, headers: responseHeaders });
      } catch {
        return new Response(await response.text(), { status: response.status, headers: responseHeaders });
      }
    } else {
      // Pass through other responses
      return new Response(response.body, { status: response.status, headers: responseHeaders });
    }
  } catch (error) {
    console.error('Proxy request error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
};

export async function loader(args: Route.LoaderArgs) {
  const auth = await getAuth(args);
  const { request, params } = args;
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Check required API configuration
  const API_HOST = env.FLOWISE_API_HOST;
  const FLOWISE_API_KEY = env.FLOWISE_API_KEY;

  if (!API_HOST || !FLOWISE_API_KEY) {
    return data({ error: 'Missing API configuration' }, { status: 500 });
  }

  try {
    const { chatflowId, domains } = getChatflowConfig();

    // Serve web.js script
    if (pathname.endsWith('/web.js')) {
      const origin = request.headers.get('origin');
      if (origin && !domains.includes(origin)) {
        return new Response('Access Denied', { status: 403 });
      }

      return new Response(webJsContent, {
        headers: {
          'Content-Type': 'application/javascript',
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        }
      });
    }

    const wildcardParam = params['*'] || '';

    // Handle various API endpoints
    if (wildcardParam.includes('get-upload-file')) {
      const chatId = url.searchParams.get('chatId');
      const fileName = url.searchParams.get('fileName');
      if (!chatId || !fileName) {
        return data({ error: 'Missing parameters' }, { status: 400 });
      }

      const targetUrl = `${API_HOST}/api/v1/get-upload-file?chatflowId=${chatflowId}&chatId=${chatId}&fileName=${fileName}`;
      return proxyRequest(request, targetUrl, auth);
    } else if (wildcardParam.includes('public-chatbotConfig')) {
      const targetUrl = `${API_HOST}/api/v1/public-chatbotConfig/${chatflowId}`;
      return proxyRequest(request, targetUrl, auth, true);
    } else if (wildcardParam.includes('chatflows-streaming')) {
      const targetUrl = `${API_HOST}/api/v1/chatflows-streaming/${chatflowId}`;
      return proxyRequest(request, targetUrl, auth);
    }

    return data({ error: 'Not Found' }, { status: 404 });
  } catch (error) {
    console.error('API route error:', error);
    return data({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function action(args: Route.ActionArgs) {
  const auth = await getAuth(args);
  const { request } = args;
  const pathname = new URL(request.url).pathname;

  const API_HOST = env.FLOWISE_API_HOST;
  const FLOWISE_API_KEY = env.FLOWISE_API_KEY;

  if (!API_HOST || !FLOWISE_API_KEY) {
    return data({ error: 'Missing API configuration' }, { status: 500 });
  }

  try {
    const { chatflowId } = getChatflowConfig();

    // Handle predictions
    if (pathname.includes('/prediction')) {
      const targetUrl = `${API_HOST}/api/v1/prediction/${chatflowId}`;
      return proxyRequest(request, targetUrl, auth, true);
    }

    // Handle file uploads
    if (pathname.includes('/attachments')) {
      const chatId = pathname.split('/').filter(Boolean).pop();
      if (!chatId) {
        return data({ error: 'Missing chatId' }, { status: 400 });
      }

      const formData = await request.formData();
      const files = formData.getAll('files');
      if (!files || files.length === 0) {
        return data({ error: 'No files provided' }, { status: 400 });
      }

      const newFormData = new FormData();
      for (const file of files) {
        if (file instanceof File) {
          newFormData.append('files', file);
        }
      }

      const targetUrl = `${API_HOST}/api/v1/attachments/${chatflowId}/${chatId}`;
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${FLOWISE_API_KEY}` },
        body: newFormData
      });

      if (!response.ok) {
        return data({ error: `Proxy error: ${response.statusText}` }, { status: response.status });
      }

      return data(await response.json());
    }

    return data({ error: 'Not Found' }, { status: 404 });
  } catch (error) {
    console.error('API error:', error);
    return data({ error: 'Internal Server Error' }, { status: 500 });
  }
}
