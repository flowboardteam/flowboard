// src/pages/dashboard/applications/mockApplications.ts

export type ApplicationStatus = 'Applied' | 'Shortlisted' | 'Interview' | 'Offer' | 'Rejected';

export const mockApplications = [
  {
    id: "app-1",
    jobTitle: "Senior Frontend Engineer",
    company: "TechFlow Systems",
    companyLogo: "TF",
    appliedDate: "Oct 20, 2025",
    status: "Interview" as ApplicationStatus,
    location: "Remote",
    salary: "$140k - $180k"
  },
  {
    id: "app-2",
    jobTitle: "Product Designer",
    company: "CreativeCloud",
    companyLogo: "CC",
    appliedDate: "Oct 18, 2025",
    status: "Shortlisted" as ApplicationStatus,
    location: "Accra, Ghana",
    salary: "$60k - $90k"
  },
  {
    id: "app-3",
    jobTitle: "Full Stack Developer",
    company: "DataSync",
    companyLogo: "DS",
    appliedDate: "Oct 15, 2025",
    status: "Applied" as ApplicationStatus,
    location: "Remote",
    salary: "$110k - $150k"
  },
  {
    id: "app-4",
    jobTitle: "Backend Lead",
    company: "MetaFlow",
    companyLogo: "MF",
    appliedDate: "Oct 10, 2025",
    status: "Rejected" as ApplicationStatus,
    location: "Lagos, Nigeria",
    salary: "$160k - $200k"
  }
];