import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { token, email, password } = await request.json();

    // Vérifier à nouveau le token
    const user = await prisma.utilisateur.findFirst({
      where: {
        email,
        resetToken: token,
        resetTokenExpiry: { gt: new Date() }
      }
    });

    if (!user) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Token invalide ou expiré' 
      }), { 
        status: 400 
      });
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Mettre à jour l'utilisateur
    await prisma.utilisateur.update({
      where: { email },
      data: {
        mot_de_passe: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Mot de passe réinitialisé avec succès' 
    }), { 
      status: 200 
    });

  } catch (error) {
    console.error('Password reset error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Erreur serveur' 
    }), { 
      status: 500 
    });
  }
}