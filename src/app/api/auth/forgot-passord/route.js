import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const { email } = await request.json();

    // Vérifier si l'utilisateur existe
    const user = await prisma.utilisateur.findUnique({
      where: { email }
    });

    if (!user) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Si cet email existe, un lien de réinitialisation a été envoyé' 
      }), { 
        status: 200 
      });
    }

    // Créer un token de réinitialisation
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 heure

    await prisma.utilisateur.update({
      where: { email },
      data: {
        resetToken,
        resetTokenExpiry
      }
    });

    // Envoyer l'email (à implémenter avec votre service d'emails)
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;
    
    await resend.emails.send({
      from: 'no-reply@votre-garage.com',
      to: email,
      subject: 'Réinitialisation de votre mot de passe',
      html: `<p>Cliquez <a href="${resetUrl}">ici</a> pour réinitialiser votre mot de passe.</p>`
    });

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Un lien de réinitialisation a été envoyé à votre email' 
    }), { 
      status: 200 
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Erreur serveur' 
    }), { 
      status: 500 
    });
  }
}