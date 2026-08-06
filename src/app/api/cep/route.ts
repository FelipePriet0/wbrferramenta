import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const cep = req.nextUrl.searchParams.get('cep')?.replace(/\D/g, '');
  if (!cep || cep.length !== 8) {
    return NextResponse.json({ error: 'CEP inválido' }, { status: 400 });
  }

  const res  = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
  const data = await res.json() as { erro?: boolean; logradouro?: string; bairro?: string };

  if (data.erro) {
    return NextResponse.json({ error: 'CEP não encontrado' }, { status: 404 });
  }

  return NextResponse.json({ logradouro: data.logradouro ?? '', bairro: data.bairro ?? '' });
}
