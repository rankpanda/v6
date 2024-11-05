import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Store, KeyRound, Settings, BarChart, LogOut } from 'lucide-react';
import { authService } from '../../services/authService';
import { toast } from '../ui/Toast';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({ isCollapsed, onToggleCollapse }: SidebarProps) {
  const location = useLocation();

  const handleLogout = () => {
    try {
      authService.logout();
      toast.success('Successfully logged out');
      window.location.href = '/login';
    } catch (error) {
      toast.error('Error logging out');
    }
  };

  const isPathActive = (path: string) => location.pathname === path;
  const isTierActive = (tier: number) => location.pathname === `/keywords/tier-${tier}`;

  return (
    <div 
      className={`fixed top-0 left-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-10 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
        <Link to="/" className={`flex items-center ${isCollapsed ? 'justify-center' : ''}`}>
          {!isCollapsed && (
            <span className="text-xl font-moonwalk font-bold text-gray-900">RankPanda</span>
          )}
          {isCollapsed && <Store className="h-6 w-6 text-gray-900" />}
        </Link>
        <button
          onClick={onToggleCollapse}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-6">
        {/* Context */}
        <div>
          <Link
            to="/"
            className={`
              flex items-center px-4 py-2 rounded-lg transition-colors
              ${isCollapsed ? 'justify-center' : ''}
              ${isPathActive('/') 
                ? 'bg-secondary-lime/10 text-primary' 
                : 'text-gray-600 hover:text-primary hover:bg-gray-50'
              }
            `}
          >
            <Store className={`h-5 w-5 ${isPathActive('/') ? 'text-primary' : ''}`} />
            {!isCollapsed && <span className="ml-3">Context</span>}
          </Link>
        </div>

        {/* Keywords Section */}
        <div>
          <div className={`px-4 py-2 text-xs font-semibold text-gray-400 uppercase ${isCollapsed ? 'text-center' : ''}`}>
            {!isCollapsed && 'Keywords'}
          </div>
          {[1, 2, 3, 4, 5].map((tier) => (
            <Link
              key={tier}
              to={`/keywords/tier-${tier}`}
              className={`
                flex items-center px-4 py-2 rounded-lg transition-colors
                ${isCollapsed ? 'justify-center' : ''}
                ${isTierActive(tier) 
                  ? 'bg-secondary-lime/10 text-primary' 
                  : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                }
              `}
            >
              <KeyRound className={`h-5 w-5 ${isTierActive(tier) ? 'text-primary' : ''}`} />
              {!isCollapsed && <span className="ml-3">Tier {tier}</span>}
            </Link>
          ))}
        </div>

        {/* Settings Section */}
        <div>
          <div className={`px-4 py-2 text-xs font-semibold text-gray-400 uppercase ${isCollapsed ? 'text-center' : ''}`}>
            {!isCollapsed && 'Settings'}
          </div>
          <Link
            to="/analytics"
            className={`
              flex items-center px-4 py-2 rounded-lg transition-colors mb-2
              ${isCollapsed ? 'justify-center' : ''}
              ${isPathActive('/analytics') 
                ? 'bg-secondary-lime/10 text-primary' 
                : 'text-gray-600 hover:text-primary hover:bg-gray-50'
              }
            `}
          >
            <BarChart className={`h-5 w-5 ${isPathActive('/analytics') ? 'text-primary' : ''}`} />
            {!isCollapsed && <span className="ml-3">Analytics</span>}
          </Link>
          <Link
            to="/settings"
            className={`
              flex items-center px-4 py-2 rounded-lg transition-colors
              ${isCollapsed ? 'justify-center' : ''}
              ${isPathActive('/settings') 
                ? 'bg-secondary-lime/10 text-primary' 
                : 'text-gray-600 hover:text-primary hover:bg-gray-50'
              }
            `}
          >
            <Settings className={`h-5 w-5 ${isPathActive('/settings') ? 'text-primary' : ''}`} />
            {!isCollapsed && <span className="ml-3">Settings</span>}
          </Link>
        </div>
      </nav>

      {/* Logout Button */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className={`
            w-full flex items-center px-4 py-2 rounded-lg transition-colors
            text-red-600 hover:bg-red-50
            ${isCollapsed ? 'justify-center' : ''}
          `}
        >
          <LogOut className="h-5 w-5" />
          {!isCollapsed && <span className="ml-3">Logout</span>}
        </button>
      </div>
    </div>
  );
}