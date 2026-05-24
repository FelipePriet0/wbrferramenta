'use client';

export default function RouteBg({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="route-bg min-h-dvh">{children}</div>;
}
