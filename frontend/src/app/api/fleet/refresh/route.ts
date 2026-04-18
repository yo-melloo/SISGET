import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';
import util from 'util';
import fs from 'fs';

const execPromise = util.promisify(exec);

export async function POST() {
  try {
    const sisgetDir = path.resolve(process.cwd(), '..');
    
    // Prioridade: Venv do Bot > Python Portátil > Global
    const venvPython = path.join(sisgetDir, 'bot', 'venv', 'Scripts', 'python.exe');
    const portablePython = path.join(sisgetDir, 'runtime', 'python', 'python.exe');
    
    let pythonPath = 'python';
    if (fs.existsSync(venvPython)) {
        pythonPath = venvPython;
    } else if (fs.existsSync(portablePython)) {
        pythonPath = portablePython;
    }
    
    const botDir = path.join(sisgetDir, 'bot');
    const scriptPath = path.join(botDir, 'scrape_bot.py');

    console.log(`[REFRESH] Disparando sincronização: ${pythonPath}`);
    
    // Executa o bot e AGUARDA (await) para manter o Loading Lock no frontend.
    // Timeout de 30s conforme solicitado.
    await execPromise(`"${pythonPath}" "${scriptPath}"`, { 
      cwd: botDir,
      timeout: 30000 
    });
    
    console.log(`[REFRESH] Bot finalizado com sucesso.`);

    return NextResponse.json({ 
      success: true, 
      message: 'Sincronização concluída' 
    });

  } catch (error: any) {
    console.error('[REFRESH] Erro ao disparar bot:', error);
    return NextResponse.json({ error: 'Falha ao disparar bot' }, { status: 500 });
  }
}
