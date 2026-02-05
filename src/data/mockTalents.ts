import { Talent } from "@/types/talent";

export const mockTalents: Talent[] = [
  {
    id: "1",
    firstName: "Ama",
    lastName: "Mensah",
    email: "ama@flowboard.dev",
    roleTitle: "Frontend Engineer",
    skills: ["React", "TypeScript", "Tailwind"],
    yearsOfExperience: 4,
    availability: "CONTRACT",
    location: "Accra, Ghana",
    bio: "Frontend engineer focused on scalable UI systems.",
    createdAt: new Date().toISOString(),
  },
];
