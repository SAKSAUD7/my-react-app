import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  DocumentDuplicateIcon,
  PencilIcon,
  ArrowsPointingOutIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';

const mobileNavItems = [
  { name: 'Home', href: '/', icon: HomeIcon },
  { name: 'Merge', href: '/merge-pdf', icon: DocumentDuplicateIcon },
  { name: 'Edit', href: '/edit-pdf', icon: PencilIcon },
  { name: 'Compress', href: '/compress-pdf', icon: ArrowsPointingOutIcon },
  { name: 'AI Chat', href: '/chat-with-pdf', icon: ChatBubbleLeftRightIcon },
];

export default function MobileNav() {
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[90] bg-white border-t border-gray-200 md:hidden">
      <div className="grid grid-cols-5 py-2">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex flex-col items-center py-2 px-1 transition-colors duration-200 ${
                isActive 
                  ? 'text-blue-600' 
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <div className={`p-1.5 rounded-lg ${
                isActive 
                  ? 'bg-blue-50' 
                  : 'hover:bg-gray-50'
              }`}>
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium mt-1 truncate">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
} 