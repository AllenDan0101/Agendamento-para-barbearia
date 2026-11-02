export const FUSO_BARBEARIA = 'America/Sao_Paulo';

export function dataHojeLocal(timeZone = FUSO_BARBEARIA, agora = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(agora);
}

/**
 * Converte um horário de parede no fuso informado para um instante UTC.
 * O Brasil está sem horário de verão; o cálculo usa Intl e continua válido se isso mudar.
 */
export function instanteNoFuso(data: string, hora: string, timeZone = FUSO_BARBEARIA): Date {
  const relogio = hora.length === 5 ? `${hora}:00.000` : hora.includes('.') ? hora : `${hora}.000`;
  const chute = new Date(`${data}T${relogio}Z`);
  if (Number.isNaN(chute.getTime())) {
    throw new Error('Data ou hora inválida');
  }

  const formatador = new Intl.DateTimeFormat('en-US', {
    timeZone,
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
  return new Date(chute.getTime() - deslocamento);
}

export function limitesDoDia(data: string, timeZone = FUSO_BARBEARIA): { inicio: string; fim: string } {
  const inicio = instanteNoFuso(data, '00:00:00.000', timeZone);
  const fim = instanteNoFuso(data, '23:59:59.000', timeZone);
  return {
    inicio: inicio.toISOString(),
    fim: new Date(fim.getTime() + 999).toISOString(),
  };
}
