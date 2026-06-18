import type { MiddlewareHandler } from 'astro';

export const onRequest: MiddlewareHandler = async (context, next) => {
  const { pathname } = context.url;

  // Pass admin routes straight through — no i18n handling
  if (pathname.startsWith('/admin')) {
    return next();
  }

  // For the root path, redirect to /en/
  if (pathname === '/') {
    return context.redirect('/en/', 301);
  }

  // All other paths pass through normally
  return next();
};
