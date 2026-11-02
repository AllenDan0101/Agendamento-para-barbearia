import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, mensagemDeErro } from '../api/client';
import type { Agendamento, Cliente, Servico } from '../api/tipos';
import { useAuth } from '../auth/AuthContext';
import { Alert, Badge, PageHeader } from '../components/ui/Chrome';
import { DataTable } from '../components/ui/DataTable';
import { formatarDataHora, formatarHora, hojeLocal, rotuloStatus } from '../utils/format';

export function HomePage() {
  const { usuario } = useAuth();
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [proximos, setProximos] = useState<Agendamento[]>([]);
  const [clientes, setClientes] = useState(0);
  const [servicos, setServicos] = useState(0);
  const [erro, setErro] = useState('');

  useEffect(() => {
    const hoje = hojeLocal();
    Promise.all([
      api<Agendamento[]>(`/api/agendamentos?data=${hoje}`),
      api<Agendamento[]>('/api/agendamentos'),
      api<Cliente[]>('/api/clientes?ativo=true'),
      api<Servico[]>('/api/servicos?ativo=true'),
    ])
      .then(([doDia, todos, listaClientes, listaServicos]) => {
        setAgendamentos(doDia);
        setClientes(listaClientes.length);
        setServicos(listaServicos.length);
        const proximos = todos
          .filter((item) => item.status === 'AGENDADO' && new Date(item.inicio).getTime() >= Date.now())
          .slice(0, 6);
        setProximos(proximos);
      })
      .catch((falha: unknown) => setErro(mensagemDeErro(falha)));
  }, []);

  const abertosHoje = agendamentos.filter((item) => item.status === 'AGENDADO').length;

  return (
    <section>
      <PageHeader
        titulo={`Olá, ${usuario?.nome.split(' ')[0] ?? ''}`}
        descricao="Resumo do dia na barbearia, no horário de Brasília."
        acoes={<Link className="btn btn-primary" to="/agenda">Abrir a agenda</Link>}
      />
      {erro ? <Alert tom="erro">{erro}</Alert> : null}
      <div className="stats">
        <article className="card stat">
          <span>Em aberto hoje</span>
          <strong>{abertosHoje}</strong>
        </article>
        <article className="card stat">
          <span>Clientes ativos</span>
          <strong>{clientes}</strong>
        </article>
        <article className="card stat">
          <span>Serviços ativos</span>
          <strong>{servicos}</strong>
        </article>
      </div>
      <div className="card">
        <DataTable
          linhas={proximos}
          chave={(item) => item.id}
          vazio="Nenhum horário futuro em aberto."
          colunas={[
            { chave: 'hora', titulo: 'Quando', render: (item) => formatarDataHora(item.inicio) },
            { chave: 'fim', titulo: 'Até', render: (item) => formatarHora(item.fim) },
            { chave: 'cliente', titulo: 'Cliente', render: (item) => item.clienteNome },
            { chave: 'servico', titulo: 'Serviço', render: (item) => item.servicoNome },
            { chave: 'atendente', titulo: 'Atendente', render: (item) => item.atendenteNome },
            {
              chave: 'status',
              titulo: 'Status',
              render: (item) => <Badge tom="brass">{rotuloStatus(item.status)}</Badge>,
            },
          ]}
        />
      </div>
    </section>
  );
}
