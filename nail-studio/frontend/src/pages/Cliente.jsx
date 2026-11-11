import { useEffect, useState } from 'react';
import { api } from '../api.js';

const hoje = () => new Date().toISOString().slice(0, 10);
const brl = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const dataBR = (d) => d.split('-').reverse().join('/');

export default function Cliente() {
  const [agendando, setAgendando] = useState(false);
  const [meus, setMeus] = useState([]);
  const carregar = () => api.agendamentos().then(setMeus);
  useEffect(() => { carregar(); }, []);

  return (
    <main className="pagina">
      <section className="hero">
        <h1>Unhas feitas com calma e capricho.</h1>
        <div className="sobre">
          <p>Cada atendimento começa com uma conversa sobre o formato, o comprimento e o acabamento que combinam com você.</p>
          <p>O procedimento segue quatro etapas: higienização e preparo da cutícula, modelagem ou lixamento, aplicação da cor ou da fibra, e finalização com selante e hidratação. Dura de 1 a 2h30, conforme o serviço.</p>
          <p>Usamos materiais esterilizados e produtos de alta fixação.</p>
        </div>
        {!agendando && <button className="btn grande" onClick={() => setAgendando(true)}>Agendar horário</button>}
      </section>

      {agendando && <Agendar onFim={() => { setAgendando(false); carregar(); }} />}

      <section className="lista">
        <h2>Meus agendamentos</h2>
        {meus.length === 0 && <p className="vazio">Você ainda não tem horários marcados. Toque em “Agendar horário” para começar.</p>}
        {meus.map((a) => (
          <div key={a.id} className="linha">
            <div><strong>{a.servico}</strong><br /><small>{dataBR(a.data)} às {a.hora}</small></div>
            <span className={`tag ${a.status}`}>{a.status}</span>
            {a.status !== 'cancelado' && (
              <button className="link" onClick={() => api.status(a.id, 'cancelado').then(carregar)}>Cancelar</button>
            )}
          </div>
        ))}
      </section>
    </main>
  );
}

function Agendar({ onFim }) {
  const [servicos, setServicos] = useState([]);
  const [servico, setServico] = useState(null);
  const [data, setData] = useState(hoje());
  const [horarios, setHorarios] = useState([]);
  const [hora, setHora] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => { api.servicos().then(setServicos); }, []);
  useEffect(() => { setHora(''); api.horarios(data).then(setHorarios); }, [data]);

  async function confirmar() {
    try {
      await api.agendar({ servico_id: servico.id, data, hora });
      onFim();
    } catch (e) { setMsg(e.message); api.horarios(data).then(setHorarios); }
  }

  return (
    <section className="agendar">
      <h2>Agendar horário</h2>

      <h3>1. Escolha o serviço</h3>
      <div className="grade">
        {servicos.map((s) => (
          <button key={s.id} className={`cartao ${servico?.id === s.id ? 'sel' : ''}`} onClick={() => setServico(s)}>
            <strong>{s.nome}</strong>
            <small>{s.descricao}</small>
            <span>{brl(s.preco)} · {s.duracao_min} min</span>
          </button>
        ))}
      </div>

      <h3>2. Escolha o dia</h3>
      <input type="date" min={hoje()} value={data} onChange={(e) => setData(e.target.value)} />

      <h3>3. Escolha o horário</h3>
      <div className="horas">
        {horarios.map((h) => (
          <button key={h.hora} disabled={!h.disponivel} className={`hora ${hora === h.hora ? 'sel' : ''}`} onClick={() => setHora(h.hora)}>
            {h.hora}
          </button>
        ))}
      </div>

      {msg && <p className="erro" role="alert">{msg}</p>}
      <div className="acoes">
        <button className="btn" disabled={!servico || !hora} onClick={confirmar}>Confirmar agendamento</button>
        <button className="link" onClick={onFim}>Voltar</button>
      </div>
    </section>
  );
}
