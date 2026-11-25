import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';
import { Compass, Plus, LogOut, User, Menu, X } from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-sand-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-forest-800 text-white flex items-center justify-center shadow-md group-hover:bg-forest-900 transition">
              <Compass className="w-5 h-5 text-sand-200 group-hover:rotate-45 transition-transform duration-300" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-forest-900 font-serif">TripMate</span>
              <span className="hidden sm:inline-block ml-2 text-xs text-sage-600 font-medium">Travel Planner</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className={`text-sm font-semibold transition ${
                    isActive('/dashboard')
                      ? 'text-forest-800 border-b-2 border-forest-800 pb-0.5'
                      : 'text-charcoal-600 hover:text-forest-800'
                  }`}
                >
                  My Trips
                </Link>

                <Button
                  onClick={() => navigate('/trips/new')}
                  size="sm"
                  icon={Plus}
                >
                  Create Trip
                </Button>

                {/* User Info & Logout */}
                <div className="flex items-center gap-3 pl-4 border-l border-sand-300">
                  <div className="flex items-center gap-2">
                    {user?.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover border border-sand-300"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-forest-100 text-forest-800 flex items-center justify-center font-bold text-xs">
                        {user?.name?.charAt(0) || 'U'}
                      </div>
                    )}
                    <span className="text-xs font-semibold text-charcoal-800 hidden lg:inline-block">
                      {user?.name}
                    </span>
                  </div>

                  <button
                    onClick={handleLogout}
                    title="Log out"
                    className="p-1.5 text-charcoal-400 hover:text-red-600 hover:bg-sand-100 rounded-lg transition"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-charcoal-700 hover:text-forest-800 px-3 py-1.5 rounded-lg hover:bg-sand-100 transition"
                >
                  Log in
                </Link>
                <Button onClick={() => navigate('/register')} size="sm">
                  Get Started
                </Button>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-charcoal-600 hover:text-forest-800 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-sand-200 bg-white px-4 pt-3 pb-6 space-y-3">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-3 py-2 border-b border-sand-200">
                <div className="w-10 h-10 rounded-full bg-forest-100 text-forest-800 flex items-center justify-center font-bold text-sm">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <div className="text-sm font-bold text-forest-900">{user?.name}</div>
                  <div className="text-xs text-charcoal-500">{user?.email}</div>
                </div>
              </div>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-semibold text-charcoal-800 hover:text-forest-800"
              >
                My Trips
              </Link>
              <Link
                to="/trips/new"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-semibold text-forest-800"
              >
                + Create New Trip
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-2 py-2 text-sm font-semibold text-red-600 w-full text-left"
              >
                <LogOut className="w-4 h-4" /> Log out
              </button>
            </>
          ) : (
            <div className="space-y-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full py-2 text-center text-sm font-semibold text-charcoal-800 border border-sand-300 rounded-lg"
              >
                Log in
              </Link>
              <Button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/register');
                }}
                className="w-full"
              >
                Get Started
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
