import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function Navigation() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/add-system", label: "Add System" },
    { href: "/view-all", label: "View All" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return location === href;
    return location.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-gradient-to-r from-gradient-blue via-gradient-indigo to-gradient-purple shadow-md">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-xl group-hover:bg-white/30 transition-all duration-200">
              QR
            </div>
            <span className="font-bold text-lg md:text-xl text-white hidden sm:block">
              College Inventory
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group relative"
                data-testid={`link-nav-${link.label.toLowerCase().replace(" ", "-")}`}
              >
                <span className="text-white/90 hover:text-white font-medium transition-colors duration-200">
                  {link.label}
                </span>
                {isActive(link.href) && (
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-white rounded-full" />
                )}
              </Link>
            ))}
          </nav>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-white hover:bg-white/20"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/20 bg-gradient-to-r from-gradient-blue via-gradient-indigo to-gradient-purple">
          <nav className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                data-testid={`link-mobile-${link.label.toLowerCase().replace(" ", "-")}`}
              >
                <div
                  className={`px-4 py-2 rounded-lg text-white font-medium transition-all duration-200 ${
                    isActive(link.href)
                      ? "bg-white/20"
                      : "hover:bg-white/10"
                  }`}
                >
                  {link.label}
                </div>
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
