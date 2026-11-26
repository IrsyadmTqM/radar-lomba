// Stroke icons used across the app (24x24 grid).
type P = { size?: number; color?: string; strokeWidth?: number; className?: string };

function make(paths: React.ReactNode, defaults: { sw?: number } = {}) {
  return function Icon({ size = 20, color = "currentColor", strokeWidth, className }: P) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth ?? defaults.sw ?? 2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
        {paths}
      </svg>
    );
  };
}

export const IconBack = make(<path d="M15 18l-6-6 6-6" />);
export const IconArrow = make(<path d="M5 12h14M13 6l6 6-6 6" />, { sw: 2.2 });
export const IconClose = make(<path d="M6 6l12 12M18 6L6 18" />, { sw: 2.2 });
export const IconCheck = make(<path d="M5 12l5 5 9-10" />, { sw: 3 });
export const IconDash = make(<path d="M6 12h12" />, { sw: 3 });
export const IconSearch = make(<><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>, { sw: 2.2 });
export const IconFilter = make(<path d="M4 6h16M7 12h10M10 18h4" />);
export const IconBell = make(<><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></>);
export const IconBookmark = make(<path d="M6 3h12v18l-6-4-6 4z" />);
export const IconTrophy = make(<><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4z" /><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3" /></>);
export const IconInbox = make(<><path d="M22 12h-6l-2 3h-4l-2-3H2" /><path d="M5.5 5h13L22 12v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6z" /></>);
export const IconTeam = make(<><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6" /></>);
export const IconUser = make(<><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>);
export const IconChat = make(<path d="M21 12a9 9 0 0 1-13.5 7.8L3 21l1.2-4.5A9 9 0 1 1 21 12z" />);
export const IconExternal = make(<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />);
export const IconSend = make(<path d="M22 2L11 13M22 2l-7 20-4-9-9-4z" />, { sw: 2.2 });
export const IconInfo = make(<><circle cx="12" cy="12" r="9" /><path d="M12 8h.01M11 12h1v5h1" /></>);
export const IconPlus = make(<path d="M12 5v14M5 12h14" />);
export const IconEye = make(<><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>);
export const IconEyeOff = make(<><path d="M10.6 5.1A10.6 10.6 0 0 1 12 5c6.5 0 10 7 10 7a17.6 17.6 0 0 1-2.4 3.3M6.6 6.6C3.8 8.4 2 12 2 12s3.5 7 10 7c1.9 0 3.6-.6 5-1.5" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2M3 3l18 18" /></>);
export const IconTrash = make(<><path d="M4 7h16M10 11v6M14 11v6" /><path d="M6 7l1 13h10l1-13M9 7V4h6v3" /></>);
export const IconBookmarkOff = make(<><path d="M6 3h12v18l-6-4-6 4z" /><path d="M9 9.5h6" /></>);
export const IconClock =make(<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>);
