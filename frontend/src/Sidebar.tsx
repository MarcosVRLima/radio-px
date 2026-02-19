import type { Mode } from './types.js';

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (val: boolean) => void;
  mode: Mode;
  setMode: (mode: Mode) => void;
  isPowerOn: boolean;
  userInfo: { name: string; userId: string } | null;
  togglePower: () => void;
}

export default function Sidebar({ isSidebarOpen, setIsSidebarOpen, mode, setMode, isPowerOn, userInfo, togglePower }: SidebarProps) {
  return (
    <>
      {isSidebarOpen && <div className="md:hidden fixed inset-0 bg-black/60 z-20" onClick={() => setIsSidebarOpen(false)}></div>}
      
      <div className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition duration-300 ease-in-out z-30 bg-theme-darker w-64 border-r border-gray-800 flex flex-col shadow-2xl`}>
        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-2xl font-black italic text-theme-orange tracking-tight">PX BASE</h2>
          <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setIsSidebarOpen(false)}>✕</button>
        </div>
        
        <div className="p-4 flex-1 flex flex-col gap-2 mt-4">
          <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-2 px-2">Canais</p>
          {(['local', 'group', 'private'] as Mode[]).map(m => (
            <button key={m} onClick={() => { setMode(m); setIsSidebarOpen(false); }} 
              className={`w-full text-left py-4 px-4 rounded font-black uppercase transition-all tracking-wide ${mode === m ? 'bg-theme-orange text-black' : 'bg-transparent text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
              {m === 'local' ? '📡 PX Local' : m === 'group' ? '👥 Grupo' : '🔒 Privado'}
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-gray-800">
          <p className={`text-xs uppercase font-bold tracking-wider mb-3 ${isPowerOn ? 'text-white' : 'text-gray-500'}`}>
            {userInfo ? <><span className="text-theme-orange">{userInfo.name}</span><br/>ID: {userInfo.userId}</> : 'Sistema Desligado'}
          </p>
          <button onClick={togglePower} className={`w-full text-white text-sm uppercase font-bold px-4 py-3 rounded shadow transition-colors ${isPowerOn ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}>
            {isPowerOn ? 'DESLIGAR RÁDIO' : 'LIGAR RÁDIO'}
          </button>
        </div>
      </div>
    </>
  );
}