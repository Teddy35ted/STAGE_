'use client';

import React from 'react';
import { SidebarTrigger } from '../ui/sidebar';
import { FiMenu } from 'react-icons/fi';

export const MobileHeader: React.FC = () => {
  return (
    <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200 md:hidden">
      <div className="flex items-center space-x-3">
        <SidebarTrigger className="p-2">
          <FiMenu className="w-5 h-5" />
        </SidebarTrigger>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-[#f01919] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">L</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">La-a-La</h2>
          </div>
        </div>
      </div>
    </div>
  );
};