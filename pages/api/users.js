import prisma from "@/lib/prisma"; // Importing Prisma client
import bcrypt from "bcryptjs"; // Importing bcrypt for password hashing

export default async function handler(req, res) {

  if (req.method === "POST") {
    // Handle user creation
    const { name, prenom, dateDeNaissance, adresse, email, numeroDeTelephone, password } = req.body;

    // Validate input data
    if (!name || !prenom || !dateDeNaissance || !adresse || !email || !numeroDeTelephone || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    try {
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { email: email.trim() },
      });

      if (existingUser) {
        return res.status(400).json({ error: "Email already exists" });
      }

      // Hash the password and create the user
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          name: name.trim(),
          prenom: prenom.trim(),
          dateDeNaissance: new Date(dateDeNaissance),
          adresse: adresse.trim(),
          email: email.trim(),
          numeroDeTelephone: numeroDeTelephone.trim(),
          password: hashedPassword,
        },
      });

      return res.status(201).json({ user: { id: user.id, name: user.name, prenom: user.prenom, email: user.email, adresse: user.adresse, numeroDeTelephone: user.numeroDeTelephone, dateDeNaissance: user.dateDeNaissance } });
    } catch (error) {
      console.error("Error creating user:", error);
      return res.status(500).json({ error: "An error occurred while creating the user", details: error.message });
    }
  } 
  
}
