import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileSpreadsheet, KeyRound, ChevronLeft, ChevronRight, Plus, ChevronDown, Trash2, Rocket, Store } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  createdAt: string;
}

interface LayoutProps {
  children: React.ReactNode;
}

interface NavigationItem {
  name: string;
  path: string;
  icon: React.ElementType;
  children?: { name: string; path: string }[];
}

const navigation: NavigationItem[] = [
  {
    name: 'Context',
    path: '/',
    icon: Store
  },
  {
    name: 'SEMrush',
    path: '/semrush',
    icon: FileSpreadsheet
  },
  {
    name: 'Keywords',
    path: '/keywords',
    icon: KeyRound
  }
];

export function Layout({ children }: LayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const loadProjects = () => {
      const storedProjects = localStorage.getItem('projects');
      const currentProjectId = localStorage.getItem('currentProjectId');
      
      if (storedProjects) {
        const parsedProjects = JSON.parse(storedProjects);
        setProjects(parsedProjects);
        
        if (currentProjectId) {
          const current = parsedProjects.find((p: Project) => p.id === currentProjectId);
          setCurrentProject(current || null);
        }
      }
    };

    loadProjects();
  }, []);

  const deleteProject = (projectId: string) => {
    const updatedProjects = projects.filter(p => p.id !== projectId);
    setProjects(updatedProjects);
    localStorage.setItem('projects', JSON.stringify(updatedProjects));
    
    if (currentProject?.id === projectId) {
      setCurrentProject(null);
      localStorage.removeItem('currentProjectId');
    }
  };

  const selectProject = (project: Project) => {
    setCurrentProject(project);
    localStorage.setItem('currentProjectId', project.id);
    setShowProjectMenu(false);
  };

  const isParentActive = (item: NavigationItem) => {
    return location.pathname === item.path || 
           (item.children?.some(child => location.pathname === child.path));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-20 ${isCollapsed ? 'w-16' : 'w-64'}`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          <Link to="/" className={`flex items-center ${isCollapsed ? 'justify-center' : ''}`}>
            <span className={`text-xl font-moonwalk font-bold text-primary transition-opacity duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
              RankPanda
            </span>
          </Link>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 text-gray-400 hover:text-primary transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {navigation.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center px-4 py-2 rounded-lg transition-colors
                ${isParentActive(item) 
                  ? 'bg-secondary-lime/10 text-primary' 
                  : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                }
              `}
            >
              <item.icon className={`h-5 w-5 ${isParentActive(item) ? 'text-primary' : ''}`} />
              <span className={`ml-3 transition-opacity duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
                {item.name}
              </span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <div className={`transition-all duration-300 ${isCollapsed ? 'pl-16' : 'pl-64'}`}>
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200">
          <div className="h-full px-8 flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex items-center px-4 py-2 bg-gradient-to-r from-secondary-lime/10 to-transparent rounded-lg">
                {navigation.find(item => isParentActive(item))?.icon && (
                  <navigation.find(item => isParentActive(item))!.icon className="h-6 w-6 text-secondary-gray mr-2" />
                )}
                <h1 className="text-2xl font-moonwalk font-bold text-primary">
                  {navigation.find(item => isParentActive(item))?.name}
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4 relative">
              <div className="relative">
                <button
                  onClick={() => setShowProjectMenu(!showProjectMenu)}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  <span>{currentProject ? currentProject.name : 'Select Project'}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>

                {showProjectMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-50 border border-gray-200">
                    <div className="py-1">
                      {projects.map((project) => (
                        <div
                          key={project.id}
                          className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <button
                            onClick={() => selectProject(project)}
                            className="flex-grow text-left"
                          >
                            {project.name}
                          </button>
                          <button
                            onClick={() => deleteProject(project.id)}
                            className="p-1 text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      <div className="border-t border-gray-100">
                        <button
                          onClick={() => {
                            setShowProjectMenu(false);
                            navigate('/');
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-primary hover:bg-gray-100"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          New Project
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}