import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';

type CampoProps = {
  label: string;
  hint?: string;
  error?: string;
  children: (id: string) => ReactNode;
};

export function Field({ label, hint, error, children }: CampoProps) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children(id)}
      {hint ? <p className="field-hint">{hint}</p> : null}
      {error ? <p className="field-error">{error}</p> : null}
    </div>
  );
}

type TextoProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
};

export function TextField({ label, hint, error, ...input }: TextoProps) {
  return (
    <Field label={label} hint={hint} error={error}>
      {(id) => <input id={id} {...input} />}
    </Field>
  );
}

type AreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  hint?: string;
  error?: string;
};

export function TextAreaField({ label, hint, error, ...input }: AreaProps) {
  return (
    <Field label={label} hint={hint} error={error}>
      {(id) => <textarea id={id} {...input} />}
    </Field>
  );
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
};

export function SelectField({ label, hint, error, children, ...select }: SelectProps) {
  return (
    <Field label={label} hint={hint} error={error}>
      {(id) => (
        <select id={id} {...select}>
          {children}
        </select>
      )}
    </Field>
  );
}
