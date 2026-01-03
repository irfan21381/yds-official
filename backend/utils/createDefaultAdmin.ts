import User from "../models/User";

export const createDefaultAdmin = async () => {
  const adminEmail = "admin@yds.com";
  const adminPassword = "Admin@123"; // 🔐 CHANGE AFTER LOGIN

  const existingAdmin = await User.findOne({ role: "SUPER_ADMIN" });

  if (existingAdmin) {
    console.log("✅ Default admin already exists");
    return;
  }

  await User.create({
    email: adminEmail,
    password: adminPassword,
    role: "SUPER_ADMIN",
    status: "ACTIVE",
    isVerified: true,
  });

  console.log("🔥 DEFAULT ADMIN CREATED");
  console.log(`📧 Email: ${adminEmail}`);
  console.log(`🔑 Password: ${adminPassword}`);
};
