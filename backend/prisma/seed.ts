import { prisma } from "../src/db.js";
import { hashPassword } from "../src/lib/password.js";

const USER_EMAIL = "test1@gmail.com";
const USER_NAME = "Test One";
const USER_PASSWORD = "test1111";

const PATIENT_ID = "11111111-1111-4111-8111-111111111111";
const MED_PARACETAMOL_ID = "22222222-2222-4222-8222-222222222222";
const MED_ASPIRIN_ID = "33333333-3333-4333-8333-333333333333";
const SCHEDULE_ID = "44444444-4444-4444-8444-444444444444";
// ---------------------------------------------------------------------------

async function main() {
  // 1. Caregiver user
  const passwordHash = await hashPassword(USER_PASSWORD);
  const user = await prisma.user.upsert({
    where: { email: USER_EMAIL },
    update: { fullName: USER_NAME },
    create: { email: USER_EMAIL, fullName: USER_NAME, passwordHash },
  });

  // 2. Patient owned by that caregiver
  const patient = await prisma.patient.upsert({
    where: { id: PATIENT_ID },
    update: { fullName: "Elena Popescu", phoneNumber: "+40712345678" },
    create: {
      id: PATIENT_ID,
      fullName: "Elena Popescu",
      phoneNumber: "+40712345678",
      timezone: "Europe/Bucharest",
      language: "ro",
    },
  });

  await prisma.patientCaregiver.upsert({
    where: { userId_patientId: { userId: user.id, patientId: patient.id } },
    update: {},
    create: { userId: user.id, patientId: patient.id, role: "owner" },
  });

  // 3. Medications for the patient
  await prisma.medication.upsert({
    where: { id: MED_PARACETAMOL_ID },
    update: {},
    create: {
      id: MED_PARACETAMOL_ID,
      patientId: patient.id,
      name: "Paracetamol",
      amount: "500",
      unit: "mg",
      form: "tablet",
      instructions: "After meals",
    },
  });

  await prisma.medication.upsert({
    where: { id: MED_ASPIRIN_ID },
    update: {},
    create: {
      id: MED_ASPIRIN_ID,
      patientId: patient.id,
      name: "Aspirina",
      amount: "100",
      unit: "mg",
      form: "tablet",
    },
  });

  // 4. A weekday-morning schedule linking both medications
  const schedule = await prisma.schedule.upsert({
    where: { id: SCHEDULE_ID },
    update: {},
    create: {
      id: SCHEDULE_ID,
      patientId: patient.id,
      timeOfDay: new Date("1970-01-01T08:00:00.000Z"),
      daysOfWeek: [1, 2, 3, 4, 5],
      active: true,
    },
  });

  for (const medicationId of [MED_PARACETAMOL_ID, MED_ASPIRIN_ID]) {
    await prisma.scheduleMedication.upsert({
      where: {
        scheduleId_medicationId: { scheduleId: schedule.id, medicationId },
      },
      update: {},
      create: { scheduleId: schedule.id, medicationId },
    });
  }

  console.log(`Seeded caregiver ${USER_EMAIL} (password: ${USER_PASSWORD})`);
  console.log(`  → patient "${patient.fullName}" with 2 medications and 1 schedule`);
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());