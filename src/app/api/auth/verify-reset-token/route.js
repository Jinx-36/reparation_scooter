import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Token manquant' 
      }), { 
        status: 400 
      });
    }

    const user = await prisma.utilisateur.findFirst({
      where: {
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

    return new Response(JSON.stringify({ 
      success: true,
      email: user.email 
    }), { 
      status: 200 
    });

  } catch (error) {
    console.error('Token verification error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Erreur serveur' 
    }), { 
      status: 500 
    });
  }
}