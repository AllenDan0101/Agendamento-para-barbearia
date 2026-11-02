import type { ReactNode } from 'react';

type Tom = 'ok' | 'brass' | 'muted' | 'danger';

export function Badge({ tom, children }: { tom: Tom; children: ReactNode }) {
  return <span className={`badge badge-${tom}`}>{children}</span>;
}

export function Alert({ tom, children }: { tom: 'erro' | 'ok' | 'info'; children: ReactNode }) {
  return <div className={`alert alert-${tom}`} role={tom === 'erro' ? 'alert' : 'status'}>{children}</div>;
}

export function PageHeader({
  titulo,
  descricao,
  acoes,
}: {
  titulo: string;
  descricao?: string;
  acoes?: ReactNode;
}) {
  return (
    <header className="page-header">
      <div>
        <h1>{titulo}</h1>
        {descricao ? <p className="muted">{descricao}</p> : null}
      </div>
      {acoes ? <div className="toolbar">{acoes}</div> : null}
    </header>
  );
}
