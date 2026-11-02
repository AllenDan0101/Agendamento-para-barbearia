import { useState, type FormEvent } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { mensagemDeErro } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { Alert } from '../components/ui/Chrome';
import { Button } from '../components/ui/Button';
import { TextField } from '../components/ui/FormFields';

export function CadastroPage() {
  const { usuario, carregando, cadastrar } = useAuth();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacaoSenha, setConfirmacaoSenha] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  if (!carregando && usuario) return <Navigate to="/" replace />;

  async function aoEnviar(evento: FormEvent) {
    evento.preventDefault();
    setErro('');
    if (senha !== confirmacaoSenha) {
      setErro('A confirmação de senha não confere');
      return;
    }
    setEnviando(true);
    try {
      await cadastrar({ nome, email, senha, confirmacaoSenha });
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
          <h1>Entre para a equipe.</h1>
          <p>
            O cadastro público cria um usuário atendente. Quem administra a barbearia
            continua sendo cadastrado por um administrador.
          </p>
        </div>
        <p>Projeto Integrador Transdisciplinar em Engenharia de Software II</p>
      </section>
      <section className="login-panel">
        <form className="login-card stack" onSubmit={(evento) => void aoEnviar(evento)}>
          <div>
            <h2>Cadastre-se</h2>
            <p className="muted">Nome, e-mail e senha. Você entra na agenda em seguida.</p>
          </div>
          {erro ? <Alert tom="erro">{erro}</Alert> : null}
          <TextField
            label="Nome"
            autoComplete="name"
            value={nome}
            onChange={(evento) => setNome(evento.target.value)}
            required
          />
          <TextField
            label="E-mail"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(evento) => setEmail(evento.target.value)}
            required
          />
          <TextField
            label="Senha"
            type="password"
            autoComplete="new-password"
            hint="Mínimo de 6 caracteres."
            value={senha}
            onChange={(evento) => setSenha(evento.target.value)}
            required
          />
          <TextField
            label="Confirmação de senha"
            type="password"
            autoComplete="new-password"
            value={confirmacaoSenha}
            onChange={(evento) => setConfirmacaoSenha(evento.target.value)}
            required
          />
          <Button type="submit" carregando={enviando}>
            Criar conta e entrar
          </Button>
          <Link className="btn btn-ghost btn-block" to="/login">
            Já tenho conta
          </Link>
        </form>
      </section>
    </div>
  );
}
