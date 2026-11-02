import { useEffect, useState, type FormEvent } from 'react';
import { api, mensagemDeErro } from '../api/client';
import type { Cliente } from '../api/tipos';
import { Alert, Badge, PageHeader } from '../components/ui/Chrome';
import { Button } from '../components/ui/Button';
import { DataTable } from '../components/ui/DataTable';
import { TextField } from '../components/ui/FormFields';
import { Modal } from '../components/ui/Modal';
import { formatarTelefone } from '../utils/format';

type Formulario = { nome: string; telefone: string; email: string };

const vazio: Formulario = { nome: '', telefone: '', email: '' };

export function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [busca, setBusca] = useState('');
  const [erro, setErro] = useState('');
  const [erroForm, setErroForm] = useState('');
  const [editando, setEditando] = useState<Cliente | null>(null);
  const [aberto, setAberto] = useState(false);
  const [form, setForm] = useState<Formulario>(vazio);
  const [salvando, setSalvando] = useState(false);

  async function carregar(termo = busca) {
    const params = new URLSearchParams();
    if (termo.trim()) params.set('busca', termo.trim());
    const consulta = params.toString() ? `?${params}` : '';
    const lista = await api<Cliente[]>(`/api/clientes${consulta}`);
    setClientes(lista);
  }

  useEffect(() => {
    carregar('').catch((falha: unknown) => setErro(mensagemDeErro(falha)));
  }, []);

  function abrirNovo() {
    setEditando(null);
    setForm(vazio);
    setErroForm('');
    setAberto(true);
  }

  function abrirEdicao(cliente: Cliente) {
    setEditando(cliente);
    setForm({ nome: cliente.nome, telefone: cliente.telefone, email: cliente.email ?? '' });
    setErroForm('');
    setAberto(true);
  }

  async function salvar(evento: FormEvent) {
    evento.preventDefault();
    setSalvando(true);
    setErroForm('');
    const corpo = { nome: form.nome, telefone: form.telefone, email: form.email };
    try {
      if (editando) {
        await api(`/api/clientes/${editando.id}`, { method: 'PUT', body: JSON.stringify(corpo) });
      } else {
        await api('/api/clientes', { method: 'POST', body: JSON.stringify(corpo) });
      }
      setAberto(false);
      await carregar();
    } catch (falha) {
      setErroForm(mensagemDeErro(falha));
    } finally {
      setSalvando(false);
    }
  }

  async function alternar(cliente: Cliente) {
    setErro('');
    try {
      await api(`/api/clientes/${cliente.id}/ativo`, {
        method: 'PATCH',
        body: JSON.stringify({ ativo: !cliente.ativo }),
      });
      await carregar();
    } catch (falha) {
      setErro(mensagemDeErro(falha));
    }
  }

  return (
    <section>
      <PageHeader
        titulo="Clientes"
        descricao="Cadastro usado na hora de marcar o horário."
        acoes={
          <>
            <form
              className="search"
              onSubmit={(evento) => {
                evento.preventDefault();
                carregar().catch((falha: unknown) => setErro(mensagemDeErro(falha)));
              }}
            >
              <input
                aria-label="Buscar cliente"
                placeholder="Nome, telefone ou e-mail"
                value={busca}
                onChange={(evento) => setBusca(evento.target.value)}
              />
              <Button type="submit" variante="secondary">
                Buscar
              </Button>
            </form>
            <Button type="button" onClick={abrirNovo}>
              Novo cliente
            </Button>
          </>
        }
      />
      {erro ? <Alert tom="erro">{erro}</Alert> : null}
      <div className="card">
        <DataTable
          linhas={clientes}
          chave={(cliente) => cliente.id}
          vazio="Nenhum cliente encontrado."
          colunas={[
            { chave: 'nome', titulo: 'Nome', render: (cliente) => cliente.nome },
            { chave: 'telefone', titulo: 'Telefone', render: (cliente) => formatarTelefone(cliente.telefone) },
            { chave: 'email', titulo: 'E-mail', render: (cliente) => cliente.email ?? '—' },
            {
              chave: 'ativo',
              titulo: 'Situação',
              render: (cliente) => (
                <Badge tom={cliente.ativo ? 'ok' : 'muted'}>{cliente.ativo ? 'Ativo' : 'Inativo'}</Badge>
              ),
            },
            {
              chave: 'acoes',
              titulo: 'Ações',
              render: (cliente) => (
                <div className="actions">
                  <Button type="button" tamanho="small" variante="secondary" onClick={() => abrirEdicao(cliente)}>
                    Editar
                  </Button>
                  <Button type="button" tamanho="small" variante="ghost" onClick={() => void alternar(cliente)}>
                    {cliente.ativo ? 'Inativar' : 'Reativar'}
                  </Button>
                </div>
              ),
            },
          ]}
        />
      </div>
      <Modal aberto={aberto} titulo={editando ? 'Editar cliente' : 'Novo cliente'} onFechar={() => setAberto(false)}>
        <form className="stack" onSubmit={(evento) => void salvar(evento)}>
          {erroForm ? <Alert tom="erro">{erroForm}</Alert> : null}
          <TextField label="Nome" value={form.nome} onChange={(evento) => setForm({ ...form, nome: evento.target.value })} required />
          <TextField
            label="Telefone"
            hint="Com DDD. Ex.: (11) 98888-1111"
            value={form.telefone}
            onChange={(evento) => setForm({ ...form, telefone: evento.target.value })}
            required
          />
          <TextField
            label="E-mail"
            type="email"
            value={form.email}
            onChange={(evento) => setForm({ ...form, email: evento.target.value })}
          />
          <div className="form-actions">
            <Button type="submit" carregando={salvando}>Salvar</Button>
            <Button type="button" variante="ghost" onClick={() => setAberto(false)}>Cancelar</Button>
          </div>
        </form>
      </Modal>
    </section>
  );
}
