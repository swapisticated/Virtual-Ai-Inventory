// Navbar.tsx
'use client';

import DarkModeToggle from './DarkModeToggle';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-[9999] p-4  bg-transparent  backdrop-blur-xs">
      <div className="flex items-center justify-between">
        <div>Your Logo</div>
        <div className="flex items-center gap-4">
          {/* Other navigation items */}
          <DarkModeToggle />
        </div>
      </div>
    </nav>
  );
}
