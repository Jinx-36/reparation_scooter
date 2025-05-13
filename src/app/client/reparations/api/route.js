import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  const session = await auth()
  if (!session?.user) {
    return Response.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const { scooterId, description } = await request.json()

    const reparation = await prisma.reparation.create({
      data: {
        client_id: parseInt(session.user.id),
        scooter_id: parseInt(scooterId),
        description_probleme: description,
        statut: 'a_venir'
      }
    })

    return Response.json(reparation, { status: 201 })
  } catch (error) {
    return Response.json(
      { error: 'Erreur lors de la création' },
      { status: 500 }
    )
  }
}