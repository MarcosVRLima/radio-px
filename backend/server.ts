import express, { type Application } from 'express';
import { createServer, Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';

const app: Application = express();
const httpServer: HttpServer = createServer(app);

// Configuração do Socket liberando acesso para o React (Frontend)
const io: Server = new Server(httpServer, { 
    cors: { origin: "*" } 
});

// Rota básica apenas para sabermos que o servidor Node está rodando
app.get('/', (req, res) => {
    res.send('📡 Servidor Rádio PX API operando 100%');
});

// --- TIPAGENS ---
interface User { 
    socketId: string; 
    userId: string; 
    name: string; 
    lat: number; 
    lng: number; 
    allowedPrivate: Set<string>; 
}

interface Group { 
    adminId: string; 
    members: Set<string>; 
}

// --- ESTADOS DO SERVIDOR ---
const onlineUsers = new Map<string, User>();
const activeGroups = new Map<string, Group>();

// --- FUNÇÃO AUXILIAR: CÁLCULO DE DISTÂNCIA GPS (Haversine) ---
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; 
    const dLat = (lat2 - lat1) * (Math.PI / 180); 
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + 
              Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2); 
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

// Atualiza a lista de grupos disponíveis para todos os usuários conectados
function broadcastGroups() {
    const groupsList = Array.from(activeGroups.entries()).map(([name, group]) => ({ 
        name, 
        membersCount: group.members.size 
    }));
    io.emit('available-groups', groupsList);
}

// --- MIDDLEWARE DE AUTENTICAÇÃO ---
io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Acesso negado. Token não fornecido.'));
    
    // SIMULAÇÃO: Aqui você conectaria com a API do sistema de rastreio em Java do seu amigo
    socket.data.userId = `motorista_${Math.floor(Math.random() * 1000)}`; 
    socket.data.name = `Motorista ${Math.floor(Math.random() * 100)}`;
    next();
});

