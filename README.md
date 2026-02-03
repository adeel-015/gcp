# Candidate Evaluation Platform

A comprehensive full-stack application for evaluating candidates across three key dimensions: **Crisis Management**, **Sustainability**, and **Team Building**. Features an AI-driven evaluation system with a modern React dashboard.

## 🎯 Overview

This platform enables:

- **40+ Candidate Profiles** - Realistic faker-generated profiles with skills and experience
- **3 Evaluation Prompts** - Crisis, Sustainability, and Team Building scenarios with detailed rubrics
- **Automated Scoring** - Mock evaluator populates scores based on rubric criteria
- **Interactive Dashboard** - Real-time leaderboards, skill analysis, and candidate cards
- **Share Profiles** - Generate shareable links for candidate evaluation results
- **Analytics** - Skill distribution heatmaps and evaluation metrics

## Project Screenshots

![Screenshot](https://github.com/adeel-015/gcp/blob/master/screenshots/gcp_1.png)
![Screenshot](https://github.com/adeel-015/gcp/blob/master/screenshots/gcp_2.png)
![Screenshot](https://github.com/adeel-015/gcp/blob/master/screenshots/gcp_3.png)

## Project Video

[![Watch the video](https://img.youtube.com/vi/TzoEru0kOVw/maxresdefault.jpg)](https://www.youtube.com)

## 📋 Project Structure

```
├── backend/
│   ├── schema.sql              # MySQL database schema with triggers
│   ├── db.js                   # Database connection pool
│   ├── prompts.js              # AI prompts and rubrics
│   ├── server.js               # Express API server
│   ├── package.json
│   ├── .env                    # Database credentials
│   └── scripts/
│       ├── initDb.js           # Initialize database
│       ├── seed.js             # Seed 40 faker profiles
│       └── mockEvaluator.js    # Generate mock evaluations
│
└── frontend/
    ├── src/
    │   ├── App.jsx             # Main app with routing
    │   ├── main.jsx            # React entry point
    │   ├── pages/
    │   │   ├── Dashboard.jsx    # Main dashboard
    │   │   └── SharedProfile.jsx # Public profile view
    │   ├── components/
    │   │   ├── Leaderboard.jsx  # Top 10 rankings
    │   │   ├── SkillHeatmap.jsx # Analytics visualizations
    │   │   └── CandidateCard.jsx # Candidate cards with share
    │   └── services/
    │       └── api.js           # API client
    ├── index.html
    ├── vite.config.js
    ├── postcss.config.cjs
    └── package.json
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+
- **MySQL** 8.0+
- **npm** or **yarn**

### Backend Setup

1. **Install dependencies**

   ```bash
   cd backend
   npm install
   ```

2. **Configure database** (update `.env` if needed)

   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=password
   DB_NAME=evaluator_db
   PORT=3001
   FRONTEND_URL=http://localhost:5173
   ```

3. **Initialize database**

   ```bash
   npm run init-db
   ```

   This creates tables with indexes and triggers.

4. **Seed candidate profiles**

   ```bash
   npm run seed
   ```

   Generates 40 realistic profiles with Faker.js

5. **Populate mock evaluations**

   ```bash
   npm run evaluate
   ```

   Creates evaluations for all prompts with scoring.

6. **Start server**
   ```bash
   npm run dev
   ```
   Server runs on `http://localhost:3001`

### Frontend Setup

1. **Install dependencies**

   ```bash
   cd frontend
   npm install
   ```

2. **Start development server**

   ```bash
   npm run dev
   ```

   Dashboard available at `http://localhost:5173`

3. **Build for production**
   ```bash
   npm run build
   ```

## 📚 AI Prompts & Rubrics

### 1. Crisis Management (100 points)

**Scenario:** System outage affecting 50,000 users for 45 minutes

**Rubric Categories:**

- **Decision Making Under Pressure** (20 pts) - Immediate actions, logical reasoning
- **Communication Strategy** (20 pts) - Internal and external messaging
- **Technical Understanding** (20 pts) - System knowledge, diagnostics
- **Leadership** (20 pts) - Team delegation, composure
- **Response Completeness** (20 pts) - Addresses all aspects

**Key Evaluation Criteria:**

- Prioritizes critical actions immediately
- Makes decisions with incomplete information
- Clear communication strategy for stakeholders
- Shows technical system knowledge
- Demonstrates composed leadership

### 2. Sustainability (100 points)

**Scenario:** VP role reducing water consumption (15,000L per garment) and improving supply chain

**Rubric Categories:**

- **Problem Analysis** (15 pts) - Root cause identification
- **Strategic Prioritization** (20 pts) - High-impact initiatives
- **Innovation** (20 pts) - Novel solutions
- **Measurement** (20 pts) - KPIs and accountability
- **Business Acumen** (25 pts) - Financial and competitive understanding

**Key Evaluation Criteria:**

- Identifies interconnected sustainability issues
- Prioritizes high-impact initiatives within budget
- Proposes creative, implementable solutions
- Sets clear, measurable KPIs
- Balances profit with environmental/social purpose

### 3. Team Building (100 points)

**Scenario:** New Engineering Manager with low morale, departing talent, and process issues

**Rubric Categories:**

- **Empathy & Listening** (15 pts) - Recognizes struggles
- **Diagnostic Approach** (20 pts) - Assessment methodology
- **Execution** (20 pts) - Quick wins and momentum
- **Culture** (20 pts) - Trust and collaboration
- **Team Development** (25 pts) - Growth and retention

**Key Evaluation Criteria:**

- Shows genuine empathy for team challenges
- Systematic 1-on-1 assessment plan
- Quick, achievable wins in first 30 days
- Creates psychological safety and collaboration
- Develops clear growth paths for team members

## 🗄️ Database Schema

### Candidates Table

```sql
- id (INT, PK)
- first_name, last_name (VARCHAR)
- email (VARCHAR, UNIQUE)
- phone, location (VARCHAR)
- bio, avatar_url (TEXT/VARCHAR)
- years_experience (INT)
- primary_skill, secondary_skills (VARCHAR, JSON)
- linkedin_url, github_url, website_url (VARCHAR)
```

### Evaluations Table

```sql
- id (INT, PK)
- candidate_id (INT, FK)
- prompt_type (ENUM: crisis, sustainability, team)
- response (TEXT)
- rubric_scores (JSON)
- total_score (DECIMAL)
- evaluator_notes (TEXT)
- UNIQUE(candidate_id, prompt_type)
```

### Rankings Table

```sql
- id (INT, PK)
- candidate_id (INT, FK, UNIQUE)
- overall_score (DECIMAL)
- crisis_score, sustainability_score, team_score (DECIMAL)
- rank (GENERATED - ROW_NUMBER)
- percentile (DECIMAL)
- is_featured, is_shared (BOOLEAN)
- share_token (VARCHAR, UNIQUE)
- last_shared_at (TIMESTAMP)
```

### Triggers

**update_rankings_on_eval_insert** - Auto-calculates overall score when evaluation created
**update_rankings_on_eval_update** - Recalculates when evaluation updated

## 🔌 API Endpoints

### Candidates

- `GET /api/candidates/:id` - Candidate details with evaluations
- `GET /api/candidates/skill/:skill` - Candidates by skill
- `GET /api/search?q=query` - Search candidates

### Leaderboard

- `GET /api/leaderboard/top10` - Top 10 performers
- `GET /api/leaderboard?page=1&limit=20` - Paginated leaderboard

### Prompts

- `GET /api/prompts` - All prompts with rubrics
- `GET /api/prompts/:id` - Single prompt details

### Analytics

- `GET /api/analytics/skills` - Skill distribution
- `GET /api/analytics/evaluations` - Evaluation metrics

### Sharing

- `POST /api/candidates/:id/share` - Generate share token
- `GET /api/share/:token` - Access shared profile

## 🎨 Frontend Features

### Dashboard (Overview Tab)

- Search candidates by name, skill, email
- Top 10 leaderboard preview
- Featured candidate cards
- Quick access to all sections

### Full Leaderboard

- Complete ranked list with pagination
- Individual scores (Crisis, Sustainability, Team)
- Progress indicators
- Skill badges

### Analytics

- **Skills Heatmap** - Distribution and average scores
- **Bar Charts** - Candidate count and performance by skill
- **Evaluation Metrics** - Statistics for each prompt type
- **RingProgress** - Skill concentration visualization

### Candidate Cards

- Profile with avatar and bio
- Skill badges (primary + secondary)
- Evaluation scores with progress bars
- Social links (LinkedIn, GitHub, website)
- Share button with copy-to-clipboard

### Shared Profiles (Public)

- Display without authentication
- All evaluation details and scores
- Rubric breakdowns per prompt
- Contact information
- Social/web links

## 🔄 Data Flow

1. **Initialization**
   - Create MySQL database and schema
   - Set up triggers for automatic ranking

2. **Seeding**
   - Generate 40 fake candidates with Faker.js
   - Insert profiles with realistic details

3. **Evaluation**
   - Mock evaluator generates responses for each prompt
   - Scores assigned per rubric category
   - Total score calculated
   - Triggers auto-update rankings

4. **Frontend**
   - API fetches candidates and evaluations
   - Components render leaderboards and analytics
   - User can search, filter, and share profiles

## 🔐 Security Considerations

- Share tokens are UUID v4 (unique, non-sequential)
- Database credentials in `.env` (not committed)
- CORS enabled for frontend-backend communication
- Input validation on search queries
- SQL connection pooling for efficiency

## 📊 Performance Optimizations

- **Database Indexes** on:
  - `candidates.email`, `primary_skill`, `created_at`
  - `evaluations.candidate_id`, `prompt_type`, `total_score`
  - `rankings.candidate_id`, `overall_score`, `rank`

- **Connection Pooling** - 10 max connections
- **Generated Column** - `rank` auto-calculated
- **Pagination** - 20 results per page default
- **React Memoization** - Component re-renders optimized

## 🐛 Troubleshooting

### Database Connection Error

```bash
# Check MySQL is running
mysql -u root -p
# Update .env with correct credentials
# Ensure database name matches
```

### Port Already in Use

```bash
# Backend port 3001
lsof -i :3001
kill -9 <PID>

# Frontend port 5173
lsof -i :5173
```

### API Not Found

- Check backend server is running
- Verify proxy config in `vite.config.js`
- Check CORS enabled in server.js

### Evaluations Not Populating

```bash
# Make sure database initialized first
npm run init-db
# Then seed candidates
npm run seed
# Then populate evaluations
npm run evaluate
```

## 🚀 Production Deployment

### Backend (Node.js)

```bash
# Build
npm install --production

# Start with PM2
pm2 start server.js --name evaluator-api

# Environment variables
export DB_HOST=prod-db-host
export DB_USER=prod-user
export DB_PASSWORD=secure-password
export NODE_ENV=production
```

### Frontend (React)

```bash
# Build static assets
npm run build

# Serve with nginx/Vercel/Netlify
# Point to dist/ folder
```

### Database

- Use managed MySQL (AWS RDS, Azure Database, Google Cloud SQL)
- Enable automated backups
- Set up read replicas for analytics
- Configure connection pooling

## 📈 Future Enhancements

- [ ] Live evaluation scoring interface
- [ ] AI-powered response analysis
- [ ] Custom rubric builder
- [ ] Interview scheduling
- [ ] Candidate comparison tool
- [ ] Advanced filtering and tagging
- [ ] Bulk export reports
- [ ] Team collaboration features
- [ ] Skill endorsements
- [ ] Interview notes and feedback

## 📄 License

MIT License - See LICENSE file for details

## 👥 Support

For issues, questions, or feedback:

- GitHub: [Create an issue](https://github.com/your-repo)
- Email: adeel.javed3511@gmail.com

---

**Built with ❤️ using Node.js, React, Mantine, MySQL, and modern web technologies.**
