import React from 'react';
import { useLocation } from 'react-router-dom';
import { Store, KeyRound } from 'lucide-react';
import { ProjectSelector } from './ProjectSelector';

interface HeaderProps {
  pageName: string;
}

export function Header({ pageName }: HeaderProps) {
  const location = useLocation();

  const getIcon = () => {
    if (location.pathname === '/') return Store;
    if (location.pathname.includes('/keywords')) return KeyRound;
    return Store;
  };

  const Icon = getIcon();

  return (
    <header className="h-16 bg-white border-b border-gray-200">
      <div className="h-full px-8 flex items-center justify-between">
        <div className="flex items-center px-4 py-2 bg-gradient-to-r from-secondary-lime/10 to-transparent rounded-lg">
          <Icon className="h-6 w-6 text-secondary-gray mr-2" />
          <h1 className="text-2xl font-moonwalk font-bold text-primary">
            {pageName}
          </h1>
        </div>
        <ProjectSelector />
      </div>
    </header>
  );
}