
import re

with open('c:/Users/roslima/OneDrive - MAG/Área de Trabalho/Projetos/MAG Canvas/MAG-Canvas/components/WelcomeScreen.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

target_start = code.find('<div className="flex gap-5 overflow-x-auto no-scrollbar pb-0.5 w-full">')
target_end = code.find('<div className="pb-4">', target_start)

if target_start != -1 and target_end != -1:
    tabs_content = '''<div className="flex gap-5 overflow-x-auto no-scrollbar pb-0.5 w-full">
              <button 
                onClick={() => setActiveTab('NEW')}
                className={	ext-xs font-black uppercase tracking-widest pb-4 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap }
              >
                <PlusCircle size={14} /> Novo em Branco
              </button>
              <button 
                onClick={() => setActiveTab('SAVED')}
                className={	ext-xs font-black uppercase tracking-widest pb-4 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap }
              >
                <HardDrive size={14} /> Projetos Salvos 
                <span className="bg-slate-100 text-slate-500 text-[9px] px-1.5 py-0.5 rounded-full ml-1">
                  {user ? uniqueCloudProjects.length : savedProjects.length}
                </span>
              </button>
              <button 
                onClick={() => setActiveTab('TEMPLATES')}
                className={	ext-xs font-black uppercase tracking-widest pb-4 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap }
              >
                <LayoutTemplate size={14} /> Modelos Prontos
              </button>
              {user && (
                <button 
                  onClick={() => setActiveTab('ADMIN')}
                  className={	ext-xs font-black uppercase tracking-widest pb-4 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap }
                >
                  <ShieldCheck size={14} /> Administração
                </button>
              )}
            </div>
            
            '''

    new_code = code[:target_start] + tabs_content + code[target_end:]
    
    with open('c:/Users/roslima/OneDrive - MAG/Área de Trabalho/Projetos/MAG Canvas/MAG-Canvas/components/WelcomeScreen.tsx', 'w', encoding='utf-8') as f:
        f.write(new_code)
    print('SUCCESS')
else:
    print('NOT FOUND', target_start, target_end)

