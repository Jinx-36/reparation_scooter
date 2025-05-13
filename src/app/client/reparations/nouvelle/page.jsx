'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react';
import Chatbot from '@/components/Chatbot'

export default function NewRepair() {
  const { data: session, status } = useSession();
  const [scooters, setScooters] = useState([])
  const [formData, setFormData] = useState({
    scooterId: '',
    description: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadScooters() {
      try {
        const res = await fetch(`/client/scooters/api?userId=${session.user.id}`); 
        if (!res.ok) throw new Error('Erreur de chargement')
        const data = await res.json()
        setScooters(data)
        if (data.length > 0) setFormData(prev => ({ ...prev, scooterId: data[0].id }))
      } catch (err) {
        setError(err.message)
      }
    }
    loadScooters()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/reparations/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error('Erreur lors de la soumission')
      alert('Demande enregistrée avec succès !')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Nouvelle Demande de Réparation</h1>
      
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
        <div className="mb-4">
          <label className="block mb-2 font-medium">Scooter concerné</label>
          <select
            value={formData.scooterId}
            onChange={(e) => setFormData({ ...formData, scooterId: e.target.value })}
            className="w-full border p-2 rounded"
            required
            disabled={loading}
          >
            {scooters.map(scooter => (
              <option key={scooter.id} value={scooter.id}>
                {scooter.marque} {scooter.modele} ({scooter.annee})
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-medium">Description du problème</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full border p-2 rounded h-32"
            required
            disabled={loading}
          />
        </div>

        <button 
          type="submit" 
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Envoi en cours...' : 'Soumettre la demande'}
        </button>
      </form>

      <h2 className="text-xl font-semibold">Assistant Diagnostic</h2>
      <Chatbot />
    </div>
  )
}