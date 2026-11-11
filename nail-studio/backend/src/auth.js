import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'dev-secret';

export const gerarToken = (u) =>
  jwt.sign({ id: u.id, perfil: u.perfil, nome: u.nome }, SECRET, { expiresIn: '8h' });

export function autenticar(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ erro: 'Sessão expirada. Entre novamente.' });
  }
}

export const soGerente = (req, res, next) =>
  req.user.perfil === 'gerente' ? next() : res.status(403).json({ erro: 'Acesso restrito ao gerente.' });
