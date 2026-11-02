import { useEffect, useState, type FormEvent } from 'react';
import { api, mensagemDeErro } from '../api/client';
import type { Servico } from '../api/tipos';
import { useAuth } from '../auth/AuthContext';
import { Alert, Badge, PageHeader } from '../components/ui/Chrome';
import { Button } from '../components/ui/Button';
import { DataTable } from '../components/ui/DataTable';
import { TextField } from '../components/ui/FormFields';
import { Modal } from '../components/ui/Modal';
import { formatarMoeda } from '../utils/format';

type Formulario = { nome: string; duracaoMin: string; preco: string };

const vazio: Formulario = { nome: '', duracaoMin: '30', preco: '45.00' };

export function ServicosPage() {
  const { usuario } = useAuth();
  const admin = usuario?.papel === 'ADMIN';
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [erro, setErro] = useState('');
  const [erroForm, setErroForm] = useState('');
  const [aberto, setAberto] = useState(false);
  const [editando, setEditando] = useState<Servico | null>(null);
  const [form, setForm] = useState<Formulario>(vazio);
  const [salvando, setSalvando] = useState(false);

  async function carregar() {
    setServicos(await api<Servico[]>('/api/servicos'));
  }

  useEffect(() => {
    carregar().catch((falha: unknown) => setErro(mensagemDeErro(falha)));
  }, []);

  function abrirNovo() {
    setEditando(null);
    setForm(vazio);
    setErroForm('');
    setAberto(true);
  }

  function abrirEdicao(servico: Servico) {
    setEditando(servico);
    setForm({
      nome: servico.nome,
      duracaoMin: String(servico.duracaoMin),
      preco: servico.preco.toFixed(2),
    });
    setErroForm('');
    setAberto(true);
  }

  async function salvar(evento: FormEvent) {
    evento.preventDefault();
    setSalvando(true);
    setErroForm('');
    const corpo = {
      nome: form.nome,
      duracaoMin: Number(form.duracaoMin),
      preco: Number(form.preco.replace(',', '.')),
    };
    try {
      if (editando) {
        await api(`/api/servicos/${editando.id}`, { method: 'PUT', body: JSON.stringify(corpo) });
      } else {
        await api('/api/servicos', { method: 'POST', body: JSON.stringify(corpo) });
      }
      setAberto(false);
      await carregar();
    } catch (falha) {
      setErroForm(mensagemDeErro(falha));
    } finally {
      setSalvando(false);
    }
  }

  async function alternar(servico: Servico) {
    setErro('');
    try {
      await api(`/api/servicos/${servico.id}/ativo`, {
        method: 'PATCH',
        body: JSON.stringify({ ativo: !servico.ativo }),
      });
      await carregar();
    } catch (falha) {
      setErro(mensagemDeErro(falha));
    }
  }

  async function excluir(servico: Servico) {
    if (!window.confirm(`Excluir o serviço “${servico.nome}”? Só é possível se ele nunca foi agendado.`)) return;
    setErro('');
    try {
      await api(`/api/servicos/${servico.id}`, { method: 'DELETE' });
      await carregar();
    } catch (falha) {
      setErro(mensagemDeErro(falha));
    }
  }

  return (
    <section>
      <PageHeader
        titulo="Serviços"
        descricao={admin ? 'Duração e preço definem o fim de cada horário.' : 'Catálogo disponível para agendar. Alterações ficam com o administrador.'}
        acoes={admin ? <Button type="button" onClick={abrirNovo}>Novo serviço</Button> : undefined}
      />
      {erro ? <Alert tom="erro">{erro}</Alert> : null}
      <div className="card">
        <DataTable
          linhas={servicos}
          chave={(servico) => servico.id}
          vazio="Nenhum serviço cadastrado."
          colunas={[
            { chave: 'nome', titulo: 'Nome', render: (servico) => servico.nome },
            { chave: 'duracao', titulo: 'Duração', render: (servico) => `${servico.duracaoMin} min` },
            { chave: 'preco', titulo: 'Preço', render: (servico) => formatarMoeda(servico.preco) },
            {
              chave: 'ativo',
              titulo: 'Situação',
              render: (servico) => (
                <Badge tom={servico.ativo ? 'ok' : 'muted'}>{servico.ativo ? 'Ativo' : 'Inativo'}</Badge>
              ),
            },
            {
              chave: 'acoes',
              titulo: 'Ações',
              render: (servico) =>
                admin ? (
                  <div className="actions">
                    <Button type="button" tamanho="small" variante="secondary" onClick={() => abrirEdicao(servico)}>
                      Editar
                    </Button>
                    <Button type="button" tamanho="small" variante="ghost" onClick={() => void alternar(servico)}>
                      {servico.ativo ? 'Inativar' : 'Reativar'}
                    </Button>
                    <Button type="button" tamanho="small" variante="danger" onClick={() => void excluir(servico)}>
                      Excluir
                    </Button>
                  </div>
                ) : (
                  '—'
                ),
            },
          ]}
        />
      </div>
      <Modal aberto={aberto} titulo={editando ? 'Editar serviço' : 'Novo serviço'} onFechar={() => setAberto(false)}>
        <form className="stack" onSubmit={(evento) => void salvar(evento)}>
          {erroForm ? <Alert tom="erro">{erroForm}</Alert> : null}
          <TextField label="Nome" value={form.nome} onChange={(evento) => setForm({ ...form, nome: evento.target.value })} required />
          <div className="grid-2">
            <TextField
              label="Duração (minutos)"
              type="number"
              min={1}
              step={1}
              value={form.duracaoMin}
              onChange={(evento) => setForm({ ...form, duracaoMin: evento.target.value })}
              required
            />
            <TextField
              label="Preço (R$)"
              type="number"
              min={0}
              step="0.01"
              value={form.preco}
              onChange={(evento) => setForm({ ...form, preco: evento.target.value })}
              required
            />
          </div>
          <div className="form-actions">
            <Button type="submit" carregando={salvando}>Salvar</Button>
            <Button type="button" variante="ghost" onClick={() => setAberto(false)}>Cancelar</Button>
          </div>
        </form>
      </Modal>
    </section>
  );
}
