import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  FileText, 
  BarChart3, 
  Settings,
  Zap
} from 'lucide-react';
import { cn } from '../../utils/cn';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Contacts', href: '/contacts', icon: Users },
  { name: 'Messages', href: '/messages', icon: MessageSquare },
  { name: 'Templates', href: '/templates', icon: FileText },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const Sidebar = () => {
  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-20">
      <div className="flex flex-col flex-grow pt-5 glass-effect backdrop-blur-xl border-r border-white/20 overflow-y-auto">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0 px-4">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div className="ml-3">
              <h1 className="text-xl font-bold text-white">MessageHub</h1>
              <p className="text-xs text-white/80">SMS Platform</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex-grow flex flex-col">
          <nav className="flex-1 px-2 pb-4 space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200',
                    isActive
                      ? 'bg-white/20 border-r-2 border-white text-white'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon
                      className={cn(
                        'mr-3 flex-shrink-0 h-5 w-5 transition-colors duration-200',
                        isActive ? 'text-white' : 'text-white/60 group-hover:text-white/80'
                      )}
                    />
                    {item.name}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Bottom section */}
        <div className="flex-shrink-0 flex border-t border-white/20 p-4">
          <div className="glass-card rounded-lg p-3 w-full">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-white">💬</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-800">Pro Plan</p>
                <p className="text-xs text-gray-600">Unlimited messages</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;