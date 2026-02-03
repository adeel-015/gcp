# API Documentation

## Base URL

```
http://localhost:3002/api
```

## Authentication

Currently, all endpoints are public. For production, implement JWT authentication.

---

## Endpoints

### Health Check

#### `GET /health`

Check API server status.

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2024-02-01T12:00:00.000Z"
}
```

---

## Prompts

### Get All Prompts

#### `GET /prompts`

Retrieve all evaluation prompts with their rubrics.

**Response:**

```json
[
  {
    "id": "crisis",
    "name": "Crisis Management",
    "description": "Evaluate crisis decision-making and problem-solving under pressure",
    "rubric": {
      "decisionMaking": {
        "name": "Decision Making Under Pressure",
        "maxScore": 20,
        "criteria": [...]
      },
      "communication": { ... },
      "technicalAcumen": { ... },
      "leadership": { ... },
      "completeness": { ... }
    }
  },
  {
    "id": "sustainability",
    "name": "Sustainability & Social Impact",
    ...
  },
  {
    "id": "team",
    "name": "Team Building & Collaboration",
    ...
  }
]
```

### Get Single Prompt

#### `GET /prompts/:id`

Retrieve a specific prompt with full details and evaluation prompt text.

**Parameters:**

- `id` (string): Prompt ID - `crisis`, `sustainability`, or `team`

**Response:**

```json
{
  "id": "crisis",
  "name": "Crisis Management",
  "description": "Evaluate crisis decision-making...",
  "prompt": "You are the head of operations at a fintech startup...",
  "rubric": { ... }
}
```

**Example:**

```bash
curl http://localhost:3001/api/prompts/crisis
```

---

## Candidates

### Get Candidate by ID

#### `GET /candidates/:id`

Retrieve detailed candidate profile with all evaluations and ranking.

**Parameters:**

- `id` (integer): Candidate ID

**Response:**

```json
{
  "id": 1,
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone": "555-0123",
  "location": "San Francisco, CA",
  "bio": "Experienced software engineer...",
  "avatar_url": "https://example.com/avatar.jpg",
  "years_experience": 8,
  "primary_skill": "React",
  "secondary_skills": ["TypeScript", "Node.js", "AWS"],
  "linkedin_url": "https://linkedin.com/in/johndoe",
  "github_url": "https://github.com/johndoe",
  "website_url": "https://johndoe.dev",
  "evaluations": [
    {
      "id": 1,
      "prompt_type": "crisis",
      "total_score": 85.5,
      "rubric_scores": {
        "decisionMaking": 18,
        "communication": 19,
        "technicalAcumen": 17,
        "leadership": 19,
        "completeness": 17.5
      },
      "response": "As a leader...",
      "evaluator_notes": "Strong decision maker...",
      "created_at": "2024-02-01T10:00:00Z"
    }
  ],
  "ranking": {
    "id": 1,
    "candidate_id": 1,
    "overall_score": 85.2,
    "crisis_score": 85.5,
    "sustainability_score": 84.0,
    "team_score": 86.0,
    "rank": 5,
    "percentile": 87.5,
    "is_featured": true,
    "is_shared": false,
    "share_token": null,
    "last_shared_at": null
  }
}
```

### Get Candidates by Skill

#### `GET /candidates/skill/:skill`

Retrieve all candidates with a specific primary or secondary skill.

**Parameters:**

- `skill` (string): Skill name (e.g., "React", "Python")

**Query Parameters:**

- `limit` (integer, optional): Max results (default: 50)

**Response:**

```json
[
  {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "primary_skill": "React",
    "overall_score": 85.2,
    "rank": 5
  },
  {
    "id": 5,
    "first_name": "Jane",
    "last_name": "Smith",
    "secondary_skills": ["React", "Vue.js"],
    "overall_score": 82.1,
    "rank": 12
  }
]
```

**Example:**

```bash
curl "http://localhost:3001/api/candidates/skill/React"
```

### Search Candidates

#### `GET /search`

Full-text search candidates by name, email, or skill.

**Query Parameters:**

- `q` (string, required): Search query

**Response:**

```json
[
  {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "primary_skill": "React",
    "avatar_url": "...",
    "location": "San Francisco, CA",
    "overall_score": 85.2,
    "rank": 5
  }
]
```

**Example:**

```bash
curl "http://localhost:3001/api/search?q=john"
```

---

## Leaderboard

### Get Top 10

#### `GET /leaderboard/top10`

Retrieve top 10 ranked candidates.

**Response:**

```json
[
  {
    "rank": 1,
    "overall_score": 92.5,
    "crisis_score": 93.0,
    "sustainability_score": 91.5,
    "team_score": 93.0,
    "percentile": 100,
    "id": 3,
    "first_name": "Alice",
    "last_name": "Johnson",
    "email": "alice@example.com",
    "primary_skill": "Leadership",
    "avatar_url": "...",
    "location": "New York, NY",
    "years_experience": 12
  },
  {
    "rank": 2,
    "overall_score": 90.1,
    ...
  }
]
```

### Get Paginated Leaderboard

#### `GET /leaderboard`

Retrieve paginated leaderboard with all candidates ranked.

**Query Parameters:**

- `page` (integer, optional): Page number (default: 1)
- `limit` (integer, optional): Results per page (default: 20)

**Response:**

```json
{
  "data": [
    {
      "rank": 1,
      "overall_score": 92.5,
      "crisis_score": 93.0,
      "sustainability_score": 91.5,
      "team_score": 93.0,
      "percentile": 100,
      "id": 3,
      "first_name": "Alice",
      "last_name": "Johnson",
      ...
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 40,
    "pages": 2
  }
}
```

**Example:**

```bash
curl "http://localhost:3001/api/leaderboard?page=1&limit=20"
```

---

## Analytics

### Get Skill Distribution

#### `GET /analytics/skills`

Retrieve skill distribution across all candidates with average scores.

**Response:**

```json
[
  {
    "skill": "React",
    "count": 8,
    "avg_score": 84.3
  },
  {
    "skill": "Python",
    "count": 7,
    "avg_score": 82.1
  },
  {
    "skill": "TypeScript",
    "count": 6,
    "avg_score": 85.7
  }
]
```

**Sorted by:** Candidate count (descending)

### Get Evaluation Metrics

#### `GET /analytics/evaluations`

Retrieve aggregate metrics for each prompt type.

**Response:**

```json
[
  {
    "prompt_type": "crisis",
    "count": 40,
    "avg_score": 84.5,
    "min_score": 62.3,
    "max_score": 95.0
  },
  {
    "prompt_type": "sustainability",
    "count": 40,
    "avg_score": 83.2,
    "min_score": 58.5,
    "max_score": 93.5
  },
  {
    "prompt_type": "team",
    "count": 40,
    "avg_score": 85.1,
    "min_score": 61.0,
    "max_score": 94.2
  }
]
```

---

## Share & Public Access

### Generate Share Link

#### `POST /candidates/:id/share`

Create a shareable link for a candidate's profile.

**Parameters:**

- `id` (integer): Candidate ID

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "shareToken": "550e8400-e29b-41d4-a716-446655440000",
  "shareUrl": "http://localhost:5173/share/550e8400-e29b-41d4-a716-446655440000"
}
```

**Example:**

```bash
curl -X POST http://localhost:3001/api/candidates/1/share
```

### Access Shared Profile

#### `GET /share/:token`

Retrieve candidate profile using share token (public endpoint).

**Parameters:**

- `token` (string): Share token from generate endpoint

**Response:**

```json
{
  "id": 1,
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "avatar_url": "...",
  "evaluations": [ ... ],
  "ranking": { ... }
}
```

**Example:**

```bash
curl http://localhost:3001/api/share/550e8400-e29b-41d4-a716-446655440000
```

---

## Error Handling

All endpoints return appropriate HTTP status codes:

- **200 OK** - Successful request
- **404 Not Found** - Resource doesn't exist
- **500 Internal Server Error** - Server error

### Error Response Format

```json
{
  "error": "Resource not found"
}
```

### Common Errors

| Status | Message                 | Cause                    |
| ------ | ----------------------- | ------------------------ |
| 404    | "Prompt not found"      | Invalid prompt ID        |
| 404    | "Candidate not found"   | Invalid candidate ID     |
| 404    | "Share token not found" | Invalid share token      |
| 500    | "Internal server error" | Database or server error |

---

## Rate Limiting

Currently not implemented. For production:

- Implement rate limiting (100 req/min per IP)
- Use Redis for distributed rate limiting
- Whitelist analytics endpoints for internal use

---

## CORS

CORS is enabled for all origins. For production, configure whitelist:

```javascript
cors({
  origin: ["https://evaluator.example.com"],
  credentials: true,
});
```

---

## Authentication (Future)

Recommended implementation for production:

```bash
# Request
Authorization: Bearer {jwt_token}

# Response (401 Unauthorized)
{
  "error": "Invalid or missing token"
}
```

---

## Pagination

All list endpoints support pagination:

```
?page=1&limit=20
```

- Default page: 1
- Default limit: 20
- Max limit: 100

**Response includes:**

```json
{
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

---

## Caching

Implement response caching for performance:

```bash
# Frontend
Cache-Control: max-age=300  # 5 minutes

# Leaderboard (less frequent updates)
Cache-Control: max-age=600  # 10 minutes

# Share links (immutable)
Cache-Control: max-age=31536000  # 1 year
```

---

## Examples

### JavaScript/Node.js

```javascript
const axios = require("axios");

const api = axios.create({
  baseURL: "http://localhost:3001/api",
});

// Get top 10
const top10 = await api.get("/leaderboard/top10");
console.log(top10.data);

// Get candidate
const candidate = await api.get("/candidates/1");
console.log(candidate.data);

// Search
const results = await api.get("/search", {
  params: { q: "javascript" },
});
console.log(results.data);

// Share profile
const share = await api.post("/candidates/1/share");
console.log(share.data.shareUrl);
```

### cURL

```bash
# Get top 10
curl http://localhost:3001/api/leaderboard/top10

# Get candidate with evaluations
curl http://localhost:3001/api/candidates/1

# Search candidates
curl "http://localhost:3001/api/search?q=react"

# Get skill distribution
curl http://localhost:3001/api/analytics/skills

# Generate share link
curl -X POST http://localhost:3001/api/candidates/1/share

# Access shared profile
curl http://localhost:3001/api/share/{token}
```

---

## Database Schema Reference

### Score Breakdown

**Total Maximum Points per Prompt:**

- Crisis: 100 points
- Sustainability: 100 points
- Team: 100 points

**Overall Score:** Average across all 3 prompts

**Percentile:** Calculated ranking position

---

## Performance Considerations

- Leaderboard queries use indexes on `overall_score` and `rank`
- Candidate search uses LIKE on indexed `primary_skill`
- Analytics queries aggregated efficiently with GROUP BY
- Connection pooling (10 max) for concurrent requests

---

**API Version:** 1.0  
**Last Updated:** Feb 2024
