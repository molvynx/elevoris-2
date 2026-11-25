export function getSiteURL() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.FIGMA_PUBLIC_URL ||
    'https://www.elevoris.com'
  ).replace(/\/+$/, '')
}
