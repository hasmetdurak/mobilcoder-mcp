// Template Commands Library
export interface Template {
  id: string;
  name: string;
  description: string;
  category: 'quality' | 'features' | 'setup' | 'debugging';
  prompt: string;
  icon: string;
  color: string;
}

export const TEMPLATES: Template[] = [
  // Code Quality Templates
  {
    id: 'fix-eslint',
    name: 'Fix ESLint Warnings',
    description: 'Fix all ESLint warnings and formatting issues',
    category: 'quality',
    prompt: 'Fix all ESLint warnings in the codebase. Ensure proper formatting and resolve any linting errors.',
    icon: '🔧',
    color: 'from-yellow-500 to-orange-500'
  },
  {
    id: 'optimize-imports',
    name: 'Optimize Imports',
    description: 'Clean up and optimize import statements',
    category: 'quality',
    prompt: 'Optimize all import statements. Remove unused imports, organize them properly, and fix any import-related issues.',
    icon: '⚡',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'format-code',
    name: 'Format Code',
    description: 'Format all code files using Prettier',
    category: 'quality',
    prompt: 'Format all code files using Prettier. Ensure consistent code style and formatting across the entire project.',
    icon: '🎨',
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'remove-unused-code',
    name: 'Remove Unused Code',
    description: 'Find and remove unused functions, variables, and imports',
    category: 'quality',
    prompt: 'Analyze the codebase and remove all unused functions, variables, imports, and dead code. Ensure no functionality is broken.',
    icon: '🧹',
    color: 'from-red-500 to-orange-500'
  },

  // Common Features Templates
  {
    id: 'generate-crud',
    name: 'Generate CRUD API',
    description: 'Create complete CRUD operations for a resource',
    category: 'features',
    prompt: 'Generate complete CRUD (Create, Read, Update, Delete) API endpoints for the specified resource. Include proper error handling, validation, and documentation.',
    icon: '📦',
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'create-navbar',
    name: 'Create Responsive Navbar',
    description: 'Build a responsive navigation bar with mobile menu',
    category: 'features',
    prompt: 'Create a responsive navbar component with mobile hamburger menu, proper navigation links, and smooth transitions. Ensure it works on all screen sizes.',
    icon: '📱',
    color: 'from-indigo-500 to-purple-500'
  },
  {
    id: 'add-login',
    name: 'Add Login Page',
    description: 'Create a complete authentication login page',
    category: 'features',
    prompt: 'Create a complete login page with form validation, error handling, loading states, and proper UX. Include email/password fields and social login options.',
    icon: '🔐',
    color: 'from-blue-500 to-indigo-500'
  },
  {
    id: 'add-dark-mode',
    name: 'Add Dark Mode Toggle',
    description: 'Implement dark mode with theme switching',
    category: 'features',
    prompt: 'Implement a complete dark mode system with theme toggle, proper CSS variables, localStorage persistence, and smooth transitions.',
    icon: '🌙',
    color: 'from-gray-700 to-gray-900'
  },
  {
    id: 'create-user-profile',
    name: 'Create User Profile Page',
    description: 'Build a user profile with avatar and settings',
    category: 'features',
    prompt: 'Create a comprehensive user profile page with avatar upload, personal information display, account settings, and edit capabilities.',
    icon: '👤',
    color: 'from-teal-500 to-cyan-500'
  },

  // Project Setup Templates
  {
    id: 'init-typescript',
    name: 'Initialize TypeScript',
    description: 'Set up TypeScript configuration and types',
    category: 'setup',
    prompt: 'Initialize TypeScript in the project with proper tsconfig.json, type definitions, and convert existing JavaScript files to TypeScript.',
    icon: '📘',
    color: 'from-blue-600 to-blue-800'
  },
  {
    id: 'setup-testing',
    name: 'Setup Testing Framework',
    description: 'Configure Jest and React Testing Library',
    category: 'setup',
    prompt: 'Set up a complete testing environment with Jest, React Testing Library, test utilities, and example test files.',
    icon: '🧪',
    color: 'from-orange-500 to-red-500'
  },
  {
    id: 'add-error-handling',
    name: 'Add Error Handling',
    description: 'Implement global error handling',
    category: 'setup',
    prompt: 'Implement comprehensive error handling with error boundaries, error logging, user-friendly error messages, and recovery mechanisms.',
    icon: '⚠️',
    color: 'from-red-600 to-pink-600'
  },
  {
    id: 'create-api-routes',
    name: 'Create API Routes',
    description: 'Set up RESTful API structure',
    category: 'setup',
    prompt: 'Create a well-structured RESTful API with proper route organization, middleware, validation, and documentation.',
    icon: '🛣️',
    color: 'from-green-600 to-teal-600'
  },

  // Debugging Templates
  {
    id: 'debug-performance',
    name: 'Debug Performance Issues',
    description: 'Analyze and fix performance bottlenecks',
    category: 'debugging',
    prompt: 'Analyze the application for performance issues, identify bottlenecks, and implement optimizations. Focus on load time, rendering performance, and memory usage.',
    icon: '🔍',
    color: 'from-purple-600 to-indigo-600'
  },
  {
    id: 'fix-memory-leaks',
    name: 'Fix Memory Leaks',
    description: 'Find and fix memory leak issues',
    category: 'debugging',
    prompt: 'Identify and fix memory leaks in the application. Check for event listener cleanup, proper component unmounting, and resource management.',
    icon: '💾',
    color: 'from-cyan-600 to-blue-600'
  },
  {
    id: 'debug-console-errors',
    name: 'Debug Console Errors',
    description: 'Fix JavaScript console errors',
    category: 'debugging',
    prompt: 'Investigate and fix all JavaScript console errors. Ensure proper error handling and provide meaningful error messages.',
    icon: '🐛',
    color: 'from-red-500 to-red-700'
  }
];

export const TEMPLATES_BY_CATEGORY = {
  quality: TEMPLATES.filter(t => t.category === 'quality'),
  features: TEMPLATES.filter(t => t.category === 'features'),
  setup: TEMPLATES.filter(t => t.category === 'setup'),
  debugging: TEMPLATES.filter(t => t.category === 'debugging')
};

export const getTemplateById = (id: string): Template | undefined => {
  return TEMPLATES.find(t => t.id === id);
};

export const getPopularTemplates = (): Template[] => {
  return TEMPLATES.slice(0, 6); // First 6 as popular
};