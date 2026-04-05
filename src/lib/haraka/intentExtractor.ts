export async function intentExtractor(prompt: string) {
  // TEMP: Replace with real LLM call later

  return {
    role_title: "Senior AI Engineer",
    seniority: "Senior",
    must_have_skills: ["LLM Training", "PyTorch", "Distributed Systems"],
    nice_to_have_skills: ["Kubernetes", "MLOps"],
    location: "Remote",
    urgency: "High",
    raw_prompt: prompt,
  };
}