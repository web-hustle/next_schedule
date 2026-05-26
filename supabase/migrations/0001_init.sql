-- categories
CREATE TABLE categories (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL,
  name       text NOT NULL,
  color      text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX ON categories (user_id);

-- todos
CREATE TABLE todos (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  title       text NOT NULL,
  description text,
  due_date    timestamptz,
  is_done     bool DEFAULT false,
  priority    smallint, -- 1=낮, 2=중, 3=높
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX ON todos (user_id);
CREATE INDEX ON todos (user_id, is_done);

-- habits
CREATE TABLE habits (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL,
  category_id    uuid REFERENCES categories(id) ON DELETE SET NULL,
  name           text NOT NULL,
  aliases        text[] NOT NULL DEFAULT '{}',
  unit           text NOT NULL DEFAULT '회',
  target_per_day numeric,
  created_at     timestamptz DEFAULT now()
);

CREATE INDEX ON habits (user_id);
CREATE INDEX ON habits USING gin(aliases);

-- habit_logs
CREATE TABLE habit_logs (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   uuid NOT NULL,
  habit_id  uuid NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  amount    numeric NOT NULL DEFAULT 1,
  note      text,
  logged_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX ON habit_logs (habit_id, logged_at DESC);
CREATE INDEX ON habit_logs (user_id);
CREATE INDEX ON habit_logs (logged_at);

-- chat_messages
CREATE TABLE chat_messages (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL,
  role       text NOT NULL CHECK (role IN ('user', 'assistant')),
  content    text NOT NULL,
  meta       jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX ON chat_messages (user_id, created_at DESC);

-- RLS는 현재 비활성화. 추후 활성화 시 각 테이블에 아래 정책 추가:
-- ALTER TABLE <table> ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "user_isolation" ON <table>
--   USING (auth.uid() = user_id)
--   WITH CHECK (auth.uid() = user_id);
