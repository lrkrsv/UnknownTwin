/** Demo seed users — Milestone 1 spec credentials */
export const SEED_USERS = [
  {
    email: "admin@demo.test",
    password: "admin1234",
    fullName: "Demo Admin",
    role: "admin" as const,
  },
  {
    email: "mentor@demo.test",
    password: "mentor1234",
    fullName: "Demo Mentor",
    role: "mentor" as const,
  },
  {
    email: "student@demo.test",
    password: "student1234",
    fullName: "Demo Student",
    role: "student" as const,
  },
];
