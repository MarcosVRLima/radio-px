import type { GroupReq, PrivateReq, Contact, Mode, GroupInfo } from './types';

interface ModalsProps {
  groupRequests: GroupReq[];
  privateRequests: PrivateReq[];
  showContactsModal: boolean;
  showGroupsModal: boolean;
  showAddGroupModal: boolean;
  showAddContactModal: boolean;
  contacts: Contact[];
  availableGroups: GroupInfo[];
  myGroups: string[];
  selectedContact: string | null;
  groupName: string;
  privateTarget: string;
  
  // Ações
  handleGroupRequest: (accept: boolean) => void;
  handlePrivateRequest: (accept: boolean) => void;
  handleJoinGroup: (group: string) => void;
  handleRequestPrivate: () => void;
  onCreateGroup: () => void;
  
  // Setters
  setShowContactsModal: (val: boolean) => void;
  setShowGroupsModal: (val: boolean) => void;
  setShowAddGroupModal: (val: boolean) => void;
  setShowAddContactModal: (val: boolean) => void;
  setSelectedContact: (id: string) => void;
  setMode: (mode: Mode) => void;
  setGroupName: (name: string) => void;
  setPrivateTarget: (target: string) => void;
}

export default function Modals(props: ModalsProps) {
  return (
    <>
      {/* Modais de Pedidos Recebidos (Permissões) */}
      {props.groupRequests.length > 0 && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-theme-darker border border-theme-orange p-6 rounded-xl max-w-sm w-full shadow-[0_0_30px_rgba(255,140,0,0.15)]">
            <h3 className="text-theme-orange font-black text-xl mb-2 uppercase">Acesso ao Grupo</h3>
            <p className="text-gray-300 mb-6">O motorista <strong className="text-white">{props.groupRequests[0].requesterName}</strong> pede para entrar em <strong className="text-theme-orange">{props.groupRequests[0].groupName}</strong>.</p>
            <div className="flex gap-3">
              <button onClick={() => props.handleGroupRequest(true)} className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded uppercase transition">Permitir</button>
              <button onClick={() => props.handleGroupRequest(false)} className="flex-1 bg-red-800 hover:bg-red-700 text-white font-bold py-3 rounded uppercase transition">Negar</button>
            </div>
          </div>
        </div>
      )}

      {props.privateRequests.length > 0 && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-theme-darker border border-blue-500 p-6 rounded-xl max-w-sm w-full shadow-[0_0_30px_rgba(59,130,246,0.15)]">
            <h3 className="text-blue-400 font-black text-xl mb-2 uppercase">Novo Contato</h3>
            <p className="text-gray-300 mb-6">O motorista <strong className="text-white">{props.privateRequests[0].requesterName}</strong> quer estabelecer um canal privado com você.</p>
            <div className="flex gap-3">
              <button onClick={() => props.handlePrivateRequest(true)} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded uppercase transition">Aceitar</button>
              <button onClick={() => props.handlePrivateRequest(false)} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded uppercase transition">Recusar</button>
            </div>
          </div>
        </div>
      )}

      {/* NOVO MODAL: Adicionar / Criar Grupo */}
      {props.showAddGroupModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-theme-darker border border-purple-500 p-6 rounded-xl max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
              <h3 className="text-purple-400 font-black text-xl uppercase">Sintonizar Grupo</h3>
              <button onClick={() => props.setShowAddGroupModal(false)} className="text-gray-400 hover:text-white text-xl font-bold">✕</button>
            </div>
            <label className="text-xs text-gray-400 font-bold uppercase mb-2 block">Nome exato do grupo</label>
            <input type="text" value={props.groupName} onChange={e => props.setGroupName(e.target.value)} placeholder="Ex: comboio-sul" className="w-full p-4 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none font-bold text-lg mb-6" />
            
            <div className="flex gap-3">
              <button onClick={() => { props.onCreateGroup(); props.setShowAddGroupModal(false); }} className="flex-1 bg-purple-700 hover:bg-purple-600 text-white py-4 rounded-lg font-black uppercase transition">Criar Novo</button>
              <button onClick={() => { props.handleJoinGroup(props.groupName); props.setShowAddGroupModal(false); }} className="flex-1 border-2 border-purple-500 text-purple-400 hover:bg-purple-700 hover:text-white py-4 rounded-lg font-black uppercase transition">Pedir Acesso</button>
            </div>
          </div>
        </div>
      )}

      {/* NOVO MODAL: Adicionar Contato (Privado) */}
      {props.showAddContactModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-theme-darker border border-theme-orange p-6 rounded-xl max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
              <h3 className="text-theme-orange font-black text-xl uppercase">Novo Contato</h3>
              <button onClick={() => props.setShowAddContactModal(false)} className="text-gray-400 hover:text-white text-xl font-bold">✕</button>
            </div>
            <label className="text-xs text-gray-400 font-bold uppercase mb-2 block">ID do Motorista</label>
            <input type="text" value={props.privateTarget} onChange={e => props.setPrivateTarget(e.target.value)} placeholder="Ex: motorista_123" className="w-full p-4 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-theme-orange focus:outline-none font-bold text-lg mb-6" />
            
            <button onClick={() => { props.handleRequestPrivate(); props.setShowAddContactModal(false); }} className="w-full bg-theme-orange hover:bg-orange-500 text-black py-4 rounded-lg font-black uppercase transition shadow-lg">
              Enviar Convite
            </button>
          </div>
        </div>
      )}

      {/* MODAL: Lista de Grupos */}
      {props.showGroupsModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-theme-darker border border-gray-700 p-6 rounded-xl max-w-md w-full shadow-2xl flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
              <h3 className="text-purple-400 font-black text-xl uppercase">Grupos Abertos</h3>
              <button onClick={() => props.setShowGroupsModal(false)} className="text-gray-400 hover:text-white text-xl font-bold">✕</button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
              {props.availableGroups.length === 0 ? (
                <div className="text-center py-10 text-gray-500 italic">Nenhum grupo ativo no momento.</div>
              ) : (
                props.availableGroups.map(g => (
                  <div key={g.name} className="bg-gray-900 border border-gray-800 p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-white uppercase">{g.name}</p>
                      <p className="text-xs text-gray-400">{g.membersCount} {g.membersCount === 1 ? 'membro' : 'membros'}</p>
                    </div>
                    
                    {props.myGroups.includes(g.name) ? (
                      <button onClick={() => { props.setGroupName(g.name); props.setMode('group'); props.setShowGroupsModal(false); }} className="bg-green-700 text-white px-4 py-2 rounded text-xs font-bold uppercase w-full sm:w-auto">
                        Sintonizar
                      </button>
                    ) : (
                      <button onClick={() => { props.handleJoinGroup(g.name); props.setShowGroupsModal(false); }} className="bg-purple-700 hover:bg-purple-600 text-white px-4 py-2 rounded text-xs font-bold uppercase w-full sm:w-auto transition">
                        Pedir Acesso
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Lista de Contatos */}
      {props.showContactsModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-theme-darker border border-gray-700 p-6 rounded-xl max-w-md w-full shadow-2xl flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
              <h3 className="text-theme-orange font-black text-xl uppercase">Sua Agenda PX</h3>
              <button onClick={() => props.setShowContactsModal(false)} className="text-gray-400 hover:text-white text-xl font-bold">✕</button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-2">
              {props.contacts.length === 0 ? (
                <div className="text-center py-10 text-gray-500 italic">Você ainda não tem contatos adicionados.</div>
              ) : (
                props.contacts.map(c => (
                  <button key={c.id} 
                    onClick={() => { props.setSelectedContact(c.id); props.setMode('private'); props.setShowContactsModal(false); }} 
                    className={`w-full text-left p-4 rounded-lg flex items-center justify-between transition-all border ${props.selectedContact === c.id ? 'bg-theme-orange text-black font-black border-theme-orange' : 'bg-gray-900/50 text-gray-300 font-bold hover:bg-gray-800 border-gray-800'}`}>
                    <span>🎙️ {c.name}</span>
                    {props.selectedContact === c.id && <span className="text-xs uppercase bg-black text-theme-orange px-2 py-1 rounded">Selecionado</span>}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}