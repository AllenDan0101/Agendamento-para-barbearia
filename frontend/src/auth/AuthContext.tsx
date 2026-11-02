import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, tokenStorage } from '../api/client';
import type { Usuario } from '../api/tipos';

type DadosCadastro = {
  nome: string;
  email: string;
  senha: string;
  confirmacaoSenha: string;
};

type Sessao = {
  usuario: Usuario | null;
  carregando: boolean;
  entrar: (email: string, senha: string) => Promise<void>;
  cadastrar: (dados: DadosCadastro) => Promise<void>;
  sair: () => Promise<void>;
};

const Contexto = createContext<Sessao | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!tokenStorage.ler()) {
      setCarregando(false);
      return;
    }
    api<Usuario>('/api/auth/me')
      .then(setUsuario)
      .catch(() => setUsuario(null))
      .finally(() => setCarregando(false));
  }, []);

  useEffect(() => {
    const aoSair = () => setUsuario(null);
    window.addEventListener('navalha:sair', aoSair);
    return () => window.removeEventListener('navalha:sair', aoSair);
  }, []);

  const valor = useMemo<Sessao>(
    () => ({
      usuario,
      carregando,
      async entrar(email: string, senha: string) {
        const sessao = await api<{ token: string; usuario: Usuario }>('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, senha }),
        });
        tokenStorage.gravar(sessao.token);
        setUsuario(sessao.usuario);
      },
      async cadastrar(dados: DadosCadastro) {
        const sessao = await api<{ token: string; usuario: Usuario }>('/api/auth/cadastro', {
          method: 'POST',
          body: JSON.stringify(dados),
        });
        tokenStorage.gravar(sessao.token);
        setUsuario(sessao.usuario);
      },
      async sair() {
        try {
          await api('/api/auth/logout', { method: 'POST' });
        } finally {
          tokenStorage.limpar();
          setUsuario(null);
        }
      },
    }),
    [usuario, carregando],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useAuth(): Sessao {
  const contexto = useContext(Contexto);
  if (!contexto) throw new Error('useAuth deve ficar dentro de AuthProvider');
  return contexto;
}
