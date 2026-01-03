import User from "../models/User";

export const createDefaultAdmin = async () => {
  const ADMIN_EMAIL = "admin@yds.com";
  const ADMIN_PASSWORD = "Admin@123"; // 🔴 CHANGE AFTER FIRST LOGIN

  const existingAdmin = await User.findOne({
    role: "SUPER_ADMIN",
  });

  if (existingAdmin) {
    console.log("✅ SUPER_ADMIN already exists");
    return;
  }

  await User.create({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD, // bcrypt auto-hash
    role: "SUPER_ADMIN",
    status: "APPROVED",
    isTempPassword: false,
  });

  console.log("🔥 DEFAULT SUPER_ADMIN CREATED");
  console.log("📧 Email:", ADMIN_EMAIL);
  console.log("🔑 Password:", ADMIN_PASSWORD);
};
