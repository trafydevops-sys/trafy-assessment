export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-ink py-12">
      <div className="mx-auto max-w-7xl px-6 flex flex-col items-center justify-center gap-4">
        <div className="flex items-center gap-2">
          <span className="font-display font-bold tracking-tight text-white">Trafy</span>
        </div>
        <p className="text-sm text-white/50 text-center max-w-md">
          Assessments platform to evaluate technical skills accurately and securely.
        </p>
        <div className="mt-4 text-xs text-white/40">
          © {new Date().getFullYear()} Trafy. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
