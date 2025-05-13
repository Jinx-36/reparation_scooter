'use client'
import { useSession } from 'next-auth/react'

export default function Dashboard() {
  const { data: session } = useSession()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Bonjour {session?.user?.name}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Vos scooters</h2>
          {/* Liste des scooters */}
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Réparations en cours</h2>
          {/* Liste des réparations */}
        </div>
      </div>
    </div>
  )
}