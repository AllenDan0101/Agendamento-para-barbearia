import { useEffect, useState, type FormEvent } from 'react';
import { api, mensagemDeErro } from '../api/client';
import type { Usuario } from '../api/tipos';
import { Alert, Badge, PageHeader } from '../components/ui/Chrome';
import { Button } from '../components/ui/Button';
import { DataTable } from '../components/ui/DataTable';
import { SelectField, TextField } from '../components/ui/FormFields';
import { Modal } from '../components/ui/Modal';
import { rotuloPapel } from '../utils/format';

type Formulario = { nome: string; email: string; senha: string; papel: 'ADMIN' | 'ATENDENTE' };

const vazio: Formulario = { nome: '', email: '', senha: '', papel: 'ATENDENTE' };

export function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [erro, setErro] = useState('');
  const [erroForm, setErroForm] = useState('');
  const [aberto, setAberto] = useState(false);
  const [editando, setEditando] = useState<Usuario | null>(null);
  const [form, setForm] = useState<Formulario>(vazio);
  const [salvando, setSalvando] = useState(false);

  async function carregar() {
    setUsuarios(await api<Usuario[]>('/api/usuarios'));
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

  function abrirEdicao(usuario: Usuario) {
    setEditando(usuario);
    setForm({ nome: usuario.nome, email: usuario.email, senha: '', papel: usuario.papel });
    setErroForm('');
    setAberto(true);
  }

  async function salvar(evento: FormEvent) {
    evento.preventDefault();
    setSalvando(true);
    setErroForm('');
    try {
      if (editando) {
        await api(`/api/usuarios/${editando.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            nome: form.nome,
            email: form.email,
            papel: form.papel,
            senha: form.senha,
          }),
        });
      } else {
        await api('/api/usuarios', {
          method: 'POST',
          body: JSON.stringify(form),
        });
      }
      setAberto(false);
      await carregar();
    } catch (falha) {
      setErroForm(mensagemDeErro(falha));
    } finally {
      setSalvando(false);
    }
  }

  async function alternar(usuario: Usuario) {
    setErro('');
    try {
      await api(`/api/usuarios/${usuario.id}/ativo`, {
        method: 'PATCH',
        body: JSON.stringify({ ativo: !usuario.ativo }),
      });
      await carregar();
    } catch (falha) {
      setErro(mensagemDeErro(falha));
    }
  }

  return (
    <section>
      <PageHeader
        titulo="Usuários"
        descricao="Administradores e atendentes que acessam o sistema."
        acoes={<Button type="button" onClick={abrirNovo}>Novo usuário</Button>}
      />
      {erro ? <Alert tom="erro">{erro}</Alert> : null}
      <div className="card">
        <DataTable
          linhas={usuarios}
          chave={(usuario) => usuario.id}
          vazio="Nenhum usuário cadastrado."
          colunas={[
            { chave: 'nome', titulo: 'Nome', render: (usuario) => usuario.nome },
            { chave: 'email', titulo: 'E-mail', render: (usuario) => usuario.email },
            { chave: 'papel', titulo: 'Papel', render: (usuario) => rotuloPapel(usuario.papel) },
            {
              chave: 'ativo',
              titulo: 'Situação',
              render: (usuario) => (
                <Badge tom={usuario.ativo ? 'ok' : 'muted'}>{usuario.ativo ? 'Ativo' : 'Inativo'}</Badge>
              ),
            },
            {
              chave: 'acoes',
              titulo: 'Ações',
              render: (usuario) => (
                <div className="actions">
                  <Button type="button" tamanho="small" variante="secondary" onClick={() => abrirEdicao(usuario)}>
                    Editar
                  </Button>
                  <Button type="button" tamanho="small" variante="ghost" onClick={() => void alternar(usuario)}>
                    {usuario.ativo ? 'Inativar' : 'Reativar'}
                  </Button>
                </div>
              ),
            },
          ]}
        />
      </div>
      <Modal aberto={aberto} titulo={editando ? 'Editar usuário' : 'Novo usuário'} onFechar={() => setAberto(false)}>
        <form className="stack" onSubmit={(evento) => void salvar(evento)}>
          {erroForm ? <Alert tom="erro">{erroForm}</Alert> : null}
          <TextField label="Nome" value={form.nome} onChange={(evento) => setForm({ ...form, nome: evento.target.value })} required />
          <TextField label="E-mail" type="email" value={form.email} onChange={(evento) => setForm({ ...form, email: evento.target.value })} required />
          <TextField
            label={editando ? 'Nova senha' : 'Senha'}
            type="password"
            hint={editando ? 'Deixe em branco para manter a senha atual.' : 'Mínimo de 6 caracteres.'}
            value={form.senha}
            onChange={(evento) => setForm({ ...form, senha: evento.target.value })}
            required={!editando}
          />
          <SelectField label="Papel" value={form.papel} onChange={(evento) => setForm({ ...form, papel: evento.target.value as Formulario['papel'] })}>
            <option value="ATENDENTE">Atendente</option>
            <option value="ADMIN">Administrador</option>
          </SelectField>
          <div className="form-actions">
            <Button type="submit" carregando={salvando}>Salvar</Button>
            <Button type="button" variante="ghost" onClick={() => setAberto(false)}>Cancelar</Button>
          </div>
        </form>
      </Modal>
    </section>
  );
}
