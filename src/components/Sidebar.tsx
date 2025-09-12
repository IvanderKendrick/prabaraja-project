import { LayoutDashboard, FileText, Wallet, ShoppingBag, ShoppingCart, MessageSquare, Users, Package, Database, Settings, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrentUserProfile } from "@/hooks/useProfiles";
import { useState, useRef, useEffect } from "react";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive?: boolean;
}

const NavItem = ({ icon, label, href, isActive }: NavItemProps) => (
  <Link
    to={href}
    className={`flex items-center gap-3 px-4 py-1.5 hover:bg-sidebar-accent hover:text-sidebar-accentForeground transition-colors duration-200 mx-2 rounded-[20px] ${isActive ? "bg-sidebar-active/20 p-[10px] text-sidebar-active" : ""}`}
  >
    {icon}
    <span className="text-sm font-medium">{label}</span>
  </Link>
);

interface SubMenuProps {
  isOpen: boolean;
  children: React.ReactNode;
}

const SubMenu = ({ isOpen, children }: SubMenuProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | undefined>(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(isOpen ? contentRef.current.scrollHeight : 0);
    }
  }, [isOpen, children]);

  return (
    <div className={`overflow-hidden transition-all duration-300 ease-in-out`} style={{ height: height ? `${height + 10}px` : "0px" }}>
      <div ref={contentRef} className={`mt-1 space-y-1 ${isOpen ? "opacity-100" : "opacity-0"} transition-opacity duration-300`}>
        {children}
      </div>
    </div>
  );
};

