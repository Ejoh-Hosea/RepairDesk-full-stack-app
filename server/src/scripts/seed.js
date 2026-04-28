/**
 * Seed Script — populates the DB with an admin user and sample repairs.
 * Run with:  node src/scripts/seed.js
 *
 * Safe to re-run: skips existing users, clears and re-inserts repairs.
 */
import "../config/env.js"; // Load .env first
import mongoose from "mongoose";
import { config } from "../config/env.js";
import { User } from "../models/User.js";
import { Repair } from "../models/Repair.js";
import { ActivityLog } from "../models/ActivityLog.js";

const SAMPLE_REPAIRS = [
  {
    customerName: "Alice Martin",
    phoneModel: "iPhone 15 Pro",
    issue: "Cracked screen",
    cost: 45,
    price: 120,
    status: "done",
  },
  {
    customerName: "Bob Tremblay",
    phoneModel: "Samsung Galaxy S23",
    issue: "Battery replacement",
    cost: 30,
    price: 80,
    status: "in-progress",
  },
  {
    customerName: "Claire Dupont",
    phoneModel: "iPhone 14",
    issue: "Charging port repair",
    cost: 20,
    price: 65,
    status: "received",
  },
  {
    customerName: "Daniel Roy",
    phoneModel: "Google Pixel 8",
    issue: "Cracked screen",
    cost: 50,
    price: 130,
    status: "done",
  },
  {
    customerName: "Emma Lavoie",
    phoneModel: "iPhone 13 Mini",
    issue: "Water damage",
    cost: 60,
    price: 150,
    status: "in-progress",
  },
  {
    customerName: "François Gagne",
    phoneModel: "OnePlus 11",
    issue: "Battery replacement",
    cost: 28,
    price: 75,
    status: "received",
  },
  {
    customerName: "Grace Leblanc",
    phoneModel: "Samsung Galaxy A54",
    issue: "Speaker not working",
    cost: 15,
    price: 55,
    status: "done",
  },
  {
    customerName: "Hugo Bouchard",
    phoneModel: "iPhone 12",
    issue: "Face ID not working",
    cost: 55,
    price: 140,
    status: "received",
  },
  {
    customerName: "Isabelle Caron",
    phoneModel: "Xiaomi 13",
    issue: "Cracked screen",
    cost: 35,
    price: 95,
    status: "done",
  },
  {
    customerName: "Julien Morin",
    phoneModel: "iPhone 15",
    issue: "Charging port repair",
    cost: 22,
    price: 70,
    status: "in-progress",
  },
];

async function seed() {
  console.log("🌱 Connecting to MongoDB...");
  await mongoose.connect(config.mongoUri);
  console.log("✅ Connected\n");

  // --- Admin user ---
  const existing = await User.findOne({ username: "admin" });
  if (existing) {
    console.log("👤 Admin user already exists — skipping");
  } else {
    await User.create({
      username: "admin",
      password: "admin123",
      role: "admin",
    });
    console.log(
      "👤 Admin user created  →  username: admin  /  password: admin123",
    );
  }

  // --- Repairs ---
  console.log("\n🔧 Clearing existing repairs and activity logs...");
  await Repair.deleteMany({});
  await ActivityLog.deleteMany({});

  // Spread repairs over the last 7 days for realistic chart data
  const repairs = SAMPLE_REPAIRS.map((r, i) => {
    const d = new Date();
    d.setDate(d.getDate() - Math.floor(i / 1.5)); // Spread across ~7 days
    return { ...r, createdAt: d, updatedAt: d };
  });

  const created = await Repair.insertMany(repairs);
  console.log(`✅ Inserted ${created.length} sample repairs\n`);

  // --- Activity logs ---
  const logs = created.map((r) => ({
    action:
      r.status === "received" ? "repair_created" : "repair_status_changed",
    repairId: r._id,
    metadata: {
      customerName: r.customerName,
      phoneModel: r.phoneModel,
      issue: r.issue,
      newStatus: r.status,
    },
    createdAt: r.createdAt,
  }));
  await ActivityLog.insertMany(logs);
  console.log(`✅ Inserted ${logs.length} activity log entries`);

  console.log(
    "\n🎉 Seed complete! You can now log in at http://localhost:5173",
  );
  console.log("   username: admin");
  console.log("   password: admin123\n");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});
