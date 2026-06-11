import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const groups = [
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

const matchdayDates = {
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

  await prisma.prediction.deleteMany();
  await prisma.match.deleteMany();
  await prisma.user.deleteMany();

  const adminPassword = await bcrypt.hash("admin123", 10);
  await prisma.user.create({
    data: { email: "admin@prode.com", name: "Admin", password: adminPassword, role: "ADMIN" },
  });

  const demoPassword = await bcrypt.hash("demo123", 10);
  await prisma.user.create({
    data: { email: "demo@prode.com", name: "Demo User", password: demoPassword, role: "USER" },
  });

  for (const { group, teams } of groups) {
    const [t1, t2, t3, t4] = teams;
    const dates = matchdayDates[group];

    const matchesData = [
      { homeTeam: t1, awayTeam: t2, matchday: 1, date: dates[1] },
      { homeTeam: t3, awayTeam: t4, matchday: 1, date: dates[1] },
      { homeTeam: t1, awayTeam: t3, matchday: 2, date: dates[2] },
      { homeTeam: t2, awayTeam: t4, matchday: 2, date: dates[2] },
      { homeTeam: t1, awayTeam: t4, matchday: 3, date: dates[3] },
      { homeTeam: t2, awayTeam: t3, matchday: 3, date: dates[3] },
    ];

    for (const m of matchesData) {
      await prisma.match.create({
        data: { ...m, group, stage: "GROUP", date: new Date(m.date) },
      });
    }
  }

  const count = await prisma.match.count();
  console.log(`Created ${count} matches across 12 groups.`);
  console.log("Admin: admin@prode.com / admin123");
  console.log("Demo:  demo@prode.com  / demo123");
  console.log("Done!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
