import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDownIcon, TeamIcon, RocketIcon, HeadsetIcon, ShieldIcon, MenuIcon, CloseIcon } from "./Icons";
import logoImage from "@assets/SCtext_1764515624143.png";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isStaffAuthenticated: boolean;
  onAdminLogin: () => void;
}

interface DropdownItem {
  id: string;
  label: string;
  icon: JSX.Element;
  description: string;
}

const menuItems: { [key: string]: DropdownItem[] } = {
  main: [
    { id: "team", label: "The Team", icon: <TeamIcon className="w-5 h-5" />, description: "Meet our amazing team" },
  ],
  update: [
    { id: "progress", label: "Update Progress", icon: <RocketIcon className="w-5 h-5" />, description: "Check development status" },
  ],
  support: [
    { id: "discord", label: "Discord Support", icon: <HeadsetIcon className="w-5 h-5" />, description: "Join our Discord server" },
    { id: "ticket", label: "Create Ticket", icon: <TeamIcon className="w-5 h-5" />, description: "Get personalized help" },
  ],
};

function DropdownMenu({
  label,
  items,
  isOpen,
  onToggle,
  onItemClick,
}: {
  label: string;
  items: DropdownItem[];
  isOpen: boolean;
  onToggle: () => void;
  onItemClick: (id: string) => void;
}) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        if (isOpen) onToggle();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onToggle]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={onToggle}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground/90 hover:text-foreground transition-colors rounded-md hover-elevate"
        data-testid={`dropdown-${label.toLowerCase().replace(" ", "-")}`}
      >
        {label}
        <ChevronDownIcon
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-card border border-card-border rounded-lg shadow-3d overflow-hidden animate-pop-in z-50">
          <div className="p-2">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => onItemClick(item.id)}
                className="w-full flex items-start gap-3 p-3 rounded-md hover-elevate transition-all text-left group"
                data-testid={`menu-item-${item.id}`}
              >
                <div className="flex-shrink-0 p-2 rounded-md bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  {item.icon}
                </div>
                <div>
                  <div className="font-medium text-foreground">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function Navigation({ activeTab, onTabChange, isStaffAuthenticated, onAdminLogin }: NavigationProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleItemClick = (id: string) => {
    onTabChange(id);
    setOpenDropdown(null);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <img
              src={logoImage}
              alt="South Central"
              className="h-10 w-auto object-contain"
              data-testid="logo-image"
            />
          </div>

          <div className="hidden md:flex items-center gap-1">
            <button
              onClick={() => onTabChange("home")}
              className={`px-4 py-2 text-sm font-medium transition-colors rounded-md ${
                activeTab === "home"
                  ? "text-primary bg-primary/10"
                  : "text-foreground/90 hover:text-foreground hover-elevate"
              }`}
              data-testid="nav-main"
            >
              Main
            </button>
            <DropdownMenu
              label="Next Update"
              items={menuItems.update}
              isOpen={openDropdown === "update"}
              onToggle={() => setOpenDropdown(openDropdown === "update" ? null : "update")}
              onItemClick={handleItemClick}
            />
            <DropdownMenu
              label="Support"
              items={menuItems.support}
              isOpen={openDropdown === "support"}
              onToggle={() => setOpenDropdown(openDropdown === "support" ? null : "support")}
              onItemClick={handleItemClick}
            />
            {isStaffAuthenticated && (
              <button
                onClick={() => onTabChange("staff")}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors rounded-md ${
                  activeTab === "staff"
                    ? "text-primary bg-primary/10"
                    : "text-foreground/90 hover:text-foreground hover-elevate"
                }`}
                data-testid="nav-staff"
              >
                <ShieldIcon className="w-4 h-4" />
                Staff
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={onAdminLogin}
              variant="outline"
              size="sm"
              className="hidden sm:flex items-center gap-2 border-primary/30 text-primary hover:bg-primary/10 shadow-glow-blue"
              data-testid="button-admin-login"
            >
              <ShieldIcon className="w-4 h-4" />
              Admin Login
            </Button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md hover-elevate"
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <CloseIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-card border-t border-border animate-slide-down">
          <div className="px-4 py-4 space-y-2">
            <button
              onClick={() => {
                onTabChange("home");
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-md hover-elevate ${
                activeTab === "home" ? "bg-primary/10 text-primary" : ""
              }`}
              data-testid="mobile-menu-item-main"
            >
              <span className="font-medium">Main</span>
            </button>
            {Object.entries(menuItems).map(([key, items]) => {
              if (key === "main") return null;
              return (
                <div key={key} className="space-y-1">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">
                    {key === "update" ? "Next Update" : "Support"}
                  </div>
                  {items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item.id)}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-md hover-elevate"
                      data-testid={`mobile-menu-item-${item.id}`}
                    >
                      <div className="p-2 rounded-md bg-primary/10 text-primary">{item.icon}</div>
                      <span className="font-medium">{item.label}</span>
                    </button>
                  ))}
                </div>
              );
            })}
            <div className="pt-4 border-t border-border">
              <Button
                onClick={() => {
                  onAdminLogin();
                  setMobileMenuOpen(false);
                }}
                variant="outline"
                className="w-full border-primary/30 text-primary"
                data-testid="button-admin-login-mobile"
              >
                <ShieldIcon className="w-4 h-4 mr-2" />
                Admin Login
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
