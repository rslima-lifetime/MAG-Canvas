const fs = require('fs');
const file = 'c:/Users/roslima/OneDrive - MAG/Área de Trabalho/Projetos/MAG Canvas/MAG-Canvas/components/WelcomeScreen.tsx';
let code = fs.readFileSync(file, 'utf8');

const t1 = /<button\s+onClick=\{\(\) => setActiveTab\('TEMPLATES'\)\}\s+className=\{	ext-xs font-black uppercase tracking-widest pb-4 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap \$\{activeTab === 'TEMPLATES' \? 'text-\[\#006098\] border-\[\#006098\]' : 'text-slate-300 border-transparent hover:text-slate-400'\}\}\s*>\s*<LayoutTemplate size=\{14\} \/> Modelos Prontos\s*<span className="bg-emerald-100 text-emerald-600 border border-emerald-200 text-\[8px\] px-1\.5 py-0\.5 rounded-full ml-1">Novo<\/span>\s*<\/button>/g;

const t2 = /<button\s+onClick=\{\(\) => setActiveTab\('SAVED'\)\}\s+className=\{	ext-xs font-black uppercase tracking-widest pb-4 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap \$\{activeTab === 'SAVED' \? 'text-\[\#006098\] border-\[\#006098\]' : 'text-slate-300 border-transparent hover:text-slate-400'\}\}\s*>\s*Projetos Salvos\s*<span className="bg-slate-100 text-slate-500 text-\[9px\] px-1\.5 py-0\.5 rounded-full ml-1\">\s*\{user \? uniqueCloudProjects\.length : savedProjects\.length\}\s*<\/span>\s*<\/button>/g;

code = code.replace(t1, '%%TEMP_TEMPLATES%%');
code = code.replace(t2, '%%TEMP_SAVED%%');

const newTemplates = \<button 
                onClick={() => setActiveTab('TEMPLATES')}
                className={\\\	ext-xs font-black uppercase tracking-widest pb-4 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap \\\\}
              >
                <LayoutTemplate size={14} /> Modelos Prontos
              </button>\;

const newSaved = \<button 
                onClick={() => setActiveTab('SAVED')}
                className={\\\	ext-xs font-black uppercase tracking-widest pb-4 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap \\\\}
              >
                <HardDrive size={14} /> Projetos Salvos 
                <span className="bg-slate-100 text-slate-500 text-[9px] px-1.5 py-0.5 rounded-full ml-1">
                  {user ? uniqueCloudProjects.length : savedProjects.length}
                </span>
              </button>\;

code = code.replace('%%TEMP_TEMPLATES%%', newSaved);
code = code.replace('%%TEMP_SAVED%%', newTemplates);

fs.writeFileSync(file, code, 'utf8');
console.log('DONE');
