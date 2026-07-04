import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X, CalendarDays } from "lucide-react";

function Navbar() {
  const [open, setOpen] = useState(false);

  const navItems = [
    { name: "Home", path: "/dashboard" },
    { name: "Events", path: "/events" },
    { name: "Wishlist", path: "/wishlist" },
    { name: "My Bookings", path: "/my-bookings" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/5 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="h-20 flex items-center justify-between">

          {/* Logo */}
          <Link
            to="/dashboard"
            className="flex items-center gap-3"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-500 flex items-center justify-center">
              <CalendarDays className="text-white w-5 h-5" />
            </div>

            <div>
              <h1 className="text-xl font-bold text-white">
                EventSphere
              </h1>

              <p className="text-xs text-gray-400">
                Premium Events
              </p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `px-5 py-2 rounded-xl transition-all duration-300 ${
                    isActive
                      ? "bg-gradient-to-r from-violet-600 to-cyan-500 text-white"
                      : "text-gray-300 hover:bg-white/10"
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* Mobile Button */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center text-white"
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden border-t border-white/10 bg-[#0F172A]">
          <div className="px-4 py-5 space-y-3">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `block px-4 py-3 rounded-xl ${
                    isActive
                      ? "bg-gradient-to-r from-violet-600 to-cyan-500 text-white"
                      : "bg-white/5 text-gray-300"
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;