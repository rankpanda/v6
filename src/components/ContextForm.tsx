import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { MetaSection } from './MetaSection';
import { toast } from './ui/Toast';

const LANGUAGES = [
  { code: 'pt-PT', name: 'Portuguese (Portugal)' },
  { code: 'en-US', name: 'English (United States)' },
  { code: 'en-GB', name: 'English (United Kingdom)' },
  { code: 'es-ES', name: 'Spanish (Spain)' },
  { code: 'fr-FR', name: 'French (France)' },
  { code: 'de-DE', name: 'German (Germany)' },
  { code: 'it-IT', name: 'Italian (Italy)' },
  { code: 'nl-NL', name: 'Dutch (Netherlands)' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)' },
  { code: 'es-MX', name: 'Spanish (Mexico)' },
  { code: 'fr-CA', name: 'French (Canada)' },
  { code: 'de-AT', name: 'German (Austria)' },
  { code: 'es-AR', name: 'Spanish (Argentina)' },
  { code: 'fr-BE', name: 'French (Belgium)' },
  { code: 'it-CH', name: 'Italian (Switzerland)' }
];

interface FormData {
  projectName: string;
  brandName: string;
  category: string;
  currentSessions: number;
  currentResult: number;
  quantitativeGoal: number;
  conversionRate: number;
  averageOrderValue: number;
  language: string;
  businessContext: string;
}

export function ContextForm() {
  const [formData, setFormData] = useState<FormData>({
    projectName: '',
    brandName: '',
    category: '',
    currentSessions: 0,
    currentResult: 0,
    quantitativeGoal: 0,
    conversionRate: 0,
    averageOrderValue: 0,
    language: 'pt-PT',
    businessContext: ''
  });

  useEffect(() => {
    // Load existing project data if available
    const projectId = localStorage.getItem('currentProjectId');
    if (projectId) {
      const projects = JSON.parse(localStorage.getItem('projects') || '[]');
      const project = projects.find((p: any) => p.id === projectId);
      if (project?.context) {
        setFormData(project.context);
      }
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('Goal') || name.includes('Sessions') || name.includes('Result') || 
              name.includes('Rate') || name.includes('Value') ? 
              parseFloat(value) || 0 : value
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!formData.projectName.trim()) {
        toast.error('Please enter a project name');
        return;
      }

      // Create new project with context data
      const projectId = crypto.randomUUID();
      const newProject = {
        id: projectId,
        name: formData.projectName,
        createdAt: new Date().toISOString(),
        context: {
          ...formData,
          createdAt: new Date().toISOString()
        },
        data: {
          tier1Keywords: [],
          tier2Keywords: [],
          tier3Keywords: [],
          tier4Keywords: [],
          tier5Keywords: []
        }
      };

      // Save project and context data
      const projects = JSON.parse(localStorage.getItem('projects') || '[]');
      projects.push(newProject);
      localStorage.setItem('projects', JSON.stringify(projects));
      localStorage.setItem('currentProjectId', projectId);
      localStorage.setItem('contextFormData', JSON.stringify(formData));

      toast.success('Project created successfully');
      window.location.reload();
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Error creating project');
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-xl font-semibold text-[#11190c] mb-6">Context Data</h2>

        <form className="space-y-6" onSubmit={handleSave}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="projectName" className="block text-sm font-medium text-[#444638]">
                Project Name
              </label>
              <input
                type="text"
                id="projectName"
                name="projectName"
                value={formData.projectName}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#11190c] focus:ring-[#11190c]"
                required
              />
            </div>

            <div>
              <label htmlFor="brandName" className="block text-sm font-medium text-[#444638]">
                Brand Name
              </label>
              <input
                type="text"
                id="brandName"
                name="brandName"
                value={formData.brandName}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#11190c] focus:ring-[#11190c]"
                required
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-[#444638]">
                Category
              </label>
              <input
                type="text"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#11190c] focus:ring-[#11190c]"
                required
              />
            </div>

            <div>
              <label htmlFor="currentSessions" className="block text-sm font-medium text-[#444638]">
                Current Annual Sessions
              </label>
              <input
                type="number"
                id="currentSessions"
                name="currentSessions"
                value={formData.currentSessions}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#11190c] focus:ring-[#11190c]"
                required
                min="0"
              />
            </div>

            <div>
              <label htmlFor="currentResult" className="block text-sm font-medium text-[#444638]">
                Current Result (€)
              </label>
              <input
                type="number"
                id="currentResult"
                name="currentResult"
                value={formData.currentResult}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#11190c] focus:ring-[#11190c]"
                required
                min="0"
              />
            </div>

            <div>
              <label htmlFor="quantitativeGoal" className="block text-sm font-medium text-[#444638]">
                Quantitative Goal (€)
              </label>
              <input
                type="number"
                id="quantitativeGoal"
                name="quantitativeGoal"
                value={formData.quantitativeGoal}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#11190c] focus:ring-[#11190c]"
                required
                min="0"
              />
            </div>

            <div>
              <label htmlFor="conversionRate" className="block text-sm font-medium text-[#444638]">
                Conversion Rate (%)
              </label>
              <input
                type="number"
                id="conversionRate"
                name="conversionRate"
                value={formData.conversionRate}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#11190c] focus:ring-[#11190c]"
                required
                min="0"
                max="100"
                step="0.01"
              />
            </div>

            <div>
              <label htmlFor="averageOrderValue" className="block text-sm font-medium text-[#444638]">
                Average Order Value (€)
              </label>
              <input
                type="number"
                id="averageOrderValue"
                name="averageOrderValue"
                value={formData.averageOrderValue}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#11190c] focus:ring-[#11190c]"
                required
                min="0"
              />
            </div>

            <div>
              <label htmlFor="language" className="block text-sm font-medium text-[#444638]">
                Language
              </label>
              <select
                id="language"
                name="language"
                value={formData.language}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#11190c] focus:ring-[#11190c]"
                required
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="businessContext" className="block text-sm font-medium text-[#444638]">
              Business Context
            </label>
            <textarea
              id="businessContext"
              name="businessContext"
              value={formData.businessContext}
              onChange={handleInputChange}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#11190c] focus:ring-[#11190c]"
              required
            />
          </div>

          <div className="flex justify-end mt-8">
            <button
              type="submit"
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-[#11190c] rounded-md hover:bg-[#0a0f07] transition-colors"
            >
              <Save className="h-4 w-4 mr-2" />
              Create Project
            </button>
          </div>
        </form>
      </div>

      <MetaSection formData={formData} />
    </div>
  );
}