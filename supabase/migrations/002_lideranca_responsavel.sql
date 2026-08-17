-- Adiciona responsável à liderança (default NTR).
-- Seguro para bancos que já rodaram 001_init.sql.

alter table public.liderancas
  add column if not exists responsavel text not null default 'NTR';

update public.liderancas
set responsavel = 'NTR'
where responsavel is null or trim(responsavel) = '';
