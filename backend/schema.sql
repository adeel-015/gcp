-- Candidates Table
CREATE TABLE IF NOT EXISTS candidates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  phone VARCHAR(30),
  location VARCHAR(100),
  bio TEXT,
  avatar_url VARCHAR(255),
  years_experience INT,
  primary_skill VARCHAR(100),
  secondary_skills JSON,
  linkedin_url VARCHAR(255),
  github_url VARCHAR(255),
  website_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_primary_skill (primary_skill),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Evaluations Table
CREATE TABLE IF NOT EXISTS evaluations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  candidate_id INT NOT NULL,
  prompt_type ENUM('crisis', 'sustainability', 'team') NOT NULL,
  response TEXT NOT NULL,
  rubric_scores JSON NOT NULL,
  total_score DECIMAL(5, 2) NOT NULL,
  evaluator_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
  INDEX idx_candidate_id (candidate_id),
  INDEX idx_prompt_type (prompt_type),
  INDEX idx_total_score (total_score),
  UNIQUE KEY unique_eval (candidate_id, prompt_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Rankings Table
CREATE TABLE IF NOT EXISTS rankings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  candidate_id INT NOT NULL,
  overall_score DECIMAL(5, 2) NOT NULL,
  crisis_score DECIMAL(5, 2) DEFAULT NULL,
  sustainability_score DECIMAL(5, 2) DEFAULT NULL,
  team_score DECIMAL(5, 2) DEFAULT NULL,
  percentile DECIMAL(5, 2) DEFAULT NULL,
  is_featured BOOLEAN DEFAULT FALSE,
  is_shared BOOLEAN DEFAULT FALSE,
  share_token VARCHAR(64) UNIQUE,
  last_shared_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
  INDEX idx_candidate_id (candidate_id),
  INDEX idx_overall_score (overall_score),
  UNIQUE KEY unique_candidate_ranking (candidate_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Trigger to update rankings when evaluation is created/updated
CREATE TRIGGER update_rankings_on_eval_insert
AFTER INSERT ON evaluations
FOR EACH ROW
BEGIN
  DECLARE avg_score DECIMAL(5, 2);
  DECLARE crisis DECIMAL(5, 2);
  DECLARE sustainability DECIMAL(5, 2);
  DECLARE team DECIMAL(5, 2);
  
  -- Calculate scores for this candidate
  SELECT 
    COALESCE(AVG(total_score), 0),
    MAX(IF(prompt_type = 'crisis', total_score, NULL)),
    MAX(IF(prompt_type = 'sustainability', total_score, NULL)),
    MAX(IF(prompt_type = 'team', total_score, NULL))
  INTO avg_score, crisis, sustainability, team
  FROM evaluations
  WHERE candidate_id = NEW.candidate_id;
  
  -- Update or insert ranking
  INSERT INTO rankings (candidate_id, overall_score, crisis_score, sustainability_score, team_score)
  VALUES (NEW.candidate_id, avg_score, crisis, sustainability, team)
  ON DUPLICATE KEY UPDATE
    overall_score = avg_score,
    crisis_score = crisis,
    sustainability_score = sustainability,
    team_score = team,
    updated_at = CURRENT_TIMESTAMP;
  END;

CREATE TRIGGER update_rankings_on_eval_update
AFTER UPDATE ON evaluations
FOR EACH ROW
BEGIN
  DECLARE avg_score DECIMAL(5, 2);
  DECLARE crisis DECIMAL(5, 2);
  DECLARE sustainability DECIMAL(5, 2);
  DECLARE team DECIMAL(5, 2);
  
  -- Calculate scores for this candidate
  SELECT 
    COALESCE(AVG(total_score), 0),
    MAX(IF(prompt_type = 'crisis', total_score, NULL)),
    MAX(IF(prompt_type = 'sustainability', total_score, NULL)),
    MAX(IF(prompt_type = 'team', total_score, NULL))
  INTO avg_score, crisis, sustainability, team
  FROM evaluations
  WHERE candidate_id = NEW.candidate_id;
  
  -- Update ranking
  UPDATE rankings SET
    overall_score = avg_score,
    crisis_score = crisis,
    sustainability_score = sustainability,
    team_score = team,
    updated_at = CURRENT_TIMESTAMP
  WHERE candidate_id = NEW.candidate_id;
END;
