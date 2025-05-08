import prisma  from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { email, password, nom, prenom, telephone, adresse } = await request.json();

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.utilisateur.findUnique({
      where: { email }
    });

    if (existingUser) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Un compte avec cet email existe déjà' 
      }), { 
        status: 400 
      });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur et le client associé
    const newUser = await prisma.utilisateur.create({
      data: {
        email,
        mot_de_passe: hashedPassword,
        role: 'client',
        nom,
        prenom,
        telephone,
        client: {
          create: {
            adresse
          }
        }
      },
      include: {
        client: true
      }
    });

    return new Response(JSON.stringify({ 
      success: true,
      userId: newUser.id 
    }), { 
      status: 201 
    });

  } catch (error) {
    console.error('Registration error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Erreur serveur' 
    }), { 
      status: 500 
    });
  }
}