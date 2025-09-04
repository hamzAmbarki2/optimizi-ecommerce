import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  Menu,
  X,
  ShoppingCart,
  User,
  LogOut,
  Moon,
  Sun,
  Heart
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { authService } from '../services/authService';
import CartSummary from './CartSummary';
import NotificationCenter from './NotificationCenter';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { state, dispatch } = useApp();
  const { isDarkMode, toggleDarkMode } = useTheme();

  const navigation = [
    { name: 'Accueil', href: '/' },
    { name: 'Commandes', href: '/orders' },
    { name: 'Catégories', href: '/categories' },
    { name: 'Produits', href: '/products' },
    { name: 'À propos', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const cartItemsCount = state.cart.reduce((total, item) => total + item.quantity, 0);
  const wishlistCount = state.wishlist.length;

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      dispatch({ type: 'LOGOUT' });
      setIsUserMenuOpen(false);
    } catch (error) {
      console.error('Erreur de déconnexion :', error);
    }
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 px-6 py-4 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 dark:bg-neutral-900/95 backdrop-blur-lg shadow-soft-lg border-b border-white/20 dark:border-neutral-700/30' 
          : 'bg-white/80 dark:bg-neutral-900/80 backdrop-blur-soft shadow-soft border-b border-white/20 dark:border-neutral-700/30'
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <div className={`flex items-center justify-center transition-all duration-300 ${
              isScrolled ? 'scale-95' : ''
            }`}>
              <img 
                src="/LogoOptimizi.svg" 
                alt="Optimizi" 
                className="h-10 w-auto"
              />
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`font-medium transition-all duration-300 relative px-4 py-2 rounded-soft ${
                  isActive(item.href)
                    ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30'
                    : 'text-neutral-700 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-3">
            {/* Mode sombre */}
            <button
              onClick={toggleDarkMode}
              className="p-2.5 text-neutral-700 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors rounded-soft hover:bg-primary-50 dark:hover:bg-primary-900/20"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Notifications */}
            <NotificationCenter />

            {/* Liste de souhaits */}
            <Link
              to="/wishlist"
              className="relative p-2.5 text-neutral-700 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors rounded-soft hover:bg-primary-50 dark:hover:bg-primary-900/20"
            >
              <Heart className="w-6 h-6" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium shadow-soft">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Panier */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 text-neutral-700 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors rounded-soft hover:bg-primary-50 dark:hover:bg-primary-900/20"
            >
              <ShoppingCart className="w-6 h-6" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center font-medium shadow-soft">
                  {cartItemsCount}
                </span>
              )}
            </button>

            {/* Menu utilisateur */}
            {state.isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-3 px-4 py-2.5 text-neutral-700 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors rounded-soft hover:bg-primary-50 dark:hover:bg-primary-900/20"
                >
                  {state.user?.imageUrl ? (
                    <img
                      src={state.user.imageUrl}
                      alt={state.user.fullName}
                      className="w-8 h-8 rounded-full object-cover shadow-soft"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-soft">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <span className="hidden sm:block font-medium">{state.user?.fullName}</span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white/95 dark:bg-neutral-800/95 backdrop-blur-soft rounded-soft-lg shadow-soft-xl border border-white/20 dark:border-neutral-700/30 py-2 z-50">
                    <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-700">
                      <p className="font-medium text-neutral-800 dark:text-neutral-200">{state.user?.fullName}</p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">{state.user?.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="block px-4 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      Profil
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="block px-4 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      Mes commandes
                    </Link>
                    <Link
                      to="/wishlist"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center justify-between px-4 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      <span>Ma liste de souhaits</span>
                      {wishlistCount > 0 && (
                        <span className="bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 text-xs px-2 py-0.5 rounded-full font-medium">
                          {wishlistCount}
                        </span>
                      )}
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Déconnexion</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/signin"
                  className="hidden sm:block px-5 py-2.5 text-primary-600 dark:text-primary-400 font-medium hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-soft transition-all duration-300"
                >
                  Connexion
                </Link>
                <Link
                  to="/signup"
                  className="px-5 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-medium rounded-soft shadow-soft hover:shadow-glow transform hover:-translate-y-0.5 transition-all duration-300"
                >
                  Inscription
                </Link>
              </>
            )}

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2.5 text-neutral-700 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors rounded-soft hover:bg-primary-50 dark:hover:bg-primary-900/20"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Menu mobile */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 dark:bg-neutral-800/95 backdrop-blur-soft shadow-soft-xl border-t border-white/20 dark:border-neutral-700/30">
            <div className="px-6 py-4 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block font-medium transition-colors py-2 px-3 rounded-soft ${
                    isActive(item.href)
                      ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30'
                      : 'text-neutral-700 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                  }`}
                >
                  {item.name}
                </Link>
              ))}

              {!state.isAuthenticated && (
                <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700 space-y-2">
                  <Link
                    to="/signin"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-2 text-primary-600 dark:text-primary-400 font-medium hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-soft transition-colors"
                  >
                    Connexion
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium rounded-soft text-center shadow-soft"
                  >
                    Inscription
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Spacer to prevent content from being hidden under fixed header */}
      <div className="h-20"></div>

      <CartSummary isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {isUserMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}
    </>
  );
}