export type Mode = 'local' | 'group' | 'private';

export interface LogMsg { id: number; sender: string; text: string; color: string; time: string; }
export interface Contact { id: string; name: string; }
export interface GroupReq { requesterId: string; requesterName: string; groupName: string; }
export interface PrivateReq { requesterUserId: string; requesterName: string; }

// Nova tipagem para o Modal de Grupos
export interface GroupInfo { name: string; membersCount: number; }