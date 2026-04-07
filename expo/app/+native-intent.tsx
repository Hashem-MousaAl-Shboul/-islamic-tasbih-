export function redirectSystemPath({
  path,
  initial,
}: { path: string; initial: boolean }) {
  console.log('[NativeIntent] Redirecting system path:', path, 'initial:', initial);
  if (initial) {
    return '/';
  }
  return path || '/';
}
