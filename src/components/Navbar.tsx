import { Link } from "react-router-dom";
import Button from "./Button";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" onClick={() => window.scrollTo(0, 0)} className="flex items-center gap-2">
          {/* Logo can be imported or used from public */}
          <div className="flex items-center justify-center h-8 w-8 bg-green-hard rounded-lg font-bold text-white">T</div>
          <span className="font-display text-xl font-bold tracking-tight">Trafy</span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          <Link to="/" className="text-sm font-medium text-white/70 transition-colors hover:text-white">
            Assessments
          </Link>
          <Link to="/leaderboard" className="text-sm font-medium text-white/70 transition-colors hover:text-white">
            Leaderboard
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Button href="/" variant="primary">
            Start Testing
          </Button>
        </div>
      </div>
    </header>
  );
}
