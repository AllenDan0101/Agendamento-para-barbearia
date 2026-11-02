import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Propriedades = ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: 'primary' | 'secondary' | 'ghost' | 'danger';
  tamanho?: 'normal' | 'small';
  carregando?: boolean;
};

export function Button({
  variante = 'primary',
  tamanho = 'normal',
  carregando = false,
  children,
  disabled,
  ...resto
}: Propriedades) {
  return (
    <button
      className={`btn btn-${variante} ${tamanho === 'small' ? 'btn-small' : ''}`}
      disabled={disabled || carregando}
      aria-busy={carregando}
      {...resto}
    >
      {carregando ? 'Aguarde…' : children}
    </button>
  );
}

export function ButtonRow({ children }: { children: ReactNode }) {
  return <div className="actions">{children}</div>;
}
