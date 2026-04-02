cat > ~/CompeteScope/supabase-schema.sql << 'EOF'
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PROJECTS TABLE
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- COMPETITORS TABLE
CREATE TABLE IF NOT EXISTS competitors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  homepage_url TEXT NOT NULL,
  pricing_url TEXT,
  changelog_url TEXT,
  category TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- COMPETITOR SNAPSHOTS TABLE
CREATE TABLE IF NOT EXISTS competitor_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  competitor_id UUID NOT NULL REFERENCES competitors(id) ON DELETE CASCADE,
  content_hash TEXT NOT NULL,
  raw_content TEXT,
  diff_text TEXT,
  ai_analysis TEXT,
  scraped_at TIMESTAMP DEFAULT now()
);

-- DIGESTS TABLE
CREATE TABLE IF NOT EXISTS digests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  summary_html TEXT,
  sent_at TIMESTAMP DEFAULT now()
);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE digests ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES
CREATE POLICY "Users can view their own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
  ON projects FOR DELETE
  USING (auth.uid() = user_id);

-- Competitors policies (usuarios ven competidores de sus proyectos)
CREATE POLICY "Users can view competitors of their projects"
  ON competitors FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = competitors.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create competitors in their projects"
  ON competitors FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- Snapshots policies
CREATE POLICY "Users can view snapshots of their competitors"
  ON competitor_snapshots FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM competitors
      JOIN projects ON competitors.project_id = projects.id
      WHERE competitors.id = competitor_snapshots.competitor_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create snapshots for their competitors"
  ON competitor_snapshots FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM competitors
      JOIN projects ON competitors.project_id = projects.id
      WHERE competitors.id = competitor_id
      AND projects.user_id = auth.uid()
    )
  );

-- Digests policies
CREATE POLICY "Users can view digests of their projects"
  ON digests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = digests.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_competitors_project_id ON competitors(project_id);
CREATE INDEX idx_snapshots_competitor_id ON competitor_snapshots(competitor_id);
CREATE INDEX idx_snapshots_scraped_at ON competitor_snapshots(scraped_at);
CREATE INDEX idx_digests_project_id ON digests(project_id);
EOF

cat ~/CompeteScope/supabase-schema.sql
```

---

## 🔧 EJECUTAR SCHEMA EN SUPABASE

Una vez que tengas el archivo SQL:

1. Ve a https://app.supabase.com/project/kyadedyjxvescyztzvjp/sql
2. Click en **"New Query"**
3. **Copia TODO el contenido de `supabase-schema.sql`**
4. **Pega en la ventana SQL**
5. Click **"RUN"** (esquina superior derecha)
6. Espera a que termine (debe decir ✅ Success)

---

## 📋 CHECKLIST PRÓXIMO PASO

**Responde cuando hayas hecho:**
```
✅ npm install completado
✅ supabase-schema.sql ejecutado en Supabase (✅ Success)
✅ Puedo ver las tablas en Supabase (Data Editor)