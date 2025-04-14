'use client';

import DarkModeToggle from './DarkModeToggle';

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between z-999 p-4 border-b-2">
      <div>Your Logo</div>
      <div className="flex items-center gap-4">
        {/* Other navigation items */}
        <DarkModeToggle />
      </div>
    </nav>
  );
}