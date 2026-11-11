// Todas as chamadas à API ficam aqui. Ajuste as rotas conforme o back.
const BASE = 'http://localhost:3001/api';

async function req(path, { method = 'GET', body } = {}) {
  const token = localStorage.getItem('token');
  const res = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    body: body && JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.erro || 'Algo deu errado. Tente novamente.');
  return data;
}

export const api = {
  login: (email, senha) => req('/auth/login', { method: 'POST', body: { email, senha } }),
  registro: (b) => req('/auth/registro', { method: 'POST', body: b }),
  servicos: () => req('/servicos'),
  criarServico: (b) => req('/servicos', { method: 'POST', body: b }),
  editarServico: (id, b) => req(`/servicos/${id}`, { method: 'PUT', body: b }),
  excluirServico: (id) => req(`/servicos/${id}`, { method: 'DELETE' }),
  horarios: (data) => req(`/horarios?data=${data}`),
  agendamentos: () => req('/agendamentos'),
  agendar: (b) => req('/agendamentos', { method: 'POST', body: b }),
  status: (id, status) => req(`/agendamentos/${id}/status`, { method: 'PATCH', body: { status } }),
};
