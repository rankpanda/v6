import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Store, KeyRound, Layers } from 'lucide-react';

interface NavigationItem {
  name: string;
  path: string;
  icon: React.ElementType;
}

interface NavigationProps {
  isCollapsed: boolean;
}

export function Navigation({ isCollapsed }: NavigationProps) {
  const location = useLocation();

  const navigation: NavigationItem[] = [
    {
      name: 'Context',
      path: '/',
      icon: Store
    },
    {
      name: 'Keywords',
      path: '/keywords',
      icon: KeyRound
    },
    {
      name: 'Clusters',
      path: '/clusters',
      icon: Layers
    }
  ];

  return (
    <nav className="p-4 space-y-2">
      {navigation.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          title={isCollapsed ? item.name : undefined}
          className={`
            flex items-center px-4 py-2 rounded-lg transition-colors
            ${isCollapsed ? 'justify-center' : ''}
            ${location.pathname === item.path
              ? 'bg-secondary-lime/10 text-primary'
              : 'text-gray-600 hover:text-primary hover:bg-gray-50'
            }
          `}
        >
          <item.icon className={`h-5 w-5 ${location.pathname === item.path ? 'text-primary' : ''}`} />
          {!isCollapsed && <span className="ml-3">{item.name}</span>}
        </Link>
      ))}
    </nav>
  );
}