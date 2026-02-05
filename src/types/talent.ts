export type TalentAvailability =
  | "FULL_TIME"
  | "CONTRACT"
  | "FREELANCE";

export interface Talent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  roleTitle: string;
  skills: string[];
  yearsOfExperience: number;
  availability: TalentAvailability;
  location: string;
  bio: string;
  profilePhotoUrl?: string;
  createdAt: string;
}
