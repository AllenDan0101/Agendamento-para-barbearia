import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { rotuloPapel } from '../../utils/format';
import { Button } from '../ui/Button';

function Marca() {
  return (
    <div className="brand-mark">
      <svg width="28" height="28" viewBox="0 0 64 64" aria-hidden="true">
        <rect width="64" height="64" rx="14" fill="#f4ecdf" />
        <path d="M18 46c8-2 12-10 14-18 2 8 6 16 14 18" fill="none" stroke="#1c1712" strokeWidth="3" strokeLinecap="round" />
        <circle cx="24" cy="22" r="6" fill="none" stroke="#8c6239" strokeWidth="3" />
        <circle cx="40" cy="22" r="6" fill="none" stroke="#8c6239" strokeWidth="3" />
      </svg>
      Navalha
    </div>
  );
}

export function AppLayout() {
  const { usuario, sair } = useAuth();
  return (
    <div className="shell">
      <aside className="sidebar">
        <Marca />
        <nav className="nav" aria-label="Principal">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'ativo' : undefined)}>
            Início
          </NavLink>
          <NavLink to="/agenda" className={({ isActive }) => (isActive ? 'ativo' : undefined)}>
            Agenda
          </NavLink>
          <NavLink to="/clientes" className={({ isActive }) => (isActive ? 'ativo' : undefined)}>
            Clientes
          </NavLink>
          <NavLink to="/servicos" className={({ isActive }) => (isActive ? 'ativo' : undefined)}>
            Serviços
          </NavLink>
          {usuario?.papel === 'ADMIN' ? (
            <NavLink to="/usuarios" className={({ isActive }) => (isActive ? 'ativo' : undefined)}>
              Usuários
            </NavLink>
          ) : null}
        </nav>
        <div className="sidebar-user">
          <div>
            <strong>{usuario?.nome}</strong>
            <br />
            <small>{usuario ? rotuloPapel(usuario.papel) : ''}</small>
          </div>
          <Button type="button" variante="ghost" onClick={() => void sair()}>
            Sair
          </Button>
        </div>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
