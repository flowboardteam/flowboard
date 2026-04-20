export type ContractType = "human" | "ai-assisted" | "full";

export interface Contract {
  id: string;
  orgId: string;
  orgName: string;
  orgLogo: string;
  role: string;
  rate: string;
  duration: string;
  location: string;
  type: ContractType;
  aiMatchScore: number;
  skills: string[];
  description: string;
  complianceLevel: "standard" | "high" | "elite";
}

export const MOCK_CONTRACTS_DB: Contract[] = [
  {
    id: "cnt_001",
    orgId: "org_bolt",
    orgName: "Bolt Systems",
    orgLogo: "https://api.dicebear.com/7.x/initials/svg?seed=BS&backgroundColor=00a86b",
    role: "Senior Full-stack Engineer",
    rate: "$7,500",
    duration: "Monthly",
    location: "Remote",
    type: "human",
    aiMatchScore: 98,
    skills: ["React", "TypeScript", "Node.js"],
    description: "Leading the development of decentralized payment rails for hybrid workforce units.",
    complianceLevel: "high"
  },
  {
    id: "cnt_002",
    orgId: "org_aether",
    orgName: "Aether Dynamics",
    orgLogo: "https://api.dicebear.com/7.x/initials/svg?seed=AD&backgroundColor=3b82f6",
    role: "AI Integration Specialist",
    rate: "$9,000",
    duration: "Monthly",
    location: "Remote",
    type: "ai-assisted",
    aiMatchScore: 82,
    skills: ["Python", "LLMs", "Vector DBs", "FastAPI"],
    description: "Architecting the handshake between human operators and autonomous agents.",
    complianceLevel: "elite"
  }
];