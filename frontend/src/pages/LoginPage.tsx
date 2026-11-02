import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { mensagemDeErro } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { Alert } from '../components/ui/Chrome';
import { Button } from '../components/ui/Button';
import { TextField } from '../components/ui/FormFields';

export function LoginPage() {
  const { usuario, carregando, entrar } = useAuth();
  const [email, setEmail] = useState('admin@barbearia.local');
  const [senha, setSenha] = useState('admin123');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  if (!carregando && usuario) return <Navigate to="/" replace />;

  async function aoEnviar(evento: FormEvent) {
    evento.preventDefault();
    setErro('');
    setEnviando(true);
    try {
      await entrar(email, senha);
    } catch (falha) {
      setErro(mensagemDeErro(falha));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="login-screen">
      <section className="login-brand">
        <div className="brand-mark">Navalha</div>
        <div>
          <h1>A cadeira certa, na hora certa.</h1>
          <p>
            Agenda interna da barbearia: clientes, serviços e horários sem conflito de
            atendente. O cliente final não entra nesta versão.
          </p>
        </div>
        <p>Projeto Integrador Transdisciplinar em Engenharia de Software II</p>
      </section>
      <section className="login-panel">
        <form className="login-card stack" onSubmit={(evento) => void aoEnviar(evento)}>
          <div>
            <h2>Entrar</h2>
            <p className="muted">Use o e-mail e a senha da equipe.</p>
          </div>
          {erro ? <Alert tom="erro">{erro}</Alert> : null}
          <TextField
            label="E-mail"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(evento) => setEmail(evento.target.value)}
            required
          />
          <TextField
            label="Senha"
            type="password"
            autoComplete="current-password"
            value={senha}
            onChange={(evento) => setSenha(evento.target.value)}
            required
          />
          <Button type="submit" carregando={enviando}>
            Acessar a agenda
          </Button>
          <div className="demo-box">
            <strong>Demonstração</strong>
            <br />
            Admin: admin@barbearia.local / admin123
            <br />
            Atendente: atendente@barbearia.local / atendente123
          </div>
        </form>
      </section>
    </div>
  );
}
