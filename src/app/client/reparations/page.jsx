'use client';
import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Chatbot from '@/components/Chatbot';

export default function ReparationsPage() {
  const { data: session, status } = useSession();
  const [scooters, setScooters] = useState([]);
  const [reparations, setReparations] = useState([]);
  const [formData, setFormData] = useState({
    scooterId: '',
    description: '',
    diagnostic_ia: '' // diagnostic_ia est dans formData
  });
  const [loadingContent, setLoadingContent] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [error, setError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Fonction pour charger les scooters et les réparations
  const loadData = useCallback(async () => {
    if (status === 'authenticated' && session?.user?.id) {
      try {
        setLoadingContent(true);
        const resScooters = await fetch(`/client/scooters/api?userId=${session.user.id}`);
        if (!resScooters.ok) throw new Error('Erreur de chargement des scooters');
        const dataScooters = await resScooters.json();
        setScooters(dataScooters);
        if (dataScooters.length > 0 && !formData.scooterId) { // Condition pour éviter de reset si déjà un scooter sélectionné
          setFormData(prev => ({ ...prev, scooterId: dataScooters[0].id.toString() }));
        }

        const resReparations = await fetch(`/client/reparations/api?userId=${session.user.id}`);
        if (!resReparations.ok) {
          const errorData = await resReparations.json();
          throw new Error(errorData.error || 'Erreur de chargement des réparations');
        }
        const dataReparations = await resReparations.json();
        setReparations(dataReparations);

      } catch (err) {
        setError(`Erreur lors du chargement des données : ${err.message}`);
      } finally {
        setLoadingContent(false);
      }
    } else if (status === 'loading') {
      setLoadingContent(true);
    } else {
      setLoadingContent(false);
      setError('Non authentifié. Veuillez vous connecter.');
    }
  }, [status, session?.user?.id]); // Retire formData.scooterId des dépendances de loadData pour éviter des boucles/réinitialisations inattendues

  useEffect(() => {
    loadData();
  }, [loadData]);

  // NOUVEAU useEffect pour suivre les changements de formData.diagnostic_ia
  useEffect(() => {
    console.log("formData.diagnostic_ia a changé:", formData.diagnostic_ia); // Log dans la console du NAVIGATEUR
  }, [formData.diagnostic_ia]);

  // Fonction pour mettre à jour le diagnostic_ia depuis le Chatbot
  const handleDiagnosticUpdate = (diagnostic) => {
    console.log("Diagnostic reçu du Chatbot (handleDiagnosticUpdate):", diagnostic); // Log dans la console du NAVIGATEUR
    setFormData(prev => {
      console.log("Ancien formData:", prev); // Log dans la console du NAVIGATEUR
      console.log("Nouveau diagnostic à set:", diagnostic); // Log dans la console du NAVIGATEUR
      const newFormData = { ...prev, diagnostic_ia: diagnostic };
      console.log("Nouveau formData après update:", newFormData); // Log dans la console du NAVIGATEUR
      return newFormData;
    });
  };

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

    // formData.diagnostic_ia devrait être à jour ici
    console.log("Valeur du diagnostic IA au moment de la soumission (handleSubmit):", formData.diagnostic_ia); // Log dans la console du NAVIGATEUR

    const dataToSend = {
        scooterId: parseInt(formData.scooterId),
        description: formData.description,
        userId: session.user.id,
        diagnostic_ia: formData.diagnostic_ia
    };

    try {
      const response = await fetch('/client/reparations/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la soumission de la demande');
      }

      setSubmitSuccess(true);
      // Réinitialiser le formulaire après succès
      setFormData({
          scooterId: scooters.length > 0 ? scooters[0].id.toString() : '',
          description: '',
          diagnostic_ia: '' // Réinitialise le diagnostic aussi
      });
      await loadData(); // Recharger les données après une soumission réussie
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingSubmit(false);
    }
  };

  if (status === 'loading' || loadingContent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-6">
        <p className="text-gray-700 text-lg">Chargement de la page de réparations...</p>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-md text-center">
          <strong className="font-bold">Accès refusé !</strong>
          <span className="block sm:inline"> Vous devez être connecté pour accéder à cette page.</span>
        </div>
      </div>
    );
  }

  // Fonction utilitaire pour formater le statut
  const formatStatut = (statut) => {
    switch (statut) {
      case 'a_venir': return 'À venir';
      case 'en_cours': return 'En cours';
      case 'termine': return 'Terminée';
      default: return statut;
    }
  };

  // Fonction utilitaire pour obtenir la couleur du statut
  const getStatusColorClass = (statut) => {
    switch (statut) {
      case 'a_venir': return 'bg-yellow-100 text-yellow-800';
      case 'en_cours': return 'bg-blue-100 text-blue-800';
      case 'termine': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center">Gestion des Réparations</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Colonne de gauche: Nouvelle Demande de Réparation (2/3 sur desktop) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center">Nouvelle Demande de Réparation</h2>

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

            {formData.diagnostic_ia && ( // <-- Affichage conditionnel basé sur formData.diagnostic_ia
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Diagnostic Assistant (pré-rempli)
                </label>
                <textarea
                  value={formData.diagnostic_ia} // <-- Valeur du textarea basée sur formData.diagnostic_ia
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 h-32 resize-y"
                  placeholder="Le diagnostic de l'IA apparaîtra ici après discussion."
                />
              </div>
            )}

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
             <Chatbot onDiagnosticUpdate={handleDiagnosticUpdate} />
          </div>
        </div>

        {/* Colonne de droite: Liste des Réparations existantes (1/3 sur desktop) */}
        <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center">Mes Demandes de Réparation</h2>

          {loadingContent ? (
            <div className="text-center text-gray-600">Chargement de vos réparations...</div>
          ) : (
            reparations.length === 0 ? (
              <div className="text-center text-gray-600 p-4 border border-dashed rounded-md">
                <p>Aucune demande de réparation enregistrée pour l'instant.</p>
                <p className="mt-2 text-sm">Utilisez le formulaire à gauche pour en créer une !</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reparations.map(repair => (
                  <div key={repair.id} className="p-4 border border-gray-200 rounded-md shadow-sm bg-gray-50">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold text-gray-800">Réparation #{repair.id}</h3>
                      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColorClass(repair.statut)}`}>
                        {formatStatut(repair.statut)}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm mb-2">
                      **Scooter:** {scooters.find(s => s.id === repair.scooter_id)?.marque} {scooters.find(s => s.id === repair.scooter_id)?.modele}
                    </p>
                    <p className="text-gray-600 text-sm mb-2">
                      **Problème:** {repair.description_probleme?.substring(0, 100)}{repair.description_probleme && repair.description_probleme.length > 100 ? '...' : ''}
                    </p>
                    <p className="text-gray-500 text-xs">Demandé le: {new Date(repair.date_creation).toLocaleDateString('fr-FR')}</p>
                    <div className="mt-3 text-right">
                      <Link
                        href={`/client/reparations/${repair.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                      >
                        Voir les détails →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}