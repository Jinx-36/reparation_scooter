'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function ScootersPage() {
  const { data: session, status } = useSession();
  const [scooters, setScooters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchScooters() {
      if (status === 'authenticated' && session?.user?.id) {
        try {
          const res = await fetch(`/client/scooters/api?userId=${session.user.id}`); // Envoi de l'ID comme query parameter
          if (!res.ok) throw new Error('Erreur de chargement des scooters');
          const data = await res.json();
          setScooters(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      } else if (status === 'loading') {
        setLoading(true);
      } else {
        setLoading(false);
        setError('Non authentifié');
      }
    }

    fetchScooters();
  }, [status, session?.user?.id]);

  if (loading) return <div className="p-4">Chargement en cours...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  const handleDelete = async (scooterId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce scooter ?')) {
      setLoading(true);
      try {
        const res = await fetch(`/client/scooters/api?scooterId=${scooterId}&userId=${session?.user?.id}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          setScooters(scooters.filter(scooter => scooter.id !== scooterId));
        } else {
          const errorData = await res.json();
          setError(errorData?.error || 'Erreur lors de la suppression du scooter');
        }
      } catch (error) {
        setError('Erreur de connexion lors de la suppression');
      } finally {
        setLoading(false);
      }
    }
  };
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mes Scooters {session?.user?.id}</h1>
        <Link
          href="/client/scooters/ajouter"
          className="bg-blue-500 text-white font-semibold px-4 py-2 rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
        >
          Ajouter un scooter
        </Link>
      </div>

      {scooters.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p>Aucun scooter enregistré</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marque</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Modèle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Année</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">N° Série</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {scooters.map((scooter) => (
                <tr key={scooter.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{scooter.marque}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{scooter.modele}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{scooter.annee}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{scooter.numero_serie}</td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                  <Link
                    href={`/client/scooters/editer/${scooter.id}`}
                    className="text-green-500 hover:text-green-700 font-semibold transition-colors"
                  >
                    Modifier
                  </Link>
                  <button
                    onClick={() => handleDelete(scooter.id)}
                    className="text-red-500 hover:text-red-700 font-semibold transition-colors"
                  >
                    Supprimer
                  </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}