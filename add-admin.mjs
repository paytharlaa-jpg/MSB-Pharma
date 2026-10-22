// add-admin.mjs
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function addAdmin() {
  const email = "paytharlaa@gmail.com";
  const password = "Abhiram@1289";
  const name = "Abhiram (Super Admin)";

  console.log(`Hashing password for ${email}...`);
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  console.log(`Upserting user into database...`);
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      role: "SUPER_ADMIN",
      isActive: true,
      name,
    },
    create: {
      email,
      passwordHash,
      role: "SUPER_ADMIN",
      isActive: true,
      name,
    },
  });

  console.log("Successfully created/updated admin user:");
  console.log({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
  });

  // Verify login immediately
  const isValid = await bcrypt.compare(password, user.passwordHash);
  console.log("Password verification test:", isValid ? "PASSED" : "FAILED");
}

addAdmin()
  .catch((e) => {
    console.error("Error creating admin:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
