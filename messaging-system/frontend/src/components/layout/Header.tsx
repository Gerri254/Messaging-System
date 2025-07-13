import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  Search, 
  User, 
  LogOut, 
  Settings,
  Menu,
  X
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import Button from '../ui/Button';
import { cn } from '../../utils/cn';

const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 flex-shrink-0">
      <div className="max-w-7xl mx-auto">
        <div className="relative flex justify-between xl:grid xl:grid-cols-12 lg:gap-8">
          <div className="flex md:absolute md:left-0 md:inset-y-0 lg:static xl:col-span-2">
            <div className="flex-shrink-0 flex items-center">
              {/* Mobile menu button */}
              <button
                type="button"
                className="md:hidden -ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                <span className="sr-only">Open sidebar</span>
                {showMobileMenu ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          <div className="min-w-0 flex-1 md:px-8 lg:px-0 xl:col-span-6">
            <div className="flex items-center px-6 py-4 md:max-w-3xl md:mx-auto lg:max-w-none lg:mx-0 xl:px-0">
              <div className="w-full">
                <label htmlFor="search" className="sr-only">
                  Search
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="search"
                    name="search"
                    className="block w-full bg-white border border-gray-300 rounded-md py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:outline-none focus:text-gray-900 focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="Search contacts, messages..."
                    type="search"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center md:absolute md:right-0 md:inset-y-0 lg:hidden xl:col-span-4">
            {/* Profile dropdown */}
            <div className="flex items-center">
              {/* Notifications */}
              <button
                type="button"
                className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <span className="sr-only">View notifications</span>
                <Bell className="h-6 w-6" />
              </button>

              {/* Profile menu */}
              <div className="ml-3 relative">
                <div>
                  <button
                    type="button"
                    className="bg-white rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary-600 to-primary-700 flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                      </span>
                    </div>
                  </button>
                </div>

                {/* Profile menu dropdown */}
                {showProfileMenu && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="py-1">
                      <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                        <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                        <p className="text-gray-500">{user?.email}</p>
                      </div>
                      
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          navigate('/settings');
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <Settings className="mr-3 h-4 w-4" />
                        Settings
                      </button>
                      
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          handleLogout();
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <LogOut className="mr-3 h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="hidden lg:flex lg:items-center lg:justify-end xl:col-span-4">
            {/* Notifications */}
            <button
              type="button"
              className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <span className="sr-only">View notifications</span>
              <Bell className="h-6 w-6" />
            </button>

            {/* Profile section */}
            <div className="flex items-center ml-4 pr-4">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary-600 to-primary-700 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </div>
                <div className="text-sm text-gray-500">{user?.email}</div>
              </div>
              
              {/* Profile menu */}
              <div className="ml-3 relative">
                <button
                  type="button"
                  className="bg-white rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                >
                  <span className="sr-only">Open user menu</span>
                  <User className="h-5 w-5 text-gray-400" />
                </button>

                {/* Profile menu dropdown */}
                {showProfileMenu && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          navigate('/settings');
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <Settings className="mr-3 h-4 w-4" />
                        Settings
                      </button>
                      
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          handleLogout();
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <LogOut className="mr-3 h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;