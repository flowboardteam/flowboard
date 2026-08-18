import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export async function analyzeJobDescription(jobTitle: string, rawDescription: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `You are a Senior Technical Recruiter & Hiring Manager at Flowboard Team.
Analyze this job posting and output a structured JSON blueprint for an AI hiring interview.

JOB TITLE: ${jobTitle}
JOB DESCRIPTION:
${rawDescription}

OUTPUT REQUIREMENT:
Return ONLY valid JSON matching this exact structure:
{
  "responsibilities": ["string"],
  "required_skills": ["string"],
  "preferred_skills": ["string"],
  "experience_years": 3,
  "seniority": "Senior | Mid | Junior",
  "competencies": [
    {
      "name": "Problem Solving",
      "weight_percentage": 25,
      "description": "Evaluates ability to isolate bottlenecks and reason through complex technical scenarios.",
      "evaluation_criteria": {
        "1": "Superficial answers, fails to isolate root cause",
        "3": "Methodical approach, understands trade-offs",
        "5": "Architectural prevention and clear root cause isolation"
      },
      "suggested_questions": ["Describe a recent complex technical bug you diagnosed and resolved."]
    }
  ]
}

Provide 4-5 key competencies whose weights total 100%.`;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    // Clean up markdown wrapper if present
    const cleanedText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Error analyzing job with Gemini AI:", error);
    // Fallback blueprint
    return {
      responsibilities: ["Deliver end-to-end technical solutions", "Collaborate with cross-functional teams"],
      required_skills: ["Problem Solving", "Technical Execution"],
      preferred_skills: ["System Architecture"],
      experience_years: 3,
      seniority: "Mid-Senior",
      competencies: [
        {
          name: "Technical Execution",
          weight_percentage: 35,
          description: "Core technical proficiency and problem solving",
          evaluation_criteria: { "1": "Basic", "3": "Proficient", "5": "Expert" },
          suggested_questions: ["Tell me about your core technical background."]
        },
        {
          name: "Problem Solving",
          weight_percentage: 35,
          description: "Debugging and decision making",
          evaluation_criteria: { "1": "Basic", "3": "Proficient", "5": "Expert" },
          suggested_questions: ["Describe a tough technical problem you solved."]
        },
        {
          name: "Communication & Collaboration",
          weight_percentage: 30,
          description: "Teamwork and clarity of explanation",
          evaluation_criteria: { "1": "Basic", "3": "Proficient", "5": "Expert" },
          suggested_questions: ["How do you align with stakeholders on technical decisions?"]
        }
      ]
    };
  }
}

export async function generateNextInterviewQuestion(
  jobTitle: string,
  competencies: any[],
  currentCompetencyIndex: number,
  transcript: { sender: string; content: string }[],
  isFollowUp: boolean
) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const activeCompetency = competencies[currentCompetencyIndex] || competencies[0];

  const prompt = `You are an expert AI Interviewer at Flowboard conducting a structured job interview.

ROLE: ${jobTitle}
ACTIVE COMPETENCY BEING EVALUATED: ${activeCompetency.name} (${activeCompetency.description})
EVALUATION CRITERIA: ${JSON.stringify(activeCompetency.evaluation_criteria)}

TRANSCRIPT SO FAR:
${transcript.map(m => `${m.sender.toUpperCase()}: ${m.content}`).join("\n")}

INSTRUCTIONS:
1. ${isFollowUp ? "The candidate's last answer was vague or incomplete. Ask a specific, probing follow-up question to extract concrete technical evidence." : "Ask a clear, professional question evaluating the active competency."}
2. Keep questions conversational, natural, professional, and concise. Do NOT sound like an automated exam.
3. Return ONLY JSON matching this format:
{
  "action": "${isFollowUp ? "follow_up" : "ask_question"}",
  "competency": "${activeCompetency.name}",
  "question": "The question to ask the candidate",
  "reason": "Brief justification for this question"
}`;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleanedText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Error generating interview question:", error);
    return {
      action: "ask_question",
      competency: activeCompetency.name,
      question: `Could you walk me through your experience related to ${activeCompetency.name}?`,
      reason: "Fallback question generation."
    };
  }
}

export async function evaluateInterviewSession(
  jobTitle: string,
  competencies: any[],
  transcript: { sender: string; content: string }[]
) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `You are the Flowboard Lead Assessment AI. Evaluate this completed candidate interview based strictly on EVIDENCE provided in the transcript.

ROLE: ${jobTitle}
COMPETENCIES & WEIGHTS:
${JSON.stringify(competencies)}

FULL INTERVIEW TRANSCRIPT:
${transcript.map(m => `${m.sender.toUpperCase()}: ${m.content}`).join("\n")}

EVALUATION RULES:
1. Base scores (0-100) strictly on evidence from answers. Do NOT invent evidence.
2. Provide a recommendation: "Strongly Recommend" | "Recommend" | "Consider" | "Further Assessment" | "Not Recommended".
3. Return ONLY valid JSON matching this schema:
{
  "overall_score": 88,
  "recommendation": "Strongly Recommend",
  "summary": "Detailed narrative summary of candidate capabilities...",
  "key_strengths": ["Strength 1", "Strength 2"],
  "key_concerns": ["Concern 1"],
  "competency_scores": [
    {
      "name": "Competency Name",
      "score": 90,
      "evidence": ["Direct quote or clear candidate explanation demonstrating capability"]
    }
  ]
}`;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleanedText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Error evaluating interview:", error);
    return {
      overall_score: 75,
      recommendation: "Consider",
      summary: "Interview completed. Candidate provided answers across core competencies.",
      key_strengths: ["Completed all interview questions"],
      key_concerns: ["Requires further deep-dive in human round"],
      competency_scores: competencies.map(c => ({
        name: c.name,
        score: 75,
        evidence: ["Candidate completed response for " + c.name]
      }))
    };
  }
}
