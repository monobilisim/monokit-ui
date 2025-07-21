import { embeddedFileMap } from './embedded-imports.js';
import { handler_default, build_options, env } from './build/handler.js';

const { httpserver } = handler_default(build_options.assets ?? true);
const hostname = Bun.env.HOST || '0.0.0.0';
const port = Bun.env.PORT || 3000;
const dev = env('SERVERDEV', build_options.development ?? false);

function getMimeType(path: string): string {
  if (path.endsWith('.js')) return 'application/javascript';
  if (path.endsWith('.css')) return 'text/css';
  if (path.endsWith('.html')) return 'text/html';
  if (path.endsWith('.json')) return 'application/json';
  if (path.endsWith('.svg')) return 'image/svg+xml';
  if (path.endsWith('.png')) return 'image/png';
  if (path.endsWith('.jpg') || path.endsWith('.jpeg')) return 'image/jpeg';
  if (path.endsWith('.gif')) return 'image/gif';
  if (path.endsWith('.ico')) return 'image/x-icon';
  if (path.endsWith('.woff')) return 'font/woff';
  if (path.endsWith('.woff2')) return 'font/woff2';
  if (path.endsWith('.ttf')) return 'font/ttf';
  if (path.endsWith('.eot')) return 'application/vnd.ms-fontobject';
  if (path.endsWith('.webp')) return 'image/webp';
  if (path.endsWith('.avif')) return 'image/avif';
  return 'application/octet-stream';
}

Bun.serve({
  hostname,
  port,
  idleTimeout: 120, // 2 minutes
  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);
    let pathname = url.pathname;
    if (pathname === '/') pathname = '/index.html';

    const embeddedFile = embeddedFileMap[pathname];
    if (embeddedFile) {
      return new Response(Bun.file(embeddedFile), {
        headers: {
          'Content-Type': getMimeType(pathname),
          'Cache-Control': dev ? 'no-cache' : 'public, max-age=31536000'
        }
      });
    }

    // Origin does not pass from request if we give req directly??
    const newRequest = new Request(req.url, {
      method: req.method,
      headers: req.headers,
      body: req.body,
      redirect: 'manual'
    });

    return httpserver(newRequest);
  },
  error(error: Error): Response {
    console.error('Server error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
});

console.info(`Server running at http://${hostname}:${port}`);
console.info(`Serving ${Object.keys(embeddedFileMap).length} embedded files`);
