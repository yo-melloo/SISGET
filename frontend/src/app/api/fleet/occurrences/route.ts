import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL 
  ? `${process.env.BACKEND_URL}/api/fleet/occurrences` 
  : 'http://localhost:8080/api/fleet/occurrences';

export async function GET() {
  try {
    const res = await fetch(BACKEND_URL);
    if (!res.ok) return NextResponse.json([], { status: 200 });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const res = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao salvar falha operacional' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID ausente' }, { status: 400 });

    await fetch(`${BACKEND_URL}/${id}`, { method: 'DELETE' });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Falha ao deletar registro' }, { status: 500 });
  }
}
