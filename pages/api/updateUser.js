import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id, name, prenom, dateDeNaissance, adresse, numeroDeTelephone } = req.body;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: {
        name,
        prenom,
        dateDeNaissance: dateDeNaissance ? new Date(dateDeNaissance) : null,
        adresse,
        numeroDeTelephone,
      },
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user', error: error.message });
  } finally {
    await prisma.$disconnect();
  }
}