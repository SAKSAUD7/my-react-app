import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bars3Icon, XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import {
  DocumentArrowUpIcon,
  DocumentArrowDownIcon,
  ScissorsIcon,
  DocumentDuplicateIcon,
  DocumentTextIcon,
  PhotoIcon,
  SparklesIcon,
  TableCellsIcon,
  PresentationChartBarIcon,
  PencilIcon,
  ClipboardDocumentCheckIcon,
  ArrowPathIcon,
  RectangleStackIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Edit PDF', href: '/edit-pdf', highlight: true },
];

const toolsCategories = {
  'Convert': {
    color: 'from-emerald-500 to-teal-500',
    tools: [
      { name: 'Word to PDF', href: '/word-to-pdf', icon: DocumentTextIcon, popular: true },
      { name: 'PDF to Word', href: '/pdf-to-word', icon: DocumentTextIcon, popular: true },
      { name: 'Excel to PDF', href: '/excel-to-pdf', icon: TableCellsIcon },
      { name: 'PDF to Excel', href: '/pdf-to-excel', icon: TableCellsIcon },
      { name: 'PowerPoint to PDF', href: '/powerpoint-to-pdf', icon: PresentationChartBarIcon },
      { name: 'PDF to PowerPoint', href: '/pdf-to-powerpoint', icon: PresentationChartBarIcon },
      { name: 'JPG to PDF', href: '/jpg-to-pdf', icon: PhotoIcon, popular: true },
      { name: 'PDF to JPG', href: '/pdf-to-jpg', icon: PhotoIcon, popular: true },
    ]
  },
  'Organize': {
    color: 'from-blue-500 to-indigo-500',
    tools: [
      { name: 'Merge PDFs', href: '/merge-pdf', icon: DocumentDuplicateIcon, popular: true },
      { name: 'Split PDF', href: '/split-pdf', icon: ScissorsIcon, popular: true },
      { name: 'Rotate PDF', href: '/rotate-pdf', icon: ArrowPathIcon },
      { name: 'Extract Pages', href: '/extract-pages', icon: RectangleStackIcon },
    ]
  },
  'Editor': {
    color: 'from-purple-500 to-pink-500',
    tools: [
      { name: 'Edit PDF', href: '/edit-pdf', icon: PencilIcon, popular: true },
      { name: 'Add Watermark', href: '/add-watermark', icon: SparklesIcon },
      { name: 'Sign PDF', href: '/sign-pdf', icon: ClipboardDocumentCheckIcon, popular: true },
    ]
  },
  'Security': {
    color: 'from-red-500 to-orange-500',
    tools: [
      { name: 'Protect PDF', href: '/protect-pdf', icon: LockClosedIcon },
    ]
  },
  'Optimize': {
    color: 'from-orange-500 to-red-500',
    tools: [
      { name: 'Compress PDF', href: '/compress-pdf', icon: DocumentArrowDownIcon, popular: true },
    ]
  }
};

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRefs = useRef({});
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      Object.values(dropdownRefs.current).forEach((ref, index) => {
        if (ref && !ref.contains(event.target)) {
          setOpenDropdown(null);
        }
      });
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDropdownToggle = (categoryName) => {
    setOpenDropdown(openDropdown === categoryName ? null : categoryName);
  };

  return (
    <header className={`fixed w-full top-0 z-[100] transition-all duration-300 ${
      scrolled ? 'bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-100' : 'bg-white/90 backdrop-blur-sm border-b border-gray-100/50'
    }`}>
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-6" aria-label="Global">
        <div className="flex lg:flex-1">
          <Link to="/" className="-m-1.5 p-1.5 transition-transform hover:scale-105">
            <span className="sr-only">FlexiPDF Core</span>
            <div className="flex items-center space-x-2">
              <div className="h-9 w-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <DocumentTextIcon className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                FlexiPDF Core
              </span>
            </div>
          </Link>
        </div>
        
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700 hover:bg-gray-100 transition-colors border border-gray-200 bg-white shadow-sm"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        <div className="hidden lg:flex lg:gap-x-1 lg:items-center">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`text-sm font-semibold leading-6 transition-all duration-200 relative group px-3 py-2 rounded-lg ${
                item.highlight 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-105' 
                  : location.pathname === item.href 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              {item.name}
              {item.highlight && (
                <SparklesIcon className="inline h-3 w-3 ml-1" />
              )}
            </Link>
          ))}
          
          {/* Category Dropdowns */}
          {Object.entries(toolsCategories).map(([categoryName, category]) => (
            <div key={categoryName} className="relative" ref={el => dropdownRefs.current[categoryName] = el}>
              <button
                onClick={() => handleDropdownToggle(categoryName)}
                className={`text-sm font-semibold leading-6 transition-all duration-200 relative group px-3 py-2 rounded-lg flex items-center space-x-1 ${
                  openDropdown === categoryName ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                <span>{categoryName}</span>
                <ChevronDownIcon className={`h-3 w-3 transition-transform duration-200 ${openDropdown === categoryName ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Dropdown Menu */}
              <div 
                className={`absolute top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 transition-all duration-200 backdrop-blur-sm z-[110] ${
                  openDropdown === categoryName ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-4 invisible'
                }`}
                style={{ left: '-150px' }}
              >
                <div className="p-4">
                  {/* Header */}
                  <div className="mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className={`h-1 w-6 bg-gradient-to-r ${category.color} rounded-full`}></div>
                      <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                        {categoryName}
                      </h4>
                    </div>
                    <p className="text-xs text-gray-500">{category.tools.length} tools available</p>
                  </div>

                  {/* Tools List */}
                  <div className="max-h-80 overflow-y-auto custom-scrollbar space-y-1">
                    {category.tools.map((tool) => {
                      const Icon = tool.icon;
                      return (
                        <Link
                          key={tool.name}
                          to={tool.href}
                          onClick={() => setOpenDropdown(null)}
                          className="group flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
                        >
                          <div className={`h-8 w-8 bg-gradient-to-r ${category.color} rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                            <Icon className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                                {tool.name}
                              </p>
                              {tool.popular && (
                                <span className="bg-blue-100 text-blue-600 text-xs font-medium px-1.5 py-0.5 rounded">
                                  Popular
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          <Link
            to="/compress-pdf"
            className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-2 text-sm font-semibold text-white shadow-lg hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all duration-200 hover:scale-105"
          >
            Compress PDF
          </Link>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={`lg:hidden fixed inset-0 z-[200] transition-opacity duration-300 ${
        mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
        <div 
          className={`fixed inset-0 bg-gray-900/80 transition-opacity duration-300 ${
            mobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`} 
          onClick={() => setMobileMenuOpen(false)} 
        />
        <div className={`fixed inset-y-0 right-0 z-[210] w-full overflow-y-auto bg-white px-4 py-4 sm:max-w-sm transition-transform duration-300 ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <Link to="/" className="-m-1.5 p-1.5" onClick={() => setMobileMenuOpen(false)}>
              <span className="sr-only">FlexiPDF Core</span>
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <DocumentTextIcon className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  FlexiPDF Core
                </span>
              </div>
            </Link>
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          
          <div className="flow-root">
            <div className="space-y-4">
              {/* Main Navigation */}
              <div className="space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`block rounded-lg px-3 py-3 text-base font-semibold transition-colors ${
                      item.highlight
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                        : location.pathname === item.href
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-900 hover:bg-gray-50'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="flex items-center space-x-2">
                      <span>{item.name}</span>
                      {item.highlight && <SparklesIcon className="h-4 w-4" />}
                    </div>
                  </Link>
                ))}
              </div>
                
              {/* Tools Categories in Mobile */}
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <p className="px-3 text-sm font-semibold text-gray-500 uppercase tracking-wide">All Tools</p>
                {Object.entries(toolsCategories).map(([categoryName, category]) => (
                  <div key={categoryName} className="space-y-2">
                    <div className="flex items-center space-x-2 px-3">
                      <div className={`h-1 w-4 bg-gradient-to-r ${category.color} rounded-full`}></div>
                      <p className="text-sm font-medium text-gray-800">
                        {categoryName}
                      </p>
                    </div>
                    <div className="max-h-48 overflow-y-auto px-3 space-y-1">
                      {category.tools.map((tool) => {
                        const Icon = tool.icon;
                        return (
                          <Link
                            key={tool.name}
                            to={tool.href}
                            className="flex items-center space-x-3 p-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <div className={`h-6 w-6 bg-gradient-to-r ${category.color} rounded-lg flex items-center justify-center`}>
                              <Icon className="h-3 w-3 text-white" />
                            </div>
                            <span className="flex-1 text-sm">{tool.name}</span>
                            {tool.popular && (
                              <span className="bg-blue-100 text-blue-600 text-xs font-medium px-1.5 py-0.5 rounded">
                                ★
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* CTA Button */}
              <div className="pt-4 border-t border-gray-200">
                <Link
                  to="/compress-pdf"
                  className="block rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 text-center text-base font-semibold text-white shadow-lg transition-all duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Compress PDF
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}