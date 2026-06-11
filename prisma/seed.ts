import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// 48 teams across 12 groups (A-L), 4 teams each
// Mixed confederations for competitive variety
const groups: { group: string; teams: string[] }[] = [
  { group: "A", teams: ["Mexico", "Poland", "Saudi Arabia", "Cameroon"] },
  { group: "B", teams: ["USA", "Serbia", "Morocco", "New Zealand"] },
  { group: "C", teams: ["Canada", "Belgium", "Japan", "Peru"] },
  { group: "D", teams: ["Brazil", "Switzerland", "Iran", "South Africa"] },
  { group: "E", teams: ["Argentina", "Croatia", "Nigeria", "Qatar"] },
  { group: "F", teams: ["France", "Australia", "Ecuador", "Slovakia"] },
  { group: "G", teams: ["Spain", "Uruguay", "South Korea", "Jamaica"] },
  { group: "H", teams: ["England", "Netherlands", "Senegal", "Bolivia"] },
  { group: "I", teams: ["Germany", "Colombia", "Egypt", "China"] },
  { group: "J", teams: ["Portugal", "Denmark", "Venezuela", "Uzbekistan"] },
  { group: "K", teams: ["Italy", "Sweden", "Honduras", "Paraguay"] },
  { group: "L", teams: ["Romania", "Scotland", "Chile", "Costa Rica"] },
];

// Each group plays 3 matchdays, 3 games per matchday across all groups
// Group stage: June 12 - June 30, 2026
// We'll distribute: matchday 1 = June 12-16, matchday 2 = June 17-22, matchday 3 = June 25-30

const matchdayDates: Record<string, Record<number, string>> = {
  A: { 1: "2026-06-12", 2: "2026-06-17", 3: "2026-06-25" },
  B: { 1: "2026-06-12", 2: "2026-06-18", 3: "2026-06-25" },
  C: { 1: "2026-06-13", 2: "2026-06-18", 3: "2026-06-26" },
  D: { 1: "2026-06-13", 2: "2026-06-19", 3: "2026-06-26" },
  E: { 1: "2026-06-14", 2: "2026-06-19", 3: "2026-06-27" },
  F: { 1: "2026-06-14", 2: "2026-06-20", 3: "2026-06-27" },
  G: { 1: "2026-06-15", 2: "2026-06-20", 3: "2026-06-28" },
  H: { 1: "2026-06-15", 2: "2026-06-21", 3: "2026-06-28" },
  I: { 1: "2026-06-16", 2: "2026-06-21", 3: "2026-06-29" },
  J: { 1: "2026-06-16", 2: "2026-06-22", 3: "2026-06-29" },
  K: { 1: "2026-06-17", 2: "2026-06-22", 3: "2026-06-30" },
  L: { 1: "2026-06-17", 2: "2026-06-23", 3: "2026-06-30" },
};

async function main() {
  console.log("Seeding database...");

  // Clear existing data
  await prisma.prediction.deleteMany();
  await prisma.match.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 10);
  await prisma.user.create({
    data: {
      email: "admin@prode.com",
      name: "Admin",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  // Create a demo user
  const demoPassword = await bcrypt.hash("demo123", 10);
  await prisma.user.create({
    data: {
      email: "demo@prode.com",
      name: "Demo User",
      password: demoPassword,
      role: "USER",
    },
  });

  // Create matches for all groups
  for (const { group, teams } of groups) {
    const [t1, t2, t3, t4] = teams;
    const dates = matchdayDates[group];

    // Matchday 1: t1 vs t2, t3 vs t4
    await prisma.match.create({
      data: {
        homeTeam: t1,
        awayTeam: t2,
        group,
        matchday: 1,
        date: new Date(dates[1]),
        stage: "GROUP",
      },
    });
    await prisma.match.create({
      data: {
        homeTeam: t3,
        awayTeam: t4,
        group,
        matchday: 1,
        date: new Date(dates[1]),
        stage: "GROUP",
      },
    });

    // Matchday 2: t1 vs t3, t2 vs t4
    await prisma.match.create({
      data: {
        homeTeam: t1,
        awayTeam: t3,
        group,
        matchday: 2,
        date: new Date(dates[2]),
        stage: "GROUP",
      },
    });
    await prisma.match.create({
      data: {
        homeTeam: t2,
        awayTeam: t4,
        group,
        matchday: 2,
        date: new Date(dates[2]),
        stage: "GROUP",
      },
    });

    // Matchday 3: t1 vs t4, t2 vs t3 (simultaneous)
    await prisma.match.create({
      data: {
        homeTeam: t1,
        awayTeam: t4,
        group,
        matchday: 3,
        date: new Date(dates[3]),
        stage: "GROUP",
      },
    });
    await prisma.match.create({
      data: {
        homeTeam: t2,
        awayTeam: t3,
        group,
        matchday: 3,
        date: new Date(dates[3]),
        stage: "GROUP",
      },
    });
  }

  const matchCount = await prisma.match.count();
  console.log(`Created ${matchCount} matches across 12 groups.`);
  console.log("Admin: admin@prode.com / admin123");
  console.log("Demo:  demo@prode.com / demo123");
  console.log("Done!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
