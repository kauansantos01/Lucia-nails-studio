import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import db from './db.js';
import { autenticar, soGerente, gerarToken } from './auth.js';

const app = express();
app.use(cors());
app.use(express.json());

// AJUSTE AQUI: expediente do estúdio
const HORARIOS = ['09:00','10:00','11:00','13:00','14:00','15:00','16:00','17:00'];

/* ---------- AUTH ---------- */
app.post('/api/auth/login', (req, res) => {
  const { email, senha } = req.body;
  const u = db.prepare('SELECT * FROM usuarios WHERE email = ?').get(email);
  if (!u || !bcrypt.compareSync(senha || '', u.senha_hash))
    return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
  res.json({ token: gerarToken(u), usuario: { id: u.id, nome: u.nome, perfil: u.perfil } });
});

app.post('/api/auth/registro', (req, res) => {
  const { nome, email, senha } = req.body;
  if (!nome || !email || !senha) return res.status(400).json({ erro: 'Preencha todos os campos.' });
  try {
    const r = db.prepare('INSERT INTO usuarios (nome,email,senha_hash,perfil) VALUES (?,?,?,?)')
      .run(nome, email, bcrypt.hashSync(senha, 10), 'cliente');
    res.status(201).json({ id: r.lastInsertRowid });
  } catch {
    res.status(409).json({ erro: 'Este e-mail já está cadastrado.' });
  }
});

/* ---------- SERVIÇOS ---------- */
app.get('/api/servicos', autenticar, (_req, res) =>
  res.json(db.prepare('SELECT * FROM servicos ORDER BY nome').all()));

app.post('/api/servicos', autenticar, soGerente, (req, res) => {
  const { nome, descricao, duracao_min, preco } = req.body;
  const r = db.prepare('INSERT INTO servicos (nome,descricao,duracao_min,preco) VALUES (?,?,?,?)')
    .run(nome, descricao, duracao_min, preco);
  res.status(201).json({ id: r.lastInsertRowid });
});

app.put('/api/servicos/:id', autenticar, soGerente, (req, res) => {
  const { nome, descricao, duracao_min, preco } = req.body;
  db.prepare('UPDATE servicos SET nome=?, descricao=?, duracao_min=?, preco=? WHERE id=?')
    .run(nome, descricao, duracao_min, preco, req.params.id);
  res.json({ ok: true });
});

app.delete('/api/servicos/:id', autenticar, soGerente, (req, res) => {
  db.prepare('DELETE FROM servicos WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

/* ---------- HORÁRIOS ---------- */
app.get('/api/horarios', autenticar, (req, res) => {
  const { data } = req.query; // YYYY-MM-DD
  if (!data) return res.status(400).json({ erro: 'Informe a data.' });
  const ocupados = db.prepare("SELECT hora FROM agendamentos WHERE data=? AND status!='cancelado'")
    .all(data).map((r) => r.hora);
  res.json(HORARIOS.map((hora) => ({ hora, disponivel: !ocupados.includes(hora) })));
});

/* ---------- AGENDAMENTOS ---------- */
const SELECT_AG = `
  SELECT a.*, s.nome AS servico, s.preco, u.nome AS cliente
  FROM agendamentos a
  JOIN servicos s ON s.id = a.servico_id
  JOIN usuarios u ON u.id = a.usuario_id`;

app.get('/api/agendamentos', autenticar, (req, res) => {
  const rows = req.user.perfil === 'gerente'
    ? db.prepare(`${SELECT_AG} ORDER BY a.data, a.hora`).all()
    : db.prepare(`${SELECT_AG} WHERE a.usuario_id=? ORDER BY a.data, a.hora`).all(req.user.id);
  res.json(rows);
});

app.post('/api/agendamentos', autenticar, (req, res) => {
  const { servico_id, data, hora } = req.body;
  const ocupado = db.prepare("SELECT 1 FROM agendamentos WHERE data=? AND hora=? AND status!='cancelado'").get(data, hora);
  if (ocupado) return res.status(409).json({ erro: 'Esse horário acabou de ser reservado. Escolha outro.' });
  const r = db.prepare('INSERT INTO agendamentos (usuario_id,servico_id,data,hora) VALUES (?,?,?,?)')
    .run(req.user.id, servico_id, data, hora);
  res.status(201).json({ id: r.lastInsertRowid });
});

// Gerente confirma/cancela; cliente só pode cancelar o próprio
app.patch('/api/agendamentos/:id/status', autenticar, (req, res) => {
  const { status } = req.body;
  const ag = db.prepare('SELECT * FROM agendamentos WHERE id=?').get(req.params.id);
  if (!ag) return res.status(404).json({ erro: 'Agendamento não encontrado.' });
  const ehGerente = req.user.perfil === 'gerente';
  if (!ehGerente && (ag.usuario_id !== req.user.id || status !== 'cancelado'))
    return res.status(403).json({ erro: 'Ação não permitida.' });
  db.prepare('UPDATE agendamentos SET status=? WHERE id=?').run(status, req.params.id);
  res.json({ ok: true });
});

app.listen(process.env.PORT || 3001, () => console.log('API rodando em http://localhost:3001'));
