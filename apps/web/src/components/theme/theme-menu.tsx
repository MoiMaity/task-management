'use client';

import { Check, Monitor, Moon, Palette, Settings, Sun } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ACCENTS, ACCENT_LABELS, THEMES, type Accent, type Theme } from '@/lib/theme';
import { useTheme } from './theme-provider';

const THEME_LABELS: Record<Theme, string> = {
  light: 'Light',
  dark: 'Dark',
};

const THEME_ICONS: Record<Theme, typeof Sun> = {
  light: Sun,
  dark: Moon,
};

/**
 * Swatch for the Color Mode list.
 *
 * Reads the same CSS variable the accent itself sets, so a swatch can never
 * disagree with what the theme actually applies — there is no second copy of
 * the palette in JavaScript to keep in sync.
 */
function AccentSwatch({ accent }: { accent: Accent }) {
  return (
    <span
      data-accent={accent}
      aria-hidden
      className="size-3 shrink-0 rounded-[3px] bg-primary"
    />
  );
}

interface ThemeMenuProps {
  /** Rendered as the dropdown trigger — usually the workspace/user button. */
  children: React.ReactNode;
  onOpenSettings?: () => void;
}

export function ThemeMenu({ children, onOpenSettings }: ThemeMenuProps) {
  const { theme, accent, setTheme, setAccent, mounted } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Monitor className="mr-2 size-4" />
            Change Theme
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent className="w-40">
              <DropdownMenuLabel className="text-muted-foreground text-xs font-normal">
                Theme
              </DropdownMenuLabel>
              {THEMES.map((value) => {
                const Icon = THEME_ICONS[value];
                return (
                  <DropdownMenuItem key={value} onSelect={() => setTheme(value)}>
                    <Icon className="mr-2 size-4" />
                    {THEME_LABELS[value]}
                    {/* mounted gates the tick so the server render, which
                        cannot know the stored value, matches the client. */}
                    {mounted && theme === value && <Check className="ml-auto size-4" />}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Palette className="mr-2 size-4" />
            Color Mode
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent className="w-40">
              <DropdownMenuLabel className="text-muted-foreground text-xs font-normal">
                Color Mode
              </DropdownMenuLabel>
              {ACCENTS.map((value) => (
                <DropdownMenuItem key={value} onSelect={() => setAccent(value)}>
                  <AccentSwatch accent={value} />
                  <span className="ml-2">{ACCENT_LABELS[value]}</span>
                  {mounted && accent === value && <Check className="ml-auto size-4" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        <DropdownMenuItem onSelect={() => onOpenSettings?.()}>
          <Settings className="mr-2 size-4" />
          Settings
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
