// AI Prompts and Rubrics for Candidate Evaluation

export const PROMPTS = {
  crisis: {
    id: "crisis",
    name: "Crisis Management",
    description:
      "Evaluate crisis decision-making and problem-solving under pressure",
    prompt: `You are the head of operations at a fintech startup. A critical system outage has occurred affecting 50,000 users. 
    
Scenario Details:
- Payment processing is down for 45 minutes
- Customers are unable to access their accounts
- Media is starting to pick up the story
- Your engineering team is investigating but the root cause is unclear
- You have 5 minutes to make initial decisions

Please respond with:
1. Your immediate actions (next 15 minutes)
2. Communication strategy (internal and external)
3. Timeline for resolution attempts
4. Risk mitigation steps
5. Post-incident analysis plan

Provide a detailed, structured response as if you were actually facing this crisis.`,
    rubric: {
      decisionMaking: {
        name: "Decision Making Under Pressure",
        maxScore: 20,
        criteria: [
          "Prioritizes critical actions immediately",
          "Makes decisions with incomplete information",
          "Shows logical reasoning",
          "Avoids panic or emotional responses",
        ],
      },
      communication: {
        name: "Communication Strategy",
        maxScore: 20,
        criteria: [
          "Clear internal communication plan",
          "Appropriate external messaging",
          "Considers stakeholder needs",
          "Transparent about limitations",
        ],
      },
      technicalAcumen: {
        name: "Technical Understanding",
        maxScore: 20,
        criteria: [
          "Demonstrates system knowledge",
          "Asks right diagnostic questions",
          "Understands escalation procedures",
          "Considers technical constraints",
        ],
      },
      leadership: {
        name: "Leadership & Team Management",
        maxScore: 20,
        criteria: [
          "Delegates effectively",
          "Empowers team members",
          "Maintains composure",
          "Sets clear expectations",
        ],
      },
      completeness: {
        name: "Response Completeness",
        maxScore: 20,
        criteria: [
          "Addresses all scenario aspects",
          "Provides specific examples",
          "Includes timelines",
          "Considers long-term impact",
        ],
      },
    },
  },

  sustainability: {
    id: "sustainability",
    name: "Sustainability & Social Impact",
    description:
      "Evaluate understanding of sustainable business practices and social responsibility",
    prompt: `You are joining a company as VP of Sustainability. The company is a fast-fashion retailer facing criticism for:
- High water consumption in manufacturing (15,000 liters per garment)
- Limited supply chain transparency
- Minimal recycling initiatives
- Labor concerns in overseas factories
- Carbon footprint of ~5kg CO2 per shipped item

You have a budget of $10M over 3 years to address these issues.

Please provide:
1. Root cause analysis of sustainability issues
2. Your top 5 priorities for the 3-year plan
3. Specific, measurable goals for each priority
4. Implementation timeline and dependencies
5. Expected business impact (costs/benefits)
6. How you would measure success
7. Stakeholder engagement strategy

Think strategically about what matters most and why.`,
    rubric: {
      analysis: {
        name: "Problem Analysis",
        maxScore: 15,
        criteria: [
          "Identifies root causes",
          "Understands interconnected issues",
          "Considers systemic challenges",
          "Shows systems thinking",
        ],
      },
      prioritization: {
        name: "Strategic Prioritization",
        maxScore: 20,
        criteria: [
          "Prioritizes high-impact initiatives",
          "Considers resource constraints",
          "Balances short and long-term goals",
          "Shows strategic thinking",
        ],
      },
      innovation: {
        name: "Innovation & Creativity",
        maxScore: 20,
        criteria: [
          "Proposes novel solutions",
          "Creative problem-solving",
          "Business model innovation",
          "Technology leveraging",
        ],
      },
      measurement: {
        name: "Measurement & Accountability",
        maxScore: 20,
        criteria: [
          "Clear, measurable KPIs",
          "Realistic targets",
          "Monitoring mechanisms",
          "Accountability structures",
        ],
      },
      businessAcumen: {
        name: "Business Understanding",
        maxScore: 25,
        criteria: [
          "Understands cost-benefit",
          "Considers competitive advantage",
          "Shows financial awareness",
          "Balances profit with purpose",
          "Considers market dynamics",
        ],
      },
    },
  },

  team: {
    id: "team",
    name: "Team Building & Collaboration",
    description:
      "Evaluate ability to build high-performing teams and foster collaboration",
    prompt: `You've been hired as a new Engineering Manager for a 12-person team at a SaaS company. 

Current Situation:
- Team is distributed across 3 time zones
- Recent product launch was delayed by 2 months
- Morale is low due to crunch period
- There's tension between frontend and backend developers
- Some team members are underperforming
- Two strong performers just gave notice
- The team has no documented processes or knowledge base
- Communication is fragmented across Slack, email, and Jira

Your first 90 days:

Please outline:
1. Diagnostic approach (how you'd assess the team)
2. Quick wins (first 30 days) to build trust
3. Process improvements to implement
4. How you'd address the departing talent
5. Strategy to rebuild morale
6. Team structure and role clarifications
7. Metrics for success
8. Long-term vision for the team

Show me how you'd thoughtfully approach this complex people problem.`,
    rubric: {
      empathy: {
        name: "Empathy & Listening",
        maxScore: 15,
        criteria: [
          "Recognizes team struggles",
          "Shows empathy for challenges",
          "Commits to listening",
          "Validates concerns",
        ],
      },
      diagnostics: {
        name: "Diagnostic Approach",
        maxScore: 20,
        criteria: [
          "Systematic assessment plan",
          "One-on-one engagement",
          "Data-driven decision making",
          "Identifies root causes",
        ],
      },
      execution: {
        name: "Execution & Quick Wins",
        maxScore: 20,
        criteria: [
          "Identifies achievable short-term goals",
          "Builds momentum quickly",
          "Shows operational excellence",
          "Delivers results",
        ],
      },
      culture: {
        name: "Culture & Trust Building",
        maxScore: 20,
        criteria: [
          "Creates psychological safety",
          "Promotes collaboration",
          "Addresses conflict constructively",
          "Models desired behaviors",
        ],
      },
      development: {
        name: "Team Development Strategy",
        maxScore: 25,
        criteria: [
          "Plans for growth and learning",
          "Addresses performance issues",
          "Retains top talent",
          "Creates clear career paths",
          "Invests in team capabilities",
        ],
      },
    },
  },
};

