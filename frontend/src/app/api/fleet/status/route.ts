import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Caminho para o arquivo gerado pelo bot
    // process.cwd() aponta para sisget/frontend
    const botDataPath = path.join(process.cwd(), '..', 'bot', 'fleet_data.js');
    
    if (!fs.existsSync(botDataPath)) {
      return NextResponse.json({ error: 'Arquivo do bot não encontrado' }, { status: 404 });
    }

    const fileContent = fs.readFileSync(botDataPath, 'utf8');
    
    // Extrai o JSON removendo o "window.fleetData = "
    const jsonString = fileContent.replace('window.fleetData = ', '').trim();
    
    // Remove o ponto e vírgula final se existir
    const cleanJson = jsonString.endsWith(';') ? jsonString.slice(0, -1) : jsonString;
    
    const data = JSON.parse(cleanJson);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao ler dados da frota:', error);
    return NextResponse.json({ error: 'Falha ao processar dados do rastreio' }, { status: 500 });
  }
}
