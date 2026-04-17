import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';
import util from 'util';
import fs from 'fs';

const execPromise = util.promisify(exec);

export async function POST() {
  try {
    // Resolve caminhos absolutos para evitar erros de CWD
    // O frontend está em sisget/frontend, subimos um nível para sisget/
    const frontendDir = process.cwd();
    const sisgetDir = path.resolve(frontendDir, '..');
    
    // 1. Tenta o Python Portátil em sisget/runtime/python/python.exe
    const portablePython = path.join(sisgetDir, 'runtime', 'python', 'python.exe');
    
    // 2. Se não existir, usa o do sistema como fallback
    const pythonPath = fs.existsSync(portablePython) ? portablePython : 'python';
    
    const botDir = path.join(sisgetDir, 'bot');
    const scriptPath = path.join(botDir, 'scrape_bot.py');

    console.log(`[REFRESH] Usando runtime: ${pythonPath === 'python' ? 'SISTEMA' : 'PORTÁTIL'}`);
    console.log(`[REFRESH] Script: ${scriptPath}`);
    
    // Executa e aguarda o resultado do scraper otimizado (< 1s)
    const { stdout, stderr } = await execPromise(`"${pythonPath}" "${scriptPath}"`, { 
      cwd: botDir,
      timeout: 30000 // 30 segundos é mais que suficiente para o novo bot
    });
    
    if (stderr && !stdout) {
      console.warn('[REFRESH] Avisos do bot (stderr):', stderr);
    }

    console.log('[REFRESH] Bot finalizado com sucesso');
    return NextResponse.json({ 
      success: true, 
      message: 'Frota atualizada com sucesso',
      logs: stdout 
    });

  } catch (error: any) {
    console.error('[REFRESH] Falha Crítica:', error);
    return NextResponse.json({ 
      error: 'Falha ao atualizar frota', 
      details: error.message,
      command: error.cmd
    }, { status: 500 });
  }
}
