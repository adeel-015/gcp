import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3002/api";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

export const candidateService = {
  getTopLeaderboard: () => api.get("/leaderboard/top10"),
  getLeaderboard: (page = 1, limit = 20) =>
    api.get("/leaderboard", { params: { page, limit } }),
  getCandidateById: (id) => api.get(`/candidates/${id}`),
  getCandidatesBySkill: (skill) => api.get(`/candidates/skill/${skill}`),
  getSharedCandidate: (token) => api.get(`/share/${token}`),
  searchCandidates: (query) => api.get("/search", { params: { q: query } }),
  shareCandidateProfile: (id) => api.post(`/candidates/${id}/share`),
};

export const promptService = {
  getAllPrompts: () => api.get("/prompts"),
  getPromptById: (id) => api.get(`/prompts/${id}`),
};

export const analyticsService = {
  getSkillDistribution: () => api.get("/analytics/skills"),
  getEvaluationMetrics: () => api.get("/analytics/evaluations"),
};

export default api;
