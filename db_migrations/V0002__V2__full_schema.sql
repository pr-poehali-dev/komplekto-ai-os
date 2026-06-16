CREATE TABLE t_p96360387_komplekto_ai_os.members (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(200) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  pass_hash VARCHAR(255) NOT NULL,
  mtype VARCHAR(50),
  is_admin BOOLEAN,
  is_verified BOOLEAN,
  vcode VARCHAR(10),
  created_at TIMESTAMP
);

CREATE TABLE t_p96360387_komplekto_ai_os.projects (
  id SERIAL PRIMARY KEY,
  member_id INTEGER,
  pname VARCHAR(255) NOT NULL,
  ptype VARCHAR(255),
  budget BIGINT,
  spent BIGINT,
  items INTEGER,
  status VARCHAR(50),
  cover VARCHAR(10),
  progress INTEGER,
  created_at TIMESTAMP
);

CREATE TABLE t_p96360387_komplekto_ai_os.specs (
  id SERIAL PRIMARY KEY,
  project_id INTEGER,
  spec_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP
);

CREATE TABLE t_p96360387_komplekto_ai_os.spec_rows (
  id SERIAL PRIMARY KEY,
  spec_id INTEGER,
  position INTEGER,
  room VARCHAR(255),
  product VARCHAR(255),
  category VARCHAR(100),
  unit VARCHAR(50),
  qty NUMERIC(10,2),
  price BIGINT,
  supplier VARCHAR(255),
  note TEXT
);

CREATE TABLE t_p96360387_komplekto_ai_os.orders (
  id SERIAL PRIMARY KEY,
  member_id INTEGER,
  order_number VARCHAR(50) NOT NULL,
  total BIGINT,
  items_count INTEGER,
  status VARCHAR(100),
  suppliers TEXT[],
  created_at TIMESTAMP
);

CREATE TABLE t_p96360387_komplekto_ai_os.komi_messages (
  id SERIAL PRIMARY KEY,
  member_id INTEGER,
  sender VARCHAR(10) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP
);

INSERT INTO t_p96360387_komplekto_ai_os.members (full_name, email, pass_hash, mtype, is_admin, is_verified, created_at)
VALUES ('Admin KOMPLEKTO', 'admin@komplekto.ru', 'admin2024', 'admin', TRUE, TRUE, NOW());

INSERT INTO t_p96360387_komplekto_ai_os.members (full_name, email, pass_hash, mtype, is_admin, is_verified, created_at)
VALUES ('Демо Дизайнер', 'demo@komplekto.ru', 'demo1234', 'Дизайнер', FALSE, TRUE, NOW());