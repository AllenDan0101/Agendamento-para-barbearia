import { useEffect, type ReactNode } from 'react';

type Propriedades = {
  aberto: boolean;
  titulo: string;
  onFechar: () => void;
  children: ReactNode;
};

export function Modal({ aberto, titulo, onFechar, children }: Propriedades) {
  useEffect(() => {
    if (!aberto) return;
    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') onFechar();
    };
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [aberto, onFechar]);

  if (!aberto) return null;

  return (
    <div className="modal-backdrop" onClick={onFechar} role="presentation">
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        onClick={(evento) => evento.stopPropagation()}
      >
        <h2>{titulo}</h2>
        {children}
      </div>
    </div>
  );
}