export const Sidebar = () => {
  const currentPath = window.location.pathname;
  const { signOut, user } = useAuth();
  const { data: profile, isLoading: profileLoading, error: profileError } = useCurrentUserProfile();
  const [isSalesOpen, setIsSalesOpen] = useState(currentPath.startsWith("/sales"));
  const [isPurchasesOpen, setIsPurchasesOpen] = useState(currentPath.startsWith("/purchases"));
  const [isAssetsOpen, setIsAssetsOpen] = useState(currentPath.startsWith("/assets"));

  const handleLogout = async () => {
    await signOut();
  };

  const navItems = [
    {
      icon: <LayoutDashboard size={20} />,
      label: "Dashboard",
      href: "/dashboard",
    },
    { icon: <FileText size={20} />, label: "Reports", href: "/reports" },
    {
      icon: <Database size={20} />,
      label: "Chart of Accounts",
      href: "/master-data",
    },
    { icon: <Wallet size={20} />, label: "Cash & Bank", href: "/cash-bank" },
    // Sales handled separately with submenu
    { icon: <ShoppingBag size={20} />, label: "Sales", href: "/sales" },
    {
      icon: <ShoppingCart size={20} />,
      label: "Purchases",
      href: "/purchases",
    },
    { icon: <MessageSquare size={20} />, label: "Expenses", href: "/expenses" },
    { icon: <Users size={20} />, label: "Contacts", href: "/contacts" },
    { icon: <Package size={20} />, label: "Products", href: "/products" },
    { icon: <Database size={20} />, label: "Assets", href: "/assets" },
    { icon: <Settings size={20} />, label: "Settings", href: "/settings" },
  ];

  return (
    <div className="w-56 h-screen bg-sidebar-bg flex flex-col sticky left-0 top-0 overflow-auto hide-scrollbar">
      {/* User info section */}
      {user && (
        <div className="p-4">
          {profileLoading ? (
            <div className="flex items-center justify-center p-2">
              <div className="animate-pulse bg-sidebar-hover rounded h-12 w-24"></div>
            </div>
          ) : profile?.company_logo ? (
            <div className="flex items-center justify-center p-2">
              <img
                src={profile.company_logo}
                alt="Company Logo"
                className="max-h-12 max-w-full object-contain"
                onError={(e) => {
                  console.error("Failed to load company logo:", profile.company_logo);
                  console.error("Profile data:", profile);
                  e.currentTarget.style.display = "none";
                }}
                onLoad={() => {
                  console.log("Company logo loaded successfully:", profile.company_logo);
                }}
              />
            </div>
          ) : (
            <>
              <div className="text-sm text-sidebar-text">Welcome back!</div>
              <div className="text-sm font-medium text-sidebar-text truncate">{profile?.name || user.user_metadata?.name || user.email}</div>
              {profileError && <div className="text-xs text-red-500 mt-1">Profile error: {profileError.message}</div>}
            </>
          )}
        </div>
      )}

      <div className="flex-1 py-4 space-y-1">
        {/* Standard items before Sales */}
        {navItems.slice(0, 4).map((item) => (
          <NavItem key={item.href} icon={item.icon} label={item.label} href={item.href} isActive={currentPath === item.href} />
        ))}

        {/* Sales with collapsible submenu */}
        <button
          type="button"
          onClick={() => setIsSalesOpen((v) => !v)}
          className={`w-[calc(100%-1rem)] mx-2 flex items-center justify-between gap-3 px-4 py-1.5 rounded-[20px] transition-colors duration-200 ${
            currentPath.startsWith("/sales") ? "bg-sidebar-active/20 text-sidebar-active" : "hover:bg-sidebar-accent hover:text-sidebar-accentForeground"
          }`}
        >
          <span className="flex items-center gap-3">
            <ShoppingBag size={20} />
            <span className="text-sm font-medium">Sales</span>
          </span>
          <span className={`transform transition-transform duration-300 text-xs ${isSalesOpen ? "rotate-180" : ""}`}>▾</span>
        </button>
        <SubMenu isOpen={isSalesOpen}>
          <Link
            to="/sales/delivery"
            className={`block mx-4 rounded-[14px] px-4 py-1.5 text-sm transition-colors duration-200 ${
              currentPath.startsWith("/sales/delivery") ? "bg-sidebar-active/20 text-sidebar-active" : "hover:bg-sidebar-accent hover:text-sidebar-accentForeground"
            }`}
          >
            Sales Invoices
          </Link>
          <Link
            to="/sales/order"
            className={`block mx-4 rounded-[14px] px-4 py-1.5 text-sm transition-colors duration-200 ${
              currentPath.startsWith("/sales/order") ? "bg-sidebar-active/20 text-sidebar-active" : "hover:bg-sidebar-accent hover:text-sidebar-accentForeground"
            }`}
          >
            Order & Delivery
          </Link>
          <Link
            to="/sales/quotation"
            className={`block mx-4 rounded-[14px] px-4 py-1.5 text-sm transition-colors duration-200 ${
              currentPath.startsWith("/sales/quotation") ? "bg-sidebar-active/20 text-sidebar-active" : "hover:bg-sidebar-accent hover:text-sidebar-accentForeground"
            }`}
          >
            Quotation
          </Link>
        </SubMenu>

        {/* Remaining items after Sales */}
        {/* Purchases with collapsible submenu */}
        <button
          type="button"
          onClick={() => setIsPurchasesOpen((v) => !v)}
          className={`w-[calc(100%-1rem)] mx-2 flex items-center justify-between gap-3 px-4 py-1.5 rounded-[20px] transition-colors duration-200 ${
            currentPath.startsWith("/purchases") ? "bg-sidebar-active/20 text-sidebar-active" : "hover:bg-sidebar-accent hover:text-sidebar-accentForeground"
          }`}
        >
          <span className="flex items-center gap-3">
            <ShoppingCart size={20} />
            <span className="text-sm font-medium">Purchases</span>
          </span>
          <span className={`transform transition-transform duration-300 text-xs ${isPurchasesOpen ? "rotate-180" : ""}`}>▾</span>
        </button>
        <SubMenu isOpen={isPurchasesOpen}>
          <Link
            to="/purchases/quotations"
            className={`block mx-4 rounded-[14px] px-4 py-1.5 text-sm transition-colors duration-200 ${
              currentPath.startsWith("/purchases/quotations") ? "bg-sidebar-active/20 text-sidebar-active" : "hover:bg-sidebar-accent hover:text-sidebar-accentForeground"
            }`}
          >
            Quotation
          </Link>
          <Link
            to="/purchases/offers"
            className={`block mx-4 rounded-[14px] px-4 py-1.5 text-sm transition-colors duration-200 ${
              currentPath.startsWith("/purchases/offers") ? "bg-sidebar-active/20 text-sidebar-active" : "hover:bg-sidebar-accent hover:text-sidebar-accentForeground"
            }`}
          >
            Offers
          </Link>
          <Link
            to="/purchases/requests"
            className={`block mx-4 rounded-[14px] px-4 py-1.5 text-sm transition-colors duration-200 ${
              currentPath.startsWith("/purchases/requests") ? "bg-sidebar-active/20 text-sidebar-active" : "hover:bg-sidebar-accent hover:text-sidebar-accentForeground"
            }`}
          >
            Requests
          </Link>
          <Link
            to="/purchases/orders"
            className={`block mx-4 rounded-[14px] px-4 py-1.5 text-sm transition-colors duration-200 ${
              currentPath.startsWith("/purchases/orders") ? "bg-sidebar-active/20 text-sidebar-active" : "hover:bg-sidebar-accent hover:text-sidebar-accentForeground"
            }`}
          >
            Orders
          </Link>
          <Link
            to="/purchases/shipments"
            className={`block mx-4 rounded-[14px] px-4 py-1.5 text-sm transition-colors duration-200 ${
              currentPath.startsWith("/purchases/shipments") ? "bg-sidebar-active/20 text-sidebar-active" : "hover:bg-sidebar-accent hover:text-sidebar-accentForeground"
            }`}
          >
            Shipments
          </Link>
          <Link
            to="/purchases/invoices"
            className={`block mx-4 rounded-[14px] px-4 py-1.5 text-sm transition-colors duration-200 ${
              currentPath.startsWith("/purchases/invoices") ? "bg-sidebar-active/20 text-sidebar-active" : "hover:bg-sidebar-accent hover:text-sidebar-accentForeground"
            }`}
          >
            Invoices
          </Link>
          <Link
            to="/purchases/approval"
            className={`block mx-4 rounded-[14px] px-4 py-1.5 text-sm transition-colors duration-200 ${
              currentPath.startsWith("/purchases/approval") ? "bg-sidebar-active/20 text-sidebar-active" : "hover:bg-sidebar-accent hover:text-sidebar-accentForeground"
            }`}
          >
            Approval
          </Link>
        </SubMenu>

        {navItems.slice(6, 9).map((item) => (
          <NavItem key={item.href} icon={item.icon} label={item.label} href={item.href} isActive={currentPath === item.href} />
        ))}

        {/* Assets with collapsible submenu */}
        <button
          type="button"
          onClick={() => setIsAssetsOpen((v) => !v)}
          className={`w-[calc(100%-1rem)] mx-2 flex items-center justify-between gap-3 px-4 py-1.5 rounded-[20px] transition-colors duration-200 ${
            currentPath.startsWith("/assets") ? "bg-sidebar-active/20 text-sidebar-active" : "hover:bg-sidebar-accent hover:text-sidebar-accentForeground"
          }`}
        >
          <span className="flex items-center gap-3">
            <Database size={20} />
            <span className="text-sm font-medium">Assets</span>
          </span>
          <span className={`transform transition-transform duration-300 text-xs ${isAssetsOpen ? "rotate-180" : ""}`}>▾</span>
        </button>
        <SubMenu isOpen={isAssetsOpen}>
          <Link
            to="/assets/current"
            className={`block mx-4 rounded-[14px] px-4 py-1.5 text-sm transition-colors duration-200 ${
              currentPath.startsWith("/assets/current") ? "bg-sidebar-active/20 text-sidebar-active" : "hover:bg-sidebar-accent hover:text-sidebar-accentForeground"
            }`}
          >
            Current Assets
          </Link>
          <Link
            to="/assets/sold"
            className={`block mx-4 rounded-[14px] px-4 py-1.5 text-sm transition-colors duration-200 ${
              currentPath.startsWith("/assets/sold") ? "bg-sidebar-active/20 text-sidebar-active" : "hover:bg-sidebar-accent hover:text-sidebar-accentForeground"
            }`}
          >
            Sold Assets
          </Link>
        </SubMenu>

        {navItems.slice(10).map((item) => (
          <NavItem key={item.href} icon={item.icon} label={item.label} href={item.href} isActive={currentPath === item.href} />
        ))}
      </div>

      {/* Logout Button */}
      <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-sidebar-text hover:bg-sidebar-accent hover:text-sidebar-accentForeground transition-colors duration-200 mx-2 rounded-[20px] mb-4">
        <LogOut size={20} className="text-red-500" />
        <span className="text-sm font-medium">Logout</span>
      </button>
    </div>
  );
};
