interface RedirectSystemPathOptions {
  path: string;
  initial: boolean;
}

/** Preserves valid app deep links on both cold and warm launches. */
export function redirectSystemPath({ path }: RedirectSystemPathOptions): string {
  if (!path) return '/';
  if (path.startsWith('/')) return path;

  try {
    const url = new URL(path);
    const appPath = `${url.pathname}${url.search}${url.hash}`;
    return appPath.startsWith('/') ? appPath : `/${appPath}`;
  } catch {
    return `/${path.replace(/^\/+/, '')}`;
  }
}
