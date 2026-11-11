import { useState } from 'react';
import { api } from '../api.js';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    setErro(''); setCarregando(true);
    try { onLogin(await api.login(email, senha)); }
    catch (err) { setErro(err.message); }
    finally { setCarregando(false); }
  }

  return (
    <main className="login">
      <div className="login-arte" aria-hidden="true">
        <span className="unha u1" /><span className="unha u2" /><span className="unha u3" /><span className="unha u4" />
      </div>
      <form className="login-form" onSubmit={enviar}>
        <h1>nail studio</h1>
        <p>Entre para ver seus horários.</p>
        <label>E-mail<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
        <label>Senha<input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required /></label>
        {erro && <p className="erro" role="alert">{erro}</p>}
        <button className="btn" disabled={carregando}>{carregando ? 'Entrando…' : 'Entrar'}</button>
      </form>
    </main>
  );
}
