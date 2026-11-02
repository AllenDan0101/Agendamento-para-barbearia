import { useEffect, useState, type FormEvent } from 'react';
import { api, mensagemDeErro } from '../api/client';
import type { Agendamento, Cliente, Servico, Usuario } from '../api/tipos';
import { useAuth } from '../auth/AuthContext';
import { Alert, Badge, PageHeader } from '../components/ui/Chrome';
import { Button } from '../components/ui/Button';
import { DataTable } from '../components/ui/DataTable';
import { SelectField, TextAreaField, TextField } from '../components/ui/FormFields';
import { Modal } from '../components/ui/Modal';
import { formatarDia, formatarHora, formatarMoeda, hojeLocal, instanteNoFuso, partesLocais, rotuloStatus } from '../utils/format';

type Modo = { tipo: 'criar' } | { tipo: 'remarcar'; item: Agendamento };

export function AgendaPage() {
  const { usuario } = useAuth();
  const admin = usuario?.papel === 'ADMIN';
  const [data, setData] = useState(hojeLocal());
  const [clienteFiltro, setClienteFiltro] = useState('');
  const [itens, setItens] = useState<Agendamento[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [erro, setErro] = useState('');
  const [erroForm, setErroForm] = useState('');
  const [modo, setModo] = useState<Modo | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [clienteId, setClienteId] = useState('');
  const [servicoId, setServicoId] = useState('');
  const [usuarioId, setUsuarioId] = useState('');
  const [dia, setDia] = useState(hojeLocal());
  const [hora, setHora] = useState('09:00');
  const [observacao, setObservacao] = useState('');

  async function carregarAgenda(diaConsulta = data, cliente = clienteFiltro) {
    const params = new URLSearchParams({ data: diaConsulta });
    if (cliente) params.set('clienteId', cliente);
    setItens(await api<Agendamento[]>(`/api/agendamentos?${params}`));
  }

  useEffect(() => {
    Promise.all([
      api<Cliente[]>('/api/clientes?ativo=true'),
      api<Servico[]>('/api/servicos?ativo=true'),
      admin ? api<Usuario[]>('/api/usuarios') : Promise.resolve([] as Usuario[]),
    ])
      .then(([listaClientes, listaServicos, listaUsuarios]) => {
        setClientes(listaClientes);
        setServicos(listaServicos);
        setUsuarios(listaUsuarios.filter((item) => item.ativo));
      })
      .catch((falha: unknown) => setErro(mensagemDeErro(falha)));
  }, [admin]);

  useEffect(() => {
    carregarAgenda(data, clienteFiltro).catch((falha: unknown) => setErro(mensagemDeErro(falha)));
  }, [data, clienteFiltro]);

  function abrirCriar() {
    setModo({ tipo: 'criar' });
    setClienteId(clientes[0]?.id ?? '');
    setServicoId(servicos[0]?.id ?? '');
    setUsuarioId(usuario?.id ?? '');
    setDia(data);
    setHora('09:00');
    setObservacao('');
    setErroForm('');
  }

  function abrirRemarcar(item: Agendamento) {
    const partes = partesLocais(item.inicio);
    setModo({ tipo: 'remarcar', item });
    setClienteId(item.clienteId);
    setServicoId(item.servicoId);
    setUsuarioId(item.usuarioId);
    setDia(partes.data);
    setHora(partes.hora);
    setObservacao(item.observacao ?? '');
    setErroForm('');
  }

  async function salvar(evento: FormEvent) {
    evento.preventDefault();
    setSalvando(true);
    setErroForm('');
    try {
      const inicio = instanteNoFuso(dia, hora);
      if (modo?.tipo === 'remarcar') {
        await api(`/api/agendamentos/${modo.item.id}`, {
          method: 'PUT',
          body: JSON.stringify({ inicio, servicoId, observacao }),
        });
      } else {
        await api('/api/agendamentos', {
          method: 'POST',
          body: JSON.stringify({
            clienteId,
            servicoId,
            usuarioId: admin ? usuarioId : undefined,
            inicio,
            observacao,
          }),
        });
      }
      setModo(null);
      await carregarAgenda();
    } catch (falha) {
      setErroForm(mensagemDeErro(falha));
    } finally {
      setSalvando(false);
    }
  }

  async function mudarStatus(item: Agendamento, acao: 'cancelar' | 'concluir') {
    const verbo = acao === 'cancelar' ? 'cancelar' : 'concluir';
    if (!window.confirm(`Deseja ${verbo} o horário de ${item.clienteNome}?`)) return;
    setErro('');
    try {
      await api(`/api/agendamentos/${item.id}/${acao}`, { method: 'PATCH' });
      await carregarAgenda();
    } catch (falha) {
      setErro(mensagemDeErro(falha));
    }
  }

  const tom = (status: Agendamento['status']) => {
    if (status === 'AGENDADO') return 'brass' as const;
    if (status === 'CONCLUIDO') return 'ok' as const;
    return 'muted' as const;
  };

  return (
    <section>
      <PageHeader
        titulo="Agenda"
        descricao={`${formatarDia(data)}. Horários em Brasília. Um atendente não pode ter dois serviços ao mesmo tempo.`}
        acoes={
          <>
            <TextField label="Dia" type="date" value={data} onChange={(evento) => setData(evento.target.value)} />
            <SelectField label="Cliente" value={clienteFiltro} onChange={(evento) => setClienteFiltro(evento.target.value)}>
              <option value="">Todos</option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>{cliente.nome}</option>
              ))}
            </SelectField>
            <Button
              type="button"
              variante="secondary"
              onClick={() => carregarAgenda().catch((falha: unknown) => setErro(mensagemDeErro(falha)))}
            >
              Atualizar
            </Button>
            <Button type="button" onClick={abrirCriar}>Novo agendamento</Button>
          </>
        }
      />
      {erro ? <Alert tom="erro">{erro}</Alert> : null}
      <div className="card">
        <DataTable
          linhas={itens}
          chave={(item) => item.id}
          vazio="Nenhum agendamento neste dia."
          colunas={[
            {
              chave: 'hora',
              titulo: 'Horário',
              render: (item) => `${formatarHora(item.inicio)} – ${formatarHora(item.fim)}`,
            },
            { chave: 'cliente', titulo: 'Cliente', render: (item) => item.clienteNome },
            {
              chave: 'servico',
              titulo: 'Serviço',
              render: (item) => `${item.servicoNome} · ${formatarMoeda(item.preco)}`,
            },
            { chave: 'atendente', titulo: 'Atendente', render: (item) => item.atendenteNome },
            { chave: 'obs', titulo: 'Observação', render: (item) => item.observacao ?? '—' },
            {
              chave: 'status',
              titulo: 'Status',
              render: (item) => <Badge tom={tom(item.status)}>{rotuloStatus(item.status)}</Badge>,
            },
            {
              chave: 'acoes',
              titulo: 'Ações',
              render: (item) =>
                item.status === 'AGENDADO' ? (
                  <div className="actions">
                    <Button type="button" tamanho="small" variante="secondary" onClick={() => abrirRemarcar(item)}>
                      Remarcar
                    </Button>
                    <Button type="button" tamanho="small" variante="ghost" onClick={() => void mudarStatus(item, 'concluir')}>
                      Concluir
                    </Button>
                    <Button type="button" tamanho="small" variante="danger" onClick={() => void mudarStatus(item, 'cancelar')}>
                      Cancelar
                    </Button>
                  </div>
                ) : (
                  '—'
                ),
            },
          ]}
        />
      </div>
      <Modal
        aberto={modo !== null}
        titulo={modo?.tipo === 'remarcar' ? 'Remarcar horário' : 'Novo agendamento'}
        onFechar={() => setModo(null)}
      >
        <form className="stack" onSubmit={(evento) => void salvar(evento)}>
          {erroForm ? <Alert tom="erro">{erroForm}</Alert> : null}
          {modo?.tipo === 'criar' ? (
            <SelectField label="Cliente" value={clienteId} onChange={(evento) => setClienteId(evento.target.value)} required>
              <option value="">Selecione</option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>{cliente.nome}</option>
              ))}
            </SelectField>
          ) : (
            <p className="muted">Cliente: {modo?.tipo === 'remarcar' ? modo.item.clienteNome : ''}</p>
          )}
          <SelectField label="Serviço" value={servicoId} onChange={(evento) => setServicoId(evento.target.value)} required>
            <option value="">Selecione</option>
            {servicos.map((servico) => (
              <option key={servico.id} value={servico.id}>
                {servico.nome} · {servico.duracaoMin} min · {formatarMoeda(servico.preco)}
              </option>
            ))}
          </SelectField>
          {admin && modo?.tipo === 'criar' ? (
            <SelectField label="Atendente" value={usuarioId} onChange={(evento) => setUsuarioId(evento.target.value)} required>
              {usuarios.map((pessoa) => (
                <option key={pessoa.id} value={pessoa.id}>{pessoa.nome}</option>
              ))}
            </SelectField>
          ) : null}
          <div className="grid-2">
            <TextField label="Data" type="date" value={dia} onChange={(evento) => setDia(evento.target.value)} required />
            <TextField
              label="Hora"
              type="time"
              hint="Horário de Brasília"
              value={hora}
              onChange={(evento) => setHora(evento.target.value)}
              required
            />
          </div>
          <TextAreaField
            label="Observação"
            value={observacao}
            onChange={(evento) => setObservacao(evento.target.value)}
          />
          <div className="form-actions">
            <Button type="submit" carregando={salvando}>Salvar</Button>
            <Button type="button" variante="ghost" onClick={() => setModo(null)}>Fechar</Button>
          </div>
        </form>
      </Modal>
    </section>
  );
}
