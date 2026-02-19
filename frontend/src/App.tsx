import { useState, useRef, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Mode, LogMsg, Contact, GroupReq, PrivateReq, GroupInfo } from './types';
import Sidebar from './Sidebar';
import ControlPanel from './ControlPanel';
import Modals from './Modals';
import Logs from './Logs';
import PttArea from './PttArea';

export default function App() {
  const [isSystemStarted, setIsSystemStarted] = useState(false);
  const [isPowerOn, setIsPowerOn] = useState(false);
  const [mode, setMode] = useState<Mode>('local');
  const [userInfo, setUserInfo] = useState<{ name: string; userId: string } | null>(null);
  const [logs, setLogs] = useState<LogMsg[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  
  // Modais e Layout
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // AQUI FOI A MUDANÇA: Começa como TRUE (Mutado)
  const [isLocalMuted, setIsLocalMuted] = useState(true);
  const [showContactsModal, setShowContactsModal] = useState(false);
  const [showGroupsModal, setShowGroupsModal] = useState(false);
  
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);
  const [showAddContactModal, setShowAddContactModal] = useState(false);

  // Contatos e Grupos
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [myGroups, setMyGroups] = useState<string[]>([]); 
  const [availableGroups, setAvailableGroups] = useState<GroupInfo[]>([]);
  
  // Filas de Pedidos e Controle de Spam
  const [groupRequests, setGroupRequests] = useState<GroupReq[]>([]);
  const [privateRequests, setPrivateRequests] = useState<PrivateReq[]>([]);
  const [sentRequests, setSentRequests] = useState<string[]>([]);
  const [sentGroupRequests, setSentGroupRequests] = useState<string[]>([]); 

  // Inputs
  const [radius, setRadius] = useState('5');
  const [groupName, setGroupName] = useState('');
  const [privateTarget, setPrivateTarget] = useState('');

  const socketRef = useRef<Socket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const isLocalMutedRef = useRef(isLocalMuted);

  useEffect(() => { isLocalMutedRef.current = isLocalMuted; }, [isLocalMuted]);
  useEffect(() => { logsEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [logs]);

  const addLog = (sender: string, text: string, color = 'text-gray-300') => {
    setLogs(prev => [...prev, { id: Date.now() + Math.random(), sender, text, color, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
  };

  const playBeeps = (count: number) => {
    if (count <= 0) return;
    const ctx = new (window.AudioContext || window.AudioContext)();
    const startTime = ctx.currentTime;
    for (let i = 0; i < count; i++) {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = 880; osc.type = 'sine';
      osc.start(startTime + i * 0.25); osc.stop(startTime + i * 0.25 + 0.15);
      gain.gain.setValueAtTime(0, startTime + i * 0.25);
      gain.gain.linearRampToValueAtTime(0.5, startTime + i * 0.25 + 0.02); gain.gain.linearRampToValueAtTime(0, startTime + i * 0.25 + 0.15);
    }
  };

  const togglePower = async () => {
    if (!isPowerOn) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioStreamRef.current = stream;
        
        const socket = io(`http://${window.location.hostname}:3000`, { auth: { token: 'TOKEN_REACT' } });
        socketRef.current = socket;

        socket.on('my-info', (data) => setUserInfo(data));
        socket.on('system-msg', (msg) => addLog('SISTEMA', msg, 'text-yellow-400'));
        socket.on('system-error', (msg) => addLog('ERRO', msg, 'text-red-500 font-bold'));

        socket.on('available-groups', (groups: GroupInfo[]) => setAvailableGroups(groups));
        socket.on('joined-group', (gName: string) => {
          setMyGroups(prev => prev.includes(gName) ? prev : [...prev, gName]);
          setGroupName(gName); 
        });

        socket.on('group-join-request', (data: GroupReq) => setGroupRequests(prev => [...prev, data]));
        socket.on('private-chat-request', (data: PrivateReq) => setPrivateRequests(prev => [...prev, data]));

        socket.on('private-chat-established', (contact) => {
          setContacts(prev => { if (!prev.find(c => c.id === contact.id)) return [...prev, contact]; return prev; });
          setSelectedContact(contact.id);
        });

        socket.on('audio-stream', (data) => {
          if (data.mode === 'local' && isLocalMutedRef.current) return;
          const beepCount = data.mode === 'private' ? 2 : data.mode === 'group' ? 1 : 0;
          addLog(data.senderName, `Transmitindo (${data.mode.toUpperCase()})`, data.mode === 'private' ? 'text-green-400' : 'text-gray-300');
          playBeeps(beepCount);
          setTimeout(() => { new Audio(URL.createObjectURL(new Blob([data.blob], { type: 'audio/webm' }))).play(); }, beepCount > 0 ? (beepCount * 250) + 100 : 0);
        });

        if ("geolocation" in navigator) navigator.geolocation.watchPosition(p => socket.emit('update-location', { lat: p.coords.latitude, lng: p.coords.longitude }), null, { enableHighAccuracy: true });

        setIsPowerOn(true);
        addLog('SISTEMA', 'Rádio Online', 'text-green-400');
      } catch (err) { alert("Permita o uso do microfone."); }
    } else {
      audioStreamRef.current?.getTracks().forEach(track => track.stop());
      socketRef.current?.disconnect();
      setIsPowerOn(false); setUserInfo(null); setContacts([]); setSentRequests([]); setMyGroups([]); setSentGroupRequests([]);
    }
  };

  const handleRequestPrivate = () => {
    const target = privateTarget.trim();
    if (!target) return;
    if (contacts.some(c => c.id === target)) return addLog('SISTEMA', 'Usuário já está na sua agenda.', 'text-yellow-400');
    if (sentRequests.includes(target)) return addLog('SISTEMA', 'Pedido já enviado para esta pessoa.', 'text-yellow-400');
    
    setSentRequests(prev => [...prev, target]);
    socketRef.current?.emit('request-private-chat', target);
    setPrivateTarget('');
  };

  const handleJoinGroup = (targetGroup: string) => {
    const target = targetGroup.trim();
    if (!target) return;
    if (myGroups.includes(target)) return addLog('SISTEMA', `Você já é membro de ${target}.`, 'text-yellow-400');
    if (sentGroupRequests.includes(target)) return addLog('SISTEMA', 'Pedido para este grupo já enviado.', 'text-yellow-400');
    
    setSentGroupRequests(prev => [...prev, target]);
    socketRef.current?.emit('request-join-group', target);
  };

  const handleGroupRequest = (accept: boolean) => {
    const req = groupRequests[0];
    if (accept) socketRef.current?.emit('approve-join', { requesterId: req.requesterId, groupName: req.groupName });
    setGroupRequests(prev => prev.slice(1));
  };

  const handlePrivateRequest = (accept: boolean) => {
    const req = privateRequests[0];
    if (accept) socketRef.current?.emit('approve-private-chat', req.requesterUserId);
    setPrivateRequests(prev => prev.slice(1));
  };

  const startRecord = () => {
    if (!isPowerOn || !audioStreamRef.current) return;
    if (mode === 'private' && !selectedContact) return addLog('SISTEMA', 'Selecione um contato!', 'text-red-500 font-bold');
    if (mode === 'group' && !myGroups.includes(groupName)) return addLog('SISTEMA', 'Você precisa entrar no grupo primeiro.', 'text-red-500 font-bold');

    setIsRecording(true);
    const mediaRecorder = new MediaRecorder(audioStreamRef.current);
    mediaRecorderRef.current = mediaRecorder;
    const chunks: BlobPart[] = [];

    mediaRecorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
    mediaRecorder.onstop = () => {
      const payload: any = { blob: new Blob(chunks, { type: 'audio/webm' }), mode, radiusKm: radius || 5, targetId: mode === 'group' ? groupName : selectedContact };
      socketRef.current?.emit('audio-stream', payload);
      addLog('VOCÊ', `Mensagem Enviada (${mode.toUpperCase()})`, 'text-gray-500');
    };
    mediaRecorder.start();
  };

  const stopRecord = () => {
    if (mediaRecorderRef.current?.state !== "inactive") { mediaRecorderRef.current?.stop(); setIsRecording(false); }
  };

  if (!isSystemStarted) {
    return (
      <div className="bg-theme-bg h-screen w-screen flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl font-bold mb-6 text-theme-orange tracking-wider">RÁDIO PX REACT</h1>
        <button onClick={() => setIsSystemStarted(true)} className="bg-theme-orange text-black font-black py-5 px-10 rounded-full text-2xl shadow-lg transition transform hover:scale-105">LIGAR SISTEMA</button>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen bg-theme-bg text-white overflow-hidden font-sans font-medium">
      
      <Modals 
        groupRequests={groupRequests} privateRequests={privateRequests} 
        showContactsModal={showContactsModal} showGroupsModal={showGroupsModal}
        showAddGroupModal={showAddGroupModal} showAddContactModal={showAddContactModal}
        contacts={contacts} availableGroups={availableGroups} myGroups={myGroups} 
        selectedContact={selectedContact} groupName={groupName} privateTarget={privateTarget}
        handleGroupRequest={handleGroupRequest} handlePrivateRequest={handlePrivateRequest} 
        handleJoinGroup={handleJoinGroup} handleRequestPrivate={handleRequestPrivate}
        onCreateGroup={() => socketRef.current?.emit('create-group', groupName)}
        setShowContactsModal={setShowContactsModal} setShowGroupsModal={setShowGroupsModal}
        setShowAddGroupModal={setShowAddGroupModal} setShowAddContactModal={setShowAddContactModal}
        setSelectedContact={setSelectedContact} setMode={setMode} 
        setGroupName={setGroupName} setPrivateTarget={setPrivateTarget}
      />
      
      <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} mode={mode} setMode={setMode} isPowerOn={isPowerOn} userInfo={userInfo} togglePower={togglePower} />

      <div className="flex-1 flex flex-col relative w-full h-full">
        <header className="md:hidden bg-theme-darker p-4 border-b border-gray-800 flex justify-between items-center flex-shrink-0">
          <button onClick={() => setIsSidebarOpen(true)} className="text-theme-orange p-1 focus:outline-none"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg></button>
          <h2 className="text-lg font-black italic text-theme-orange uppercase">{mode}</h2>
          <div className={`w-3 h-3 rounded-full ${isPowerOn ? 'bg-green-500' : 'bg-red-500'}`}></div>
        </header>

        <ControlPanel 
          mode={mode} radius={radius} setRadius={setRadius} 
          isLocalMuted={isLocalMuted} setIsLocalMuted={setIsLocalMuted} 
          contacts={contacts} selectedContact={selectedContact} myGroups={myGroups}
          availableGroups={availableGroups} groupName={groupName}
          setShowContactsModal={setShowContactsModal} setShowGroupsModal={setShowGroupsModal}
          setShowAddGroupModal={setShowAddGroupModal} setShowAddContactModal={setShowAddContactModal}
        />

        <Logs logs={logs} logsEndRef={logsEndRef} />
        <PttArea isPowerOn={isPowerOn} isRecording={isRecording} startRecord={startRecord} stopRecord={stopRecord} />
      </div>
    </div>
  );
}