// 'use client'
// import { useState, useEffect } from 'react'
// import { useSession } from 'next-auth/react';
// import Chatbot from '@/components/Chatbot'

// export default function NewRepair() {
//   const { data: session, status } = useSession();
//   const [scooters, setScooters] = useState([])
//   const [formData, setFormData] = useState({
//     scooterId: '',
//     description: ''
//   })
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState('')

//   useEffect(() => {
//     async function loadScooters() {
//       try {
//         const res = await fetch(`/client/scooters/api?userId=${session.user.id}`); 
//         if (!res.ok) throw new Error('Erreur de chargement')
//         const data = await res.json()
//         setScooters(data)
//         if (data.length > 0) setFormData(prev => ({ ...prev, scooterId: data[0].id }))
//       } catch (err) {
//         setError(err.message)
//       }
//     }
//     loadScooters()
//   }, [])

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     setLoading(true)
//     setError('')

//     try {
//       const response = await fetch('/reparations/api', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(formData)
//       })

//       if (!response.ok) throw new Error('Erreur lors de la soumission')
//       alert('Demande enregistrée avec succès !')
//     } catch (err) {
//       setError(err.message)
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="space-y-8">
//       <h1 className="text-2xl font-bold">Nouvelle Demande de Réparation</h1>
      
//       {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}

//       <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
//         <div className="mb-4">
//           <label className="block mb-2 font-medium">Scooter concerné</label>
//           <select
//             value={formData.scooterId}
//             onChange={(e) => setFormData({ ...formData, scooterId: e.target.value })}
//             className="w-full border p-2 rounded"
//             required
//             disabled={loading}
//           >
//             {scooters.map(scooter => (
//               <option key={scooter.id} value={scooter.id}>
//                 {scooter.marque} {scooter.modele} ({scooter.annee})
//               </option>
//             ))}
//           </select>
//         </div>

//         <div className="mb-4">
//           <label className="block mb-2 font-medium">Description du problème</label>
//           <textarea
//             value={formData.description}
//             onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//             className="w-full border p-2 rounded h-32"
//             required
//             disabled={loading}
//           />
//         </div>

//         <button 
//           type="submit" 
//           className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
//           disabled={loading}
//         >
//           {loading ? 'Envoi en cours...' : 'Soumettre la demande'}
//         </button>
//       </form>

//       <h2 className="text-xl font-semibold">Assistant Diagnostic</h2>
//       <Chatbot />
//     </div>
//   )
// }

'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Chatbot from '@/components/Chatbot'; // Assure-toi que ce chemin est correct
import Link from 'next/link';

export default function NewRepair() {
  const { data: session, status } = useSession();
  const [scooters, setScooters] = useState([]);
  const [formData, setFormData] = useState({
    scooterId: '',
    description: ''
  });
  const [loadingScooters, setLoadingScooters] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [error, setError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Charger les scooters du client
  useEffect(() => {
    async function loadScooters() {
      if (status === 'authenticated' && session?.user?.id) {
        try {
          const res = await fetch(`/client/scooters/api?userId=${session.user.id}`);
          if (!res.ok) throw new Error('Erreur de chargement des scooters');
          const data = await res.json();
          setScooters(data);
          if (data.length > 0) {
            setFormData(prev => ({ ...prev, scooterId: data[0].id.toString() })); // Convertir en string pour le select
          }
        } catch (err) {
          setError(`Erreur lors du chargement des scooters : ${err.message}`);
        } finally {
          setLoadingScooters(false);
        }
      } else if (status === 'loading') {
        setLoadingScooters(true);
      } else {
        setLoadingScooters(false);
        setError('Non authentifié. Veuillez vous connecter.');
      }
    }
    loadScooters();
  }, [status, session?.user?.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingSubmit(true);
    setError('');
    setSubmitSuccess(false);

    if (!session?.user?.id) {
      setError('Erreur: ID utilisateur non disponible. Veuillez vous reconnecter.');
      setLoadingSubmit(false);
      return;
    }
    if (!formData.scooterId) {
        setError('Veuillez sélectionner un scooter.');
        setLoadingSubmit(false);
        return;
    }
    if (!formData.description.trim()) {
        setError('Veuillez décrire le problème.');
        setLoadingSubmit(false);
        return;
    }

    try {
      const response = await fetch('/client/reparations/api', { // Chemin de l'API des réparations
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          userId: session.user.id, // Passer l'ID utilisateur
          scooterId: parseInt(formData.scooterId) // S'assurer que c'est un nombre
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la soumission de la demande');
      }

      setSubmitSuccess(true);
      setFormData({ // Réinitialiser le formulaire après succès
          scooterId: scooters.length > 0 ? scooters[0].id.toString() : '',
          description: ''
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingSubmit(false);
    }
  };

  if (status === 'loading' || loadingScooters) {
    return <div className="p-4 text-center">Chargement des données...</div>;
  }
  if (status === 'unauthenticated') {
    return <div className="p-4 text-red-500 text-center">Vous devez être connecté pour accéder à cette page.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 p-6">
      <div className="max-w-xl mx-auto bg-white p-8 rounded-lg shadow-xl">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center">Nouvelle Demande de Réparation</h1>

        {submitSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4" role="alert">
            Demande enregistrée avec succès !
          </div>
        )}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="scooterId" className="block text-sm font-medium text-gray-700 mb-2">
              Scooter concerné
            </label>
            <select
              id="scooterId"
              value={formData.scooterId}
              onChange={(e) => setFormData({ ...formData, scooterId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
              disabled={loadingSubmit || scooters.length === 0}
            >
              {scooters.length === 0 ? (
                <option value="">Aucun scooter enregistré</option>
              ) : (
                scooters.map(scooter => (
                  <option key={scooter.id} value={scooter.id}>
                    {scooter.marque} {scooter.modele} ({scooter.annee})
                  </option>
                ))
              )}
            </select>
            {scooters.length === 0 && (
              <p className="mt-2 text-sm text-gray-500">
                <Link href="/client/scooters/ajouter" className="text-blue-600 hover:underline">
                  Ajoutez un scooter
                </Link> pour soumettre une demande.
              </p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description du problème
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 h-32 resize-y"
              required
              disabled={loadingSubmit || scooters.length === 0}
              placeholder="Décrivez en détail le problème rencontré avec votre scooter..."
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold px-4 py-2 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loadingSubmit || scooters.length === 0}
          >
            {loadingSubmit ? 'Envoi en cours...' : 'Soumettre la demande'}
          </button>
        </form>

        <h2 className="text-2xl font-semibold mt-10 mb-6 text-gray-800 text-center">Assistant Diagnostic</h2>
        <div className="bg-gray-50 p-6 rounded-md border border-gray-200 shadow-inner">
           <Chatbot />
        </div>
      </div>
    </div>
  );
}