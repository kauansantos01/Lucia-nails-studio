import { useEffect, useState } from 'react';
import { api } from '../api.js';

const dataBR = (d) => d.split('-').reverse().join('/');
const vazio = { nome: '', descricao: '', duracao_min: 60, preco: 0 };

export default function Gerente() {
  const [ags, setAgs] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [form, setForm] = useState(vazio);
  const [editId, setEditId] = useState(null);

  const carregar = () => { api.agendamentos().then(setAgs); api.servicos().then(setServicos); };
  useEffect(carregar, []);

  async function salvar(e) {
    e.preventDefault();
    const body = { ...form, duracao_min: +form.duracao_min, preco: +form.preco };
    editId ? await api.editarServico(editId, body) : await api.criarServico(body);
    setForm(vazio); setEditId(null); carregar();
  }

  return (
    <main className="pagina">
      <section className="lista">
        <h2>Agenda</h2>
        {ags.length === 0 && <p className="vazio">Nenhum agendamento ainda. Eles aparecem aqui quando um cliente marcar horário.</p>}
        {ags.map((a) => (
          <div key={a.id} className="linha">
            <div><strong>{a.cliente}</strong> — {a.servico}<br /><small>{dataBR(a.data)} às {a.hora}</small></div>
            <span className={`tag ${a.status}`}>{a.status}</span>
            <div>
              {a.status === 'pendente' && <button className="link" onClick={() => api.status(a.id, 'confirmado').then(carregar)}>Confirmar</button>}
              {a.status !== 'cancelado' && <button className="link" onClick={() => api.status(a.id, 'cancelado').then(carregar)}>Cancelar</button>}
            </div>
          </div>
        ))}
      </section>

      <section className="lista">
        <h2>Serviços</h2>
        {servicos.map((s) => (
          <div key={s.id} className="linha">
            <div><strong>{s.nome}</strong><br /><small>R$ {s.preco} · {s.duracao_min} min</small></div>
            <div>
              <button className="link" onClick={() => { setEditId(s.id); setForm(s); }}>Editar</button>
              <button className="link" onClick={() => api.excluirServico(s.id).then(carregar)}>Excluir</button>
            </div>
          </div>
        ))}
        <form className="form-servico" onSubmit={salvar}>
          <h3>{editId ? 'Editar serviço' : 'Novo serviço'}</h3>
          <input placeholder="Nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
          <input placeholder="Descrição" value={form.descricao || ''} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
          <input type="number" placeholder="Duração (min)" value={form.duracao_min} onChange={(e) => setForm({ ...form, duracao_min: e.target.value })} required />
          <input type="number" step="0.01" placeholder="Preço" value={form.preco} onChange={(e) => setForm({ ...form, preco: e.target.value })} required />
          <button className="btn">{editId ? 'Salvar alterações' : 'Adicionar serviço'}</button>
        </form>
      </section>
    </main>
  );
}
