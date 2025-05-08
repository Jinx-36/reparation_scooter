const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  await prisma.$transaction(async (prisma) => {
    const adminUser = await prisma.utilisateur.create({
      data: {
        email: 'admin@garage.com',
        mot_de_passe: bcrypt.hashSync('admin123', 10),
        role: 'ADMIN',
        nom: 'Admin',
        prenom: 'System'
      }
    });

    await prisma.client.create({
      data: {
        utilisateur_id: adminUser.id,
        adresse: '123 Admin Street'
      }
    });
  });
}