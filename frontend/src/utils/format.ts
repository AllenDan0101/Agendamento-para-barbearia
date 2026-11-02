const FUSO = 'America/Sao_Paulo';

export function hojeLocal(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: FUSO,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

export function instanteNoFuso(data: string, hora: string): string {
  const relogio = hora.length === 5 ? `${hora}:00.000` : hora;
  const chute = new Date(`${data}T${relogio}Z`);
  const formatador = new Intl.DateTimeFormat('en-US', {
    timeZone: FUSO,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const partes = formatador.formatToParts(chute);
  const pegar = (tipo: Intl.DateTimeFormatPartTypes) =>
    Number(partes.find((parte) => parte.type === tipo)?.value);
  let horaParte = pegar('hour');
  if (horaParte === 24) horaParte = 0;
  const comoSeFosseUtc = Date.UTC(
    pegar('year'),
    pegar('month') - 1,
    pegar('day'),
    horaParte,
    pegar('minute'),
    pegar('second'),
  );
  const deslocamento = comoSeFosseUtc - chute.getTime();
  return new Date(chute.getTime() - deslocamento).toISOString();
}

export function partesLocais(iso: string): { data: string; hora: string } {
  const formatador = new Intl.DateTimeFormat('en-CA', {
    timeZone: FUSO,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
  const partes = formatador.formatToParts(new Date(iso));
  const pegar = (tipo: Intl.DateTimeFormatPartTypes) => partes.find((parte) => parte.type === tipo)?.value ?? '';
  let hora = pegar('hour');
  if (hora === '24') hora = '00';
  return { data: `${pegar('year')}-${pegar('month')}-${pegar('day')}`, hora: `${hora}:${pegar('minute')}` };
}

export function formatarDataHora(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: FUSO,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

export function formatarHora(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: FUSO,
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

export function formatarDia(data: string): string {
  const [ano, mes, dia] = data.split('-').map(Number);
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: FUSO,
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  }).format(new Date(Date.UTC(ano, mes - 1, dia, 15, 0, 0)));
}

export function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatarTelefone(digitos: string): string {
  if (digitos.length === 11) return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
  if (digitos.length === 10) return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
  return digitos;
}

export function rotuloPapel(papel: string): string {
  return papel === 'ADMIN' ? 'Administrador' : 'Atendente';
}

export function rotuloStatus(status: string): string {
  if (status === 'AGENDADO') return 'Agendado';
  if (status === 'CONCLUIDO') return 'Concluído';
  return 'Cancelado';
}
