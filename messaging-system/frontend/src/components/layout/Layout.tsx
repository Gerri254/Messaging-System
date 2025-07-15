import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
  return (
    <div className="min-h-screen bg-gradient-dashboard relative overflow-hidden">
      {/* Floating background elements */}
      <div className="absolute inset-0 bg-organic-shapes floating-elements"></div>
      <div className="absolute inset-0 bg-animated-dots opacity-30"></div>
      
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content - with left margin to account for fixed sidebar */}
      <div className="md:ml-64 flex flex-col min-h-screen relative z-10">
        {/* Header */}
        <Header />
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;