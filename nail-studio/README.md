# Nail Studio

## Rodar
```bash
# terminal 1 – API (http://localhost:3001)
cd backend && npm install && npm run dev

# terminal 2 – site (http://localhost:5173)
cd frontend && npm install && npm run dev
```
O banco `backend/nail.db` (SQLite) é criado sozinho, com os usuários:
- gerente@nail.com / 123
- cliente@nail.com / 123

## Onde ajustar
- Horários do dia: `HORARIOS` em `backend/src/server.js`
- Rotas: `backend/src/server.js` · chamadas do front: `frontend/src/api.js`
- Tabelas: `backend/src/db.js`
- Cores e fontes: variáveis no topo de `frontend/src/styles.css`

## Rotas da API
POST /api/auth/login · POST /api/auth/registro
GET/POST /api/servicos · PUT/DELETE /api/servicos/:id (gerente)
GET /api/horarios?data=YYYY-MM-DD
GET/POST /api/agendamentos · PATCH /api/agendamentos/:id/status
