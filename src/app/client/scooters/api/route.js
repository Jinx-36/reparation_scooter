import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const scooterId = searchParams.get('scooterId');

  if (!userId) {
    return NextResponse.json({ error: 'Non autorisé, ID utilisateur manquant' }, { status: 401 });
  }

  try {
    const client = await prisma.client.findUnique({
      where: { utilisateur_id: parseInt(userId) },
    });

    if (!client) {
      return NextResponse.json({ error: 'Client non trouvé' }, { status: 404 });
    }

    if (scooterId) {
      const scooter = await prisma.scooter.findUnique({
        where: {
          id: parseInt(scooterId),
          client_id: client.id, // Vérification d'appartenance
        },
      });

      if (!scooter) {
        return NextResponse.json({ error: 'Scooter non trouvé pour ce client' }, { status: 404 });
      }
      return NextResponse.json(scooter);
    } else {
      const scooters = await prisma.scooter.findMany({
        where: { client_id: client.id },
      });
      return NextResponse.json(scooters);
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des scooters:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request) {
  console.log('=== DEBUT DE LA REQUETE POST (AJOUT SCOOTER AVEC PROP) ===');
  try {
    const { marque, modele, annee, numero_serie, userId } = await request.json();

    if (!userId) {
      console.error('ERREUR: Pas d\'ID utilisateur fourni dans le corps de la requête pour l\'ajout du scooter');
      return NextResponse.json({ error: 'Non autorisé, ID utilisateur manquant' }, { status: 401 });
    }

    const client = await prisma.client.findUnique({
      where: { utilisateur_id: parseInt(userId) },
    });

    if (!client) {
      console.error('ERREUR: Client non trouvé pour l\'ID:', userId);
      return NextResponse.json({ error: 'Client non trouvé' }, { status: 404 });
    }

    const newScooter = await prisma.scooter.create({
      data: {
        marque,
        modele,
        annee: parseInt(annee) || undefined,
        numero_serie,
        client_id: client.id,
      },
    });

    console.log('Scooter ajouté:', newScooter);
    return NextResponse.json(newScooter, { status: 201 });
  } catch (error) {
    console.error('ERREUR COMPLETE (AJOUT SCOOTER AVEC PROP):', error);
    return NextResponse.json({ error: 'Erreur serveur lors de l\'ajout du scooter', details: process.env.NODE_ENV === 'development' ? error.message : undefined }, { status: 500 });
  } finally {
    console.log('=== FIN DE LA REQUETE POST (AJOUT SCOOTER AVEC PROP) ===');
  }
}

export async function DELETE(request) {
  console.log('=== DEBUT DE LA REQUETE DELETE (SUPPRESSION SCOOTER AVEC PROP) ===');
  try {
    const { searchParams } = new URL(request.url);
    const scooterId = searchParams.get('scooterId');
    const userId = searchParams.get('userId');

    if (!scooterId || !userId) {
      console.error('ERREUR: ID du scooter ou ID utilisateur manquant pour la suppression');
      return NextResponse.json({ error: 'ID du scooter ou ID utilisateur manquant' }, { status: 400 });
    }

    const client = await prisma.client.findUnique({
      where: { utilisateur_id: parseInt(userId) },
    });

    if (!client) {
      console.error('ERREUR: Client non trouvé pour l\'ID:', userId);
      return NextResponse.json({ error: 'Client non trouvé' }, { status: 404 });
    }

    const deletedScooter = await prisma.scooter.delete({
      where: {
        id: parseInt(scooterId),
        client_id: client.id, // Assurez-vous que le scooter appartient au client
      },
    });

    console.log('Scooter supprimé avec l\'ID:', scooterId);
    return NextResponse.json({ message: 'Scooter supprimé avec succès' }, { status: 200 });
  } catch (error) {
    console.error('ERREUR COMPLETE (SUPPRESSION SCOOTER AVEC PROP):', error);
    return NextResponse.json({ error: 'Erreur serveur lors de la suppression du scooter', details: process.env.NODE_ENV === 'development' ? error.message : undefined }, { status: 500 });
  } finally {
    console.log('=== FIN DE LA REQUETE DELETE (SUPPRESSION SCOOTER AVEC PROP) ===');
  }
}

export async function PUT(request) {
  console.log('=== DEBUT DE LA REQUETE PUT (MODIFICATION SCOOTER AVEC PROP) ===');
  try {
    const { marque, modele, annee, numero_serie, userId } = await request.json();
    const { searchParams } = new URL(request.url);
    const scooterId = searchParams.get('scooterId');

    if (!scooterId || !userId) {
      console.error('ERREUR: ID du scooter ou ID utilisateur manquant pour la modification');
      return NextResponse.json({ error: 'ID du scooter ou ID utilisateur manquant' }, { status: 400 });
    }

    const client = await prisma.client.findUnique({
      where: { utilisateur_id: parseInt(userId) },
    });

    if (!client) {
      console.error('ERREUR: Client non trouvé pour l\'ID:', userId);
      return NextResponse.json({ error: 'Client non trouvé' }, { status: 404 });
    }

    const updatedScooter = await prisma.scooter.update({
      where: {
        id: parseInt(scooterId),
        client_id: client.id, // Assurez-vous que le scooter appartient au client
      },
      data: {
        marque,
        modele,
        annee: parseInt(annee) || undefined,
        numero_serie,
      },
    });

    console.log('Scooter mis à jour avec l\'ID:', scooterId);
    return NextResponse.json(updatedScooter, { status: 200 });
  } catch (error) {
    console.error('ERREUR COMPLETE (MODIFICATION SCOOTER AVEC PROP):', error);
    return NextResponse.json({ error: 'Erreur serveur lors de la modification du scooter', details: process.env.NODE_ENV === 'development' ? error.message : undefined }, { status: 500 });
  } finally {
    console.log('=== FIN DE LA REQUETE PUT (MODIFICATION SCOOTER AVEC PROP) ===');
  }
}

