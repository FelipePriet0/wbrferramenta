'use client';

import Image from 'next/image';
import Link from 'next/link';

export const Logo = () => {
  return (
    <Link
      href="/kanban"
      className="relative z-20 flex items-center rounded-lg px-2 py-1 text-sm font-normal transition-colors hover:bg-white/20"
    >
      <Image
        src="/wbr-logo.png"
        alt="WBR"
        width={32}
        height={32}
        priority
        className="flex-shrink-0 object-contain"
      />
    </Link>
  );
};

export const LogoIcon = () => {
  return (
    <Link
      href="/kanban"
      className="relative z-20 flex items-center rounded-lg px-2 py-1 text-sm font-normal transition-colors hover:bg-white/20"
    >
      <Image
        src="/wbr-logo.png"
        alt="WBR"
        width={32}
        height={32}
        priority
        className="flex-shrink-0 object-contain"
      />
    </Link>
  );
};
