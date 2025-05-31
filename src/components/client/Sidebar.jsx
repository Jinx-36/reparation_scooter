// src/components/client/Sidebar.jsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Home, Bike, Wrench } from 'lucide-react';

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { path: '/client', icon: Home, label: 'Dashboard' },
    { path: '/client/scooters', icon: Bike, label: 'Mes Scooters' },
    { path: '/client/reparations', icon: Wrench, label: 'Réparations' }
  ];

  return (
    <div className={`bg-gradient-to-b from-blue-700 to-blue-900 text-white ${collapsed ? 'w-16' : 'w-64'} h-full flex flex-col shadow-xl transition-all duration-300 ease-in-out rounded-r-lg`}>
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="p-4 text-left hover:bg-blue-800 flex items-center gap-3 text-lg font-semibold border-b border-blue-800 cursor-pointer transition-colors duration-200"
      >
        {collapsed ? (
          <svg className="w-7 h-7 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        ) : (
          <span className="flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
            Réduire
          </span>
        )}
      </button>

      <nav className="flex-1 mt-4 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            // Ajustement pour les icônes en mode collapsed
            className={`flex items-center py-4 mx-3 rounded-lg transition-all duration-200 ease-in-out
              ${collapsed ? 'justify-center px-0' : 'px-4'} {/* Centrage et suppression du padding horizontal en mode réduit */}
              ${pathname.startsWith(item.path) && item.path !== '/client' ? 'bg-blue-800 shadow-md transform scale-105' : ''}
              ${pathname === '/client' && item.path === '/client' ? 'bg-blue-800 shadow-md transform scale-105' : ''}
              hover:bg-blue-700 hover:shadow-md hover:transform hover:scale-105
            `}
          >
            <item.icon className={`w-7 h-7 ${!collapsed ? 'mr-3' : ''}`} /> {/* Retire la marge droite si collapsed */}
            {!collapsed && <span className="font-medium">{item.label}</span>}
          </Link>
        ))}
      </nav>

      <div className="mt-auto p-4 text-center text-blue-200 text-sm">
        {!collapsed && <span>Garage Scooter © 2023</span>}
      </div>
    </div>
  );
}