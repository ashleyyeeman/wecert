CREATE TABLE IF NOT EXISTS wc_roles (
  user_id text PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'student' CHECK(role IN ('student','teacher'))
);
CREATE TABLE IF NOT EXISTS wc_learners (
  user_id text PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE,
  state jsonb NOT NULL,
  revision integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS wc_questions (
  id uuid PRIMARY KEY,
  user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  course text NOT NULL,
  lesson integer NOT NULL CHECK(lesson>0),
  question text NOT NULL CHECK(char_length(question) BETWEEN 1 AND 350),
  author_name text NOT NULL,
  recipient text NOT NULL DEFAULT 'Teacher' CHECK(recipient IN ('Teacher','Sample tutor')),
  tutor_reply text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS wc_questions_user_idx ON wc_questions(user_id);
CREATE TABLE IF NOT EXISTS wc_replies (
  question_id uuid PRIMARY KEY REFERENCES wc_questions(id) ON DELETE CASCADE,
  teacher_id text NOT NULL REFERENCES "user"(id),
  body text NOT NULL CHECK(char_length(body) BETWEEN 1 AND 1500),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS wc_announcements (
  id uuid PRIMARY KEY,
  course text NOT NULL,
  title text NOT NULL CHECK(char_length(title) BETWEEN 1 AND 80),
  body text NOT NULL CHECK(char_length(body) BETWEEN 1 AND 1200),
  teacher_id text NOT NULL REFERENCES "user"(id),
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS wc_guidance (
  course text NOT NULL,
  lesson integer NOT NULL CHECK(lesson>0),
  body text NOT NULL CHECK(char_length(body) BETWEEN 1 AND 1500),
  teacher_id text NOT NULL REFERENCES "user"(id),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(course,lesson)
);
CREATE TABLE IF NOT EXISTS wc_learner_notes (
  teacher_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  learner_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  body text NOT NULL CHECK(char_length(body) BETWEEN 1 AND 1200),
  PRIMARY KEY(teacher_id,learner_id)
);
CREATE TABLE IF NOT EXISTS wc_setup_keys (
  name text PRIMARY KEY,
  token_hash text NOT NULL,
  used_at timestamptz,
  user_id text REFERENCES "user"(id)
);
CREATE TABLE IF NOT EXISTS wc_teacher_invites (
  id uuid PRIMARY KEY,
  token_hash text NOT NULL UNIQUE,
  created_by text NOT NULL REFERENCES "user"(id),
  expires_at timestamptz NOT NULL DEFAULT(now()+interval '3 days'),
  used_by text REFERENCES "user"(id),
  used_at timestamptz
);
CREATE TABLE IF NOT EXISTS wc_api_limits (
  key text PRIMARY KEY,
  window_start timestamptz NOT NULL,
  count integer NOT NULL DEFAULT 1
);
