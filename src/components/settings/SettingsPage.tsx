import React from 'react';
import { Settings } from 'lucide-react';
import { SerpUsageIndicator } from '../keyword/SerpUsageIndicator';

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Settings className="h-6 w-6 mr-2 text-primary" />
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">API Usage</h2>
        <SerpUsageIndicator
          used={0}
          total={14999}
          remaining={14999}
          minimal={true}
        />
      </div>
    </div>
  );
}