import type { DetalheErro } from './tipos';

const base = import.meta.env.VITE_API_URL ?? '';
const CHAVE_TOKEN = 'navalha.token';

export class ErroApi extends Error {
  status: number;
  detalhes?: DetalheErro[];

  constructor(message: string, status: number, detalhes?: DetalheErro[]) {
    super(message);
    this.name = 'ErroApi';
    this.status = status;
    this.detalhes = detalhes;
  }
}

export function mensagemDeErro(erro: unknown): string {
  if (erro instanceof ErroApi) {
    if (erro.detalhes && erro.detalhes.length > 0) {
      return erro.detalhes.map((detalhe) => detalhe.mensagem).join(' ');
    }
    return erro.message;
  }
  return 'Não foi possível concluir a operação. Verifique se a API está no ar.';
}

export async function api<T>(caminho: string, opcoes: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem(CHAVE_TOKEN);
  const cabecalhos = new Headers(opcoes.headers);
  if (opcoes.body && !cabecalhos.has('Content-Type')) {
    cabecalhos.set('Content-Type', 'application/json');
  }
  if (token) cabecalhos.set('Authorization', `Bearer ${token}`);

  const resposta = await fetch(`${base}${caminho}`, { ...opcoes, headers: cabecalhos });
  if (resposta.status === 204) return undefined as T;

  const corpo = (await resposta.json().catch(() => ({}))) as {
    erro?: string;
    detalhes?: DetalheErro[];
  };

  if (!resposta.ok) {
    if (resposta.status === 401 && !caminho.startsWith('/api/auth/login')) {
      localStorage.removeItem(CHAVE_TOKEN);
      window.dispatchEvent(new Event('navalha:sair'));
    }
    throw new ErroApi(corpo.erro ?? 'Erro inesperado', resposta.status, corpo.detalhes);
  }

  return corpo as T;
}

export const tokenStorage = {
  ler: () => localStorage.getItem(CHAVE_TOKEN),
  gravar: (token: string) => localStorage.setItem(CHAVE_TOKEN, token),
  limpar: () => localStorage.removeItem(CHAVE_TOKEN),
};
