// import { auth } from '@/lib/auth'
// import prisma from '@/lib/prisma'

// export const dynamic = 'force-dynamic'

// export async function POST(request) {
//   const session = await auth()
//   if (!session?.user) {
//     return Response.json({ error: 'Non autorisé' }, { status: 401 })
//   }

//   try {
//     const { scooterId, description } = await request.json()

//     const reparation = await prisma.reparation.create({
//       data: {
//         client_id: parseInt(session.user.id),
//         scooter_id: parseInt(scooterId),
//         description_probleme: description,
//         statut: 'a_venir'
//       }
//     })

//     return Response.json(reparation, { status: 201 })
//   } catch (error) {
//     return Response.json(
//       { error: 'Erreur lors de la création' },
//       { status: 500 }
//     )
//   }
// }

import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request) {
  console.log('=== DEBUT DE LA REQUETE POST (NOUVELLE REPARATION) ===');
  try {
    const { scooterId, description, userId, diagnostic_ia } = await request.json(); // <-- Ajout de diagnostic_ia ici

    if (!userId || !scooterId || !description) {
      console.error('ERREUR: Données manquantes pour la création de la réparation.');
      return NextResponse.json({ error: 'Scooter ID, description ou User ID manquant' }, { status: 400 });
    }

    const client = await prisma.client.findUnique({
      where: { utilisateur_id: parseInt(userId) },
      include: { scooters: true }
    });

    if (!client) {
      console.error('ERREUR: Client non trouvé pour l\'ID utilisateur:', userId);
      return NextResponse.json({ error: 'Client non trouvé' }, { status: 404 });
    }

    const scooterExistsForClient = client.scooters.some(s => s.id === scooterId);
    if (!scooterExistsForClient) {
      console.error(`ERREUR: Scooter ${scooterId} n'appartient pas au client ${client.id}.`);
      return NextResponse.json({ error: 'Scooter non valide pour ce client' }, { status: 403 });
    }

    const newReparation = await prisma.reparation.create({
      data: {
        client_id: client.id,
        scooter_id: scooterId,
        description_probleme: description,
        diagnostic_ia: diagnostic_ia || null, // <-- Ajout de diagnostic_ia ici. Sera null si non fourni.
      },
    });

    console.log('Nouvelle réparation créée:', newReparation);
    return NextResponse.json(newReparation, { status: 201 });
  } catch (error) {
    console.error('ERREUR COMPLETE (NOUVELLE REPARATION):', error);
    return NextResponse.json({ error: 'Erreur serveur lors de la création de la réparation', details: process.env.NODE_ENV === 'development' ? error.message : undefined }, { status: 500 });
  } finally {
    console.log('=== FIN DE LA REQUETE POST (NOUVELLE REPARATION) ===');
  }
}


export async function GET(request) {
  console.log('=== DEBUT DE LA REQUETE GET (REPARATIONS) ===');
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const reparationId = searchParams.get('reparationId');

  if (!userId) {
    console.error('ERREUR: Pas d\'ID utilisateur fourni pour la récupération des réparations.');
    return NextResponse.json({ error: 'Non autorisé, ID utilisateur manquant' }, { status: 401 });
  }

  try {
    const client = await prisma.client.findUnique({
      where: { utilisateur_id: parseInt(userId) },
    });

    if (!client) {
      console.error('ERREUR: Client non trouvé pour l\'ID utilisateur:', userId);
      return NextResponse.json({ error: 'Client non trouvé' }, { status: 404 });
    }

    if (reparationId) {
      // Récupération d'une seule réparation
      const reparation = await prisma.reparation.findUnique({
        where: {
          id: parseInt(reparationId),
          client_id: client.id, // S'assurer que la réparation appartient bien à ce client
        },
        include: {
          scooter: true, // Inclure les infos du scooter
          messages: { // Inclure les messages si nécessaire
            orderBy: { date: 'asc' }, // Trier par date
            include: { expediteur: { select: { nom: true, prenom: true, role: true } } }
          }
        }
      });

      if (!reparation) {
        console.error(`ERREUR: Réparation ${reparationId} non trouvée ou n'appartient pas au client ${client.id}.`);
        return NextResponse.json({ error: 'Réparation non trouvée pour ce client' }, { status: 404 });
      }
      return NextResponse.json(reparation);
    } else {
      // Récupération de toutes les réparations du client
      const reparations = await prisma.reparation.findMany({
        where: { client_id: client.id },
        include: {
          scooter: true // Inclure les infos du scooter
        },
        orderBy: { date_creation: 'desc' }, // Trier par date de création récente
      });
      return NextResponse.json(reparations);
    }
  } catch (error) {
    console.error('ERREUR COMPLETE (GET REPARATIONS):', error);
    return NextResponse.json({ error: 'Erreur serveur lors de la récupération des réparations', details: process.env.NODE_ENV === 'development' ? error.message : undefined }, { status: 500 });
  } finally {
    console.log('=== FIN DE LA REQUETE GET (REPARATIONS) ===');
  }
}