export function redirectSystemPath({
  path,
  initial,
}: { path: string; initial: boolean }) {
  console.log('[NativeIntent] Redirecting system path:', path, 'initial:', initial);
  if (initial) {
    console.log('[NativeIntent] Initial launch, redirecting to root');
    return '/';
  }
  console.log('[NativeIntent] Deep link path:', path || '/');
  return path || '/';
}
