import type { Mode, Contact, GroupInfo } from './types';

interface ControlPanelProps {
  mode: Mode;
  radius: string; setRadius: (val: string) => void;
  isLocalMuted: boolean; setIsLocalMuted: (val: boolean) => void;
  contacts: Contact[];
  selectedContact: string | null;
  myGroups: string[];
  availableGroups: GroupInfo[];
  groupName: string;
  setShowContactsModal: (val: boolean) => void;
  setShowGroupsModal: (val: boolean) => void;
  setShowAddGroupModal: (val: boolean) => void;
  setShowAddContactModal: (val: boolean) => void;
}

export default function ControlPanel(props: ControlPanelProps) {
  const { mode } = props;

  return (
    <div className="p-6 bg-black/40 border-b border-gray-800 flex-shrink-0">
      
      {/* MODO LOCAL */}
      {mode === 'local' && (
        <div className="max-w-xl">
          <label className="text-xs text-theme-orange font-bold uppercase tracking-widest">Configuração Local</label>
          <div className="flex gap-4 mt-2 items-center">
            
            {/* Input Bonito com o "KM" embutido */}
            <div className="flex items-center bg-gray-900 border border-gray-700 rounded-lg focus-within:border-theme-orange overflow-hidden w-32 shadow-inner transition-colors">
              <input 
                type="number" 
                value={props.radius} 
                onChange={e => props.setRadius(e.target.value)} 
                className="w-full p-3 bg-transparent text-white font-bold text-xl text-center focus:outline-none" 
                style={{ appearance: 'textfield', WebkitAppearance: 'none' }} // Esconde as setinhas de número
              />
              <span className="pr-4 text-theme-orange font-black text-sm select-none">KM</span>
            </div>

            <button onClick={() => props.setIsLocalMuted(!props.isLocalMuted)} className={`px-6 py-3 rounded-lg font-black text-xs sm:text-sm uppercase transition-all shadow-md ${!props.isLocalMuted ? 'bg-green-600 text-white' : 'bg-red-900/60 text-gray-400 border border-red-900'}`}>
              {props.isLocalMuted ? '🔇 Escuta Desativada' : '🔊 Escuta Ativa'}
            </button>
          </div>
        </div>
      )}

      {/* MODO GRUPO */}
      {mode === 'group' && (
        <div className="max-w-2xl">
          <label className="text-xs text-theme-orange font-bold uppercase tracking-widest mb-3 block">Gerenciar Grupos</label>
          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={() => props.setShowAddGroupModal(true)} className="flex-1 py-4 bg-purple-700 hover:bg-purple-600 rounded-lg font-black uppercase transition-all shadow-lg flex items-center justify-center gap-2">
              <span className="text-xl">➕</span> Adicionar Grupo
            </button>
            <button onClick={() => props.setShowGroupsModal(true)} className="flex-1 py-4 border-2 border-purple-500 text-purple-400 rounded-lg font-black uppercase hover:bg-purple-700 hover:text-white transition-all flex items-center justify-center gap-2">
              <span className="text-xl">📋</span> Lista de Grupos <span className="bg-purple-900 text-white px-2 py-1 rounded-full text-xs ml-1">{props.availableGroups.length}</span>
            </button>
          </div>
          
          {/* Status do Grupo Atual */}
          {props.myGroups.includes(props.groupName) && props.groupName !== '' ? (
            <div className="mt-4 bg-green-900/30 border border-green-800 p-3 rounded text-center">
               <p className="text-sm text-green-400 font-bold tracking-wider uppercase">📡 SINTONIZADO NO GRUPO: <span className="text-white">{props.groupName}</span></p>
            </div>
          ) : (
            <div className="mt-4 text-center">
               <p className="text-sm text-gray-500 font-bold tracking-wider uppercase">Nenhum grupo sintonizado</p>
            </div>
          )}
        </div>
      )}

      {/* MODO PRIVADO */}
      {mode === 'private' && (
        <div className="max-w-2xl">
          <label className="text-xs text-theme-orange font-bold uppercase tracking-widest mb-3 block">Contatos Privados</label>
          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={() => props.setShowAddContactModal(true)} className="flex-1 py-4 bg-theme-orange hover:bg-orange-500 text-black rounded-lg font-black uppercase transition-all shadow-lg flex items-center justify-center gap-2">
              <span className="text-xl">➕</span> Novo Contato
            </button>
            <button onClick={() => props.setShowContactsModal(true)} className="flex-1 py-4 border-2 border-theme-orange text-theme-orange rounded-lg font-black uppercase hover:bg-theme-orange hover:text-black transition-all flex items-center justify-center gap-2">
              <span className="text-xl">📖</span> Agenda PX <span className="bg-theme-darker text-white px-2 py-1 rounded-full text-xs ml-1">{props.contacts.length}</span>
            </button>
          </div>

          {/* Status do Contato Atual */}
          {props.selectedContact ? (
            <div className="mt-4 bg-theme-orange/20 border border-theme-orange/50 p-3 rounded text-center">
               <p className="text-sm text-theme-orange font-bold tracking-wider uppercase">🎙️ FALANDO COM: <span className="text-white">{props.contacts.find(c => c.id === props.selectedContact)?.name}</span></p>
            </div>
          ) : (
            <div className="mt-4 text-center">
               <p className="text-sm text-gray-500 font-bold tracking-wider uppercase">Selecione um contato para falar</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}