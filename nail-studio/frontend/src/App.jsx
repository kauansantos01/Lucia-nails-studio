import { useState } from 'react';
import Login from './pages/Login.jsx';
import Cliente from './pages/Cliente.jsx';
import Gerente from './pages/Gerente.jsx';

export default function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));

  const entrar = ({ token, usuario }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(usuario));
    setUser(usuario);
  };
  const sair = () => { localStorage.clear(); setUser(null); };

  if (!user) return <Login onLogin={entrar} />;

  return (
    <>
      <header className="topo">
        <strong className="marca">Lucia Nails Studio</strong>
        <span>Olá, {user.nome} <button className="link" onClick={sair}>Sair</button></span>
      </header>
      {user.perfil === 'gerente' ? <Gerente /> : <Cliente />}
    </>
  );
}
