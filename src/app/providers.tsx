'use client';

import { Theme } from '@astryxdesign/core';
import { sarafuTheme } from '@/theme/sarafu-theme';

export function Providers({ children }: { children: React.ReactNode }) {
  return <Theme theme={sarafuTheme}>{children}</Theme>;
}