// Calculate total points for each prompt
export const PROMPT_TOTALS = Object.entries(PROMPTS).reduce(
  (acc, [key, prompt]) => {
    const total = Object.values(prompt.rubric).reduce(
      (sum, category) => sum + category.maxScore,
      0,
    );
    acc[key] = total;
    return acc;
  },
  {},
);

// Get prompt by ID
export function getPrompt(promptId) {
  return PROMPTS[promptId];
}

// Get all prompts
export function getAllPrompts() {
  return Object.values(PROMPTS);
}

// Validate response scores against rubric
export function validateScores(promptId, scores) {
  const prompt = getPrompt(promptId);
  if (!prompt) return false;

  const rubricKeys = Object.keys(prompt.rubric);
  const scoreKeys = Object.keys(scores);

  if (rubricKeys.length !== scoreKeys.length) return false;

  return rubricKeys.every((key) => {
    const maxScore = prompt.rubric[key].maxScore;
    const score = scores[key];
    return score >= 0 && score <= maxScore && typeof score === "number";
  });
}

// Calculate total score from rubric scores
export function calculateTotalScore(promptId, scores) {
  const prompt = getPrompt(promptId);
  if (!prompt) return 0;

  return Object.entries(scores).reduce((total, [key, score]) => {
    const maxScore = prompt.rubric[key]?.maxScore || 0;
    return total + (score || 0);
  }, 0);
}
