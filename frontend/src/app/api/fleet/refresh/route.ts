import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';
import util from 'util';
import fs from 'fs';

const execPromise = util.promisify(exec);

export async function POST() {
  try {
    const sisgetDir = path.resolve(process.cwd(), '..');
    
    // Tenta o Python Portátil ou o do sistema
    const portablePython = path.join(sisgetDir, 'runtime', 'python', 'python.exe');
    const pythonPath = fs.existsSync(portablePython) ? portablePython : 'python';
    
    const botDir = path.join(sisgetDir, 'bot');
    const scriptPath = path.join(botDir, 'scrape_bot.py');

    console.log(`[REFRESH] Disparando bot manual: ${pythonPath}`);
    
    // Executa o bot. Ele vai fazer o scrape e dar POST no Spring Boot.
    // Não esperamos o bot terminar para não travar a UI por 20s, 
    // mas o usuário verá o status de "Sincronizando"
    exec(`"${pythonPath}" "${scriptPath}"`, { cwd: botDir });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Bot disparado em segundo plano' 
    });

  } catch (error: any) {
    console.error('[REFRESH] Erro ao disparar bot:', error);
    return NextResponse.json({ error: 'Falha ao disparar bot' }, { status: 500 });
  }
}
