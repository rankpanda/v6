import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useLocation } from 'react-router-dom';

const getPageName = (pathname: string): string => {
  if (pathname === '/') return 'Context';
  if (pathname.includes('tier-')) {
    const tier = pathname.split('tier-')[1];
    return `Tier ${tier}`;
  }
  return 'Context';
};

export function Layout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const pageName = getPageName(location.pathname);

  return (
    <div className="min-h-screen bg-base">
      <Sidebar 
        isCollapsed={isCollapsed} 
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)} 
      />
      
      <div className={`transition-all duration-300 ${isCollapsed ? 'pl-16' : 'pl-64'}`}>
        <Header pageName={pageName} />
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}