// --- LÓGICA PRINCIPAL DO SOCKET ---
io.on('connection', (socket: Socket) => {
    console.log(`[+] Conectado: ${socket.data.name} (ID: ${socket.data.userId})`);

    // 1. Registro do Usuário
    onlineUsers.set(socket.id, { 
        socketId: socket.id, 
        userId: socket.data.userId, 
        name: socket.data.name, 
        lat: 0, 
        lng: 0, 
        allowedPrivate: new Set() 
    });
    
    // O usuário entra em uma "sala" com o próprio ID para receber mensagens privadas
    socket.join(socket.data.userId); 

    // Envia os dados do usuário para o próprio frontend dele
    socket.emit('my-info', { userId: socket.data.userId, name: socket.data.name });
    
    // Envia a lista de grupos ativos assim que ele conecta
    socket.emit('available-groups', Array.from(activeGroups.entries()).map(([name, group]) => ({ name, membersCount: group.members.size })));

    // 2. Atualização de GPS
    socket.on('update-location', (coords) => {
        const user = onlineUsers.get(socket.id);
        if (user) { 
            user.lat = coords.lat; 
            user.lng = coords.lng; 
        }
    });

    // --- GERENCIAMENTO DE GRUPOS ---
    socket.on('create-group', (groupName: string) => {
        if(!activeGroups.has(groupName)) {
            activeGroups.set(groupName, { adminId: socket.id, members: new Set([socket.id]) });
            socket.join(groupName);
            socket.emit('system-msg', `Grupo "${groupName}" criado com sucesso.`);
            socket.emit('joined-group', groupName); // Confirma pro criador que ele já está dentro
            broadcastGroups();
        } else {
            socket.emit('system-error', `O grupo "${groupName}" já existe.`);
        }
    });

    socket.on('request-join-group', (groupName: string) => {
        const group = activeGroups.get(groupName);
        if (group) {
            // Envia o pedido para o criador (admin) do grupo
            io.to(group.adminId).emit('group-join-request', { requesterId: socket.id, requesterName: socket.data.name, groupName });
            socket.emit('system-msg', `Pedido enviado. Aguardando a aprovação do criador do grupo "${groupName}".`);
        } else {
            socket.emit('system-error', `O grupo não existe mais ou foi encerrado.`);
        }
    });

    socket.on('approve-join', ({ requesterId, groupName }) => {
        const group = activeGroups.get(groupName);
        if (group && group.adminId === socket.id) {
            io.in(requesterId).socketsJoin(groupName);
            group.members.add(requesterId);
            io.to(requesterId).emit('system-msg', `Seu acesso ao grupo "${groupName}" foi APROVADO!`);
            io.to(requesterId).emit('joined-group', groupName); // Libera o app do usuário para transmitir
            broadcastGroups(); // Atualiza contador de membros para todos
        }
    });

    // --- GERENCIAMENTO DE PRIVADO (Mão Dupla) ---
    socket.on('request-private-chat', (targetUserId: string) => {
        const target = Array.from(onlineUsers.values()).find(u => u.userId === targetUserId);
        if (target) {
            io.to(target.socketId).emit('private-chat-request', { requesterUserId: socket.data.userId, requesterName: socket.data.name });
            socket.emit('system-msg', `Convite privado enviado para ${target.name}.`);
        } else {
            socket.emit('system-error', `Usuário com ID ${targetUserId} não encontrado online.`);
        }
    });

    socket.on('approve-private-chat', (requesterUserId: string) => {
        const me = onlineUsers.get(socket.id);
        const requester = Array.from(onlineUsers.values()).find(u => u.userId === requesterUserId);
        if(me && requester) {
            // Autoriza ambos os lados simultaneamente
            me.allowedPrivate.add(requesterUserId); 
            requester.allowedPrivate.add(me.userId); 
            
            // Avisa os dois lados que o canal foi estabelecido
            socket.emit('private-chat-established', { id: requester.userId, name: requester.name });
            io.to(requester.socketId).emit('private-chat-established', { id: me.userId, name: me.name });
            
            socket.emit('system-msg', `Você aceitou falar com ${requester.name}.`);
            io.to(requester.socketId).emit('system-msg', `${me.name} aceitou o seu convite privado!`);
        }
    });

    // --- ROTEAMENTO DE ÁUDIO ---
    socket.on('audio-stream', (data: any) => {
        const sender = onlineUsers.get(socket.id);
        if (!sender) return;
        
        const emitData = { 
            senderName: sender.name, 
            blob: data.blob, 
            mode: data.mode, 
            isPrivate: data.mode === 'private' 
        };

        if (data.mode === 'group' && data.targetId) {
            // Envia para todos na sala do grupo
            socket.to(data.targetId).emit('audio-stream', emitData);
        } 
        else if (data.mode === 'private' && data.targetId) {
            // Verifica se tem permissão na lista do destinatário
            const target = Array.from(onlineUsers.values()).find(u => u.userId === data.targetId);
            if (target && target.allowedPrivate.has(sender.userId)) {
                socket.to(data.targetId).emit('audio-stream', emitData);
            } else {
                socket.emit('system-error', `Você não tem permissão para enviar áudio para este contato.`);
            }
        } 
        else if (data.mode === 'local') {
            // Calcula a distância de todos os usuários online e envia se estiver no raio
            const radius = data.radiusKm || 5; 
            onlineUsers.forEach((targetUser) => {
                if (targetUser.socketId !== socket.id) {
                    const distance = getDistanceFromLatLonInKm(sender.lat, sender.lng, targetUser.lat, targetUser.lng);
                    if (distance <= radius) {
                        io.to(targetUser.socketId).emit('audio-stream', emitData);
                    }
                }
            });
        }
    });

    // --- DESCONEXÃO ---
    socket.on('disconnect', () => {
        console.log(`[-] Desconectado: ${socket.data.name}`);
        onlineUsers.delete(socket.id);
        broadcastGroups(); // Atualiza a lista caso ele fosse membro de algum grupo
    });
});

const PORT: number = 3000;
httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor Rádio PX rodando na porta ${PORT}`);
});