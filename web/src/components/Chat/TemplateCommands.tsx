import React, { useState } from 'react';
import { ChevronDown, Search, Star, Clock, Zap, Code, Wrench, Settings, Bug } from 'lucide-react';
import { TEMPLATES, TEMPLATES_BY_CATEGORY, Template } from '../../lib/templates';

interface TemplateCommandsProps {
  onSelectTemplate: (template: Template) => void;
  onClose: () => void;
}

const CATEGORY_ICONS = {
  quality: Wrench,
  features: Code,
  setup: Settings,
  debugging: Bug
};

const CATEGORY_COLORS = {
  quality: 'from-yellow-500 to-orange-500',
  features: 'from-blue-500 to-purple-500',
  setup: 'from-green-500 to-teal-500',
  debugging: 'from-red-500 to-pink-500'
};

const CATEGORY_NAMES = {
  quality: 'Code Quality',
  features: 'Features',
  setup: 'Project Setup',
  debugging: 'Debugging'
};

export default function TemplateCommands({ onSelectTemplate, onClose }: TemplateCommandsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | keyof typeof TEMPLATES_BY_CATEGORY>('all');
  const [showFavorites, setShowFavorites] = useState(false);

  // Get favorites from localStorage
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('template-favorites');
    return saved ? JSON.parse(saved) : [];
  });

  const toggleFavorite = (templateId: string) => {
    const newFavorites = favorites.includes(templateId)
      ? favorites.filter(id => id !== templateId)
      : [...favorites, templateId];
    
    setFavorites(newFavorites);
    localStorage.setItem('template-favorites', JSON.stringify(newFavorites));
  };

  const filteredTemplates = React.useMemo(() => {
    let templates = selectedCategory === 'all' 
      ? TEMPLATES 
      : TEMPLATES_BY_CATEGORY[selectedCategory];

    if (showFavorites) {
      templates = templates.filter(t => favorites.includes(t.id));
    }

    if (searchQuery) {
      templates = templates.filter(t => 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return templates;
  }, [selectedCategory, searchQuery, showFavorites, favorites]);

  const favoriteTemplates = React.useMemo(() => {
    return TEMPLATES.filter(t => favorites.includes(t.id));
  }, [favorites]);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end justify-center">
      <div className="w-full max-w-2xl bg-[#1e1e1e] rounded-t-3xl shadow-2xl flex flex-col max-h-[90vh] animate-in slide-in-from-bottom duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Quick Commands</h2>
              <p className="text-sm text-gray-400">One-tap templates for common tasks</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-xl flex items-center justify-center transition-colors"
          >
            <ChevronDown className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800 text-white pl-10 pr-4 py-3 rounded-xl border border-gray-700 focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 p-4 border-b border-gray-800 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
              selectedCategory === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            All Templates
          </button>
          
          {Object.entries(CATEGORY_NAMES).map(([key, name]) => {
            const Icon = CATEGORY_ICONS[key as keyof typeof CATEGORY_ICONS];
            return (
              <button
                key={key}
                onClick={() => setSelectedCategory(key as keyof typeof TEMPLATES_BY_CATEGORY)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 whitespace-nowrap ${
                  selectedCategory === key 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {name}
              </button>
            );
          })}

          {favorites.length > 0 && (
            <button
              onClick={() => setShowFavorites(!showFavorites)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 whitespace-nowrap ${
                showFavorites 
                  ? 'bg-yellow-600 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              <Star className="w-4 h-4" />
              Favorites ({favorites.length})
            </button>
          )}
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-800 rounded-2xl mb-4 flex items-center justify-center mx-auto">
                <Search className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-300 mb-2">No templates found</h3>
              <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => {
                    onSelectTemplate(template);
                    onClose();
                  }}
                  className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl p-4 text-left transition-all hover:scale-[1.02] hover:border-gray-600 group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-12 h-12 bg-gradient-to-br ${template.color} rounded-xl flex items-center justify-center text-lg`}>
                      {template.icon}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(template.id);
                      }}
                      className="p-1.5 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      <Star 
                        className={`w-4 h-4 ${
                          favorites.includes(template.id) 
                            ? 'text-yellow-400 fill-yellow-400' 
                            : 'text-gray-500'
                        }`} 
                      />
                    </button>
                  </div>
                  
                  <h3 className="font-semibold text-white mb-1 group-hover:text-blue-400 transition-colors">
                    {template.name}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {template.description}
                  </p>
                  
                  <div className="flex items-center gap-2 mt-3">
                    <div className={`px-2 py-1 rounded-lg text-xs font-medium bg-gradient-to-r ${CATEGORY_COLORS[template.category]} text-white`}>
                      {CATEGORY_NAMES[template.category]}
                    </div>
                    {template.category === 'quality' && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>~2 min</span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        {favoriteTemplates.length > 0 && !showFavorites && (
          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-gray-300">Recent Favorites</span>
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {favoriteTemplates.slice(0, 4).map((template) => (
                <button
                  key={template.id}
                  onClick={() => {
                    onSelectTemplate(template);
                    onClose();
                  }}
                  className={`flex-shrink-0 px-3 py-2 bg-gradient-to-r ${template.color} text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2`}
                >
                  <span>{template.icon}</span>
                  <span>{template.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}