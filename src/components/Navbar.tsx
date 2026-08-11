import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Menu, X } from "lucide-react";
import Button from "./Button";

export type NavLink = {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
};

export type NavbarProps = {
  logoLabel?: string;
  links?: NavLink[];
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
};

const defaultLinks: NavLink[] = [
  { label: "For Talent", href: "https://www.trafy.ai/#talent" },
  { label: "Employability Index", href: "https://www.trafy.ai/#employability" },
  { label: "Assessment", href: "/" },
  {
    label: "Cohort",
    href: "https://www.trafy.ai/cohort/",
    children: [
      { label: "AI Engineering Cohort", href: "https://www.trafy.ai/cohort/" },
      { label: "AI for Marketers Cohort", href: "https://www.trafy.ai/cohort/marketers/" },
    ],
  },
  { label: "Blog", href: "https://www.trafy.ai/blog" },
];

export default function Navbar({
  logoLabel = "Trafy",
  links = defaultLinks,
  primaryCta,
  secondaryCta,
}: NavbarProps) {
  const [open, setOpen] = useState(false);
  const suffix = logoLabel.replace(/^Trafy\s*/, "").trim();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" onClick={() => window.scrollTo(0, 0)} className="flex items-center gap-2">
          <img src="/trafy-logo-light.svg" alt="Trafy" className="h-8 w-auto" />
          {suffix && (
            <span className="font-display text-xl font-bold tracking-tight">{suffix}</span>
          )}
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {links.map((link) =>
            link.children ? (
              <div key={link.label} className="group relative">
                <button className="flex items-center gap-1 text-sm font-medium text-white/70 transition-colors hover:text-white">
                  {link.label}
                  <ChevronDown size={14} className="transition-transform duration-200 group-hover:rotate-180" />
                </button>
                <div className="invisible absolute left-0 top-full pt-3 opacity-0 transition-all duration-150 group-hover:visible group-hover:opacity-100">
                  <div className="flex w-60 flex-col gap-1 rounded-2xl border border-white/10 bg-[#14123a] p-2 shadow-lg">
                    {link.children.map((child) => (
                      <a
                        key={child.label}
                        href={child.href}
                        className="rounded-xl px-3 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white"
                      >
                        {child.label}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            ) : link.href.startsWith("/") && !link.href.startsWith("/#") ? (
              <Link
                key={link.label}
                to={link.href}
                className="text-sm font-medium text-white/70 transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-white/70 transition-colors hover:text-white"
              >
                {link.label}
              </a>
            )
          )}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {secondaryCta && (
            <Button href={secondaryCta.href} variant="outline">
              {secondaryCta.label}
            </Button>
          )}
          {primaryCta && (
            <Button href={primaryCta.href} variant="primary">
              {primaryCta.label}
            </Button>
          )}
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white lg:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/10 lg:hidden"
          >
            <div className="flex flex-col gap-4 px-6 py-6">
              {links.map((link) =>
                link.children ? (
                  <div key={link.label} className="flex flex-col gap-3">
                    <span className="text-base font-medium text-white/80">{link.label}</span>
                    <div className="flex flex-col gap-3 border-l border-white/10 pl-4">
                      {link.children.map((child) => (
                        <a
                          key={child.label}
                          href={child.href}
                          onClick={() => setOpen(false)}
                          className="text-sm font-medium text-white/60"
                        >
                          {child.label}
                        </a>
                      ))}
                    </div>
                  </div>
                ) : link.href.startsWith("/") && !link.href.startsWith("/#") ? (
                  <Link
                    key={link.label}
                    to={link.href}
                    onClick={() => setOpen(false)}
                    className="text-base font-medium text-white/80"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="text-base font-medium text-white/80"
                  >
                    {link.label}
                  </a>
                )
              )}
              {(secondaryCta || primaryCta) && (
                <div className="mt-2 flex flex-col gap-3">
                  {secondaryCta && (
                    <Button href={secondaryCta.href} variant="outline" className="w-full">
                      {secondaryCta.label}
                    </Button>
                  )}
                  {primaryCta && (
                    <Button href={primaryCta.href} variant="primary" className="w-full">
                      {primaryCta.label}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
