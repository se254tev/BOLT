import React from 'react';
import Sidebar from './Sidebar';
import api from '../services/api';

const Topbar = ({ children }) => (
  <div className="flex items-center justify-between px-4 py-3 border-b bg-white">
    <div className="text-lg font-semibold">Bolt Admin</div>
    <div className="text-sm text-gray-600">{children}</div>
  </div>
);

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="p-6">
          <div className="max-w-7xl mx-auto w-full">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
