// Minimal shell for unauthenticated routes (login).
// No sidebar, no header — just the page chrome.
export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
