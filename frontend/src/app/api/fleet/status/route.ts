import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const botDataPath = path.join(process.cwd(), '..', 'bot', 'fleet_data.js');
    
    if (!fs.existsSync(botDataPath)) {
      return NextResponse.json({ error: 'Arquivo do bot não encontrado' }, { status: 404 });
    }

    const fileContent = fs.readFileSync(botDataPath, 'utf8');
    
    try {
      let jsonString = fileContent.trim();
      jsonString = jsonString.replace(/^window\.fleetData\s*=\s*/, '');
      
      if (jsonString.endsWith(';')) {
        jsonString = jsonString.slice(0, -1);
      }
      
      const data = JSON.parse(jsonString.trim());
      return NextResponse.json(data);
    } catch (parseError) {
      console.error('Erro ao parsear fleet_data.js:', parseError);
      return NextResponse.json({ error: 'Dados do bot mal formatados' }, { status: 500 });
    }
  } catch (error) {
    console.error('Erro na API de frota:', error);
    return NextResponse.json({ error: 'Falha interna na API' }, { status: 500 });
  }
}
