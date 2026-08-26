export function getAuthRedirectUrl() {
  const basePath = import.meta.env.BASE_URL;
  return basePath === "/"
    ? `${window.location.origin}/login`
    : `${window.location.origin}${basePath}`;
}

export function getAppRouteUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return import.meta.env.BASE_URL === "/"
    ? `${window.location.origin}${normalizedPath}`
    : `${window.location.origin}${import.meta.env.BASE_URL}#${normalizedPath}`;
}
