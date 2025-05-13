'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function AddScooter() {
  const [formData, setFormData] = useState({
    marque: '',
    modele: '',
    annee: '',
    numero_serie: '',
    userId: '', // Ajout du champ userId
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user?.id) {
      setFormData(prevFormData => ({ ...prevFormData, userId: session.user.id }));
    }
  }, [session?.user?.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/client/scooters/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/client/scooters');
      } else {
        const errorData = await response.json();
        console.error('Erreur lors de l\'ajout du scooter:', errorData);
        // Gérer l'erreur ici (afficher un message à l'utilisateur, etc.)
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-md shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Ajouter un scooter</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Marque</label>
          <input
            type="text"
            value={formData.marque}
            onChange={(e) => setFormData({ ...formData, marque: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Modèle</label>
          <input
            type="text"
            value={formData.modele}
            onChange={(e) => setFormData({ ...formData, modele: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Année</label>
          <input
            type="number"
            min="1900"
            max={new Date().getFullYear()}
            value={formData.annee}
            onChange={(e) => setFormData({ ...formData, annee: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Numéro de série</label>
          <input
            type="text"
            value={formData.numero_serie}
            onChange={(e) => setFormData({ ...formData, numero_serie: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white font-semibold px-4 py-2 rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
        >
          {loading ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </form>
    </div>
  );
}