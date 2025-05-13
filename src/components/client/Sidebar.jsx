'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  const navItems = [
    { path: '/client', icon: '🏠', label: 'Dashboard' },
    { path: '/client/scooters', icon: '🛵', label: 'Mes Scooters' },
    { path: '/client/reparations/nouvelle', icon: '🔧', label: 'Réparations' }
  ]

  return (
    <div className={`bg-blue-600 text-white ${collapsed ? 'w-20' : 'w-64'} h-full flex flex-col transition-all duration-300`}>
      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="p-4 text-left hover:bg-blue-700 flex items-center gap-2"
      >
        {collapsed ? '☰' : <span>◄    Réduire</span>}
      </button>
      
      <nav className="flex-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`flex items-center p-4 hover:bg-blue-700 transition ${pathname === item.path ? 'bg-blue-800' : ''}`}
          >
            <span className="text-xl mr-3">{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>
    </div>
  )
}