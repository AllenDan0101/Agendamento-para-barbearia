import type { ReactNode } from 'react';

export type Coluna<T> = {
  chave: string;
  titulo: string;
  render: (linha: T) => ReactNode;
};

type Propriedades<T> = {
  colunas: Coluna<T>[];
  linhas: T[];
  chave: (linha: T) => string;
  vazio: string;
};

export function DataTable<T>({ colunas, linhas, chave, vazio }: Propriedades<T>) {
  if (linhas.length === 0) {
    return <p className="empty">{vazio}</p>;
  }
  return (
    <table className="table">
      <thead>
        <tr>
          {colunas.map((coluna) => (
            <th key={coluna.chave} scope="col">
              {coluna.titulo}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {linhas.map((linha) => (
          <tr key={chave(linha)}>
            {colunas.map((coluna) => (
              <td key={coluna.chave}>{coluna.render(linha)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
