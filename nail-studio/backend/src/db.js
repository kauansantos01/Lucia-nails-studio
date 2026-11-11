import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';

const dbPath = process.env.VERCEL
  ? '/tmp/nail.db'
  : 'nail.db';

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  senha_hash TEXT NOT NULL,
  perfil TEXT NOT NULL CHECK (perfil IN ('cliente','gerente'))
);
CREATE TABLE IF NOT EXISTS servicos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  descricao TEXT,
  duracao_min INTEGER NOT NULL DEFAULT 60,
  preco REAL NOT NULL
);
CREATE TABLE IF NOT EXISTS agendamentos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
  servico_id INTEGER NOT NULL REFERENCES servicos(id),
  data TEXT NOT NULL,           -- YYYY-MM-DD
  hora TEXT NOT NULL,           -- HH:MM
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente','confirmado','cancelado')),
  criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
`);

// Seed inicial
if (!db.prepare('SELECT 1 FROM usuarios LIMIT 1').get()) {
  const ins = db.prepare('INSERT INTO usuarios (nome,email,senha_hash,perfil) VALUES (?,?,?,?)');
  ins.run('Gerente', 'gerente@nail.com', bcrypt.hashSync('123', 10), 'gerente');
  ins.run('Cliente', 'cliente@nail.com', bcrypt.hashSync('123', 10), 'cliente');

  const s = db.prepare('INSERT INTO servicos (nome,descricao,duracao_min,preco) VALUES (?,?,?,?)');
  s.run('Esmaltação em gel', 'Cobertura em gel com durabilidade de até 21 dias.', 60, 70);
  s.run('Alongamento em fibra', 'Fibra de vidro modelada no formato que você escolher.', 150, 180);
  s.run('Nail art', 'Desenhos, pedrarias e efeitos feitos à mão.', 90, 110);
  s.run('Manutenção', 'Reposição e acabamento do alongamento.', 90, 120);
}

export default db;
