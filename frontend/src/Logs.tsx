import type { RefObject } from 'react';
import type { LogMsg } from './types.js';

interface LogsProps {
  logs: LogMsg[];
  logsEndRef: RefObject<HTMLDivElement | null>;
}

export default function Logs({ logs, logsEndRef }: LogsProps) {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-black/10">
      {logs.map(log => (
        <div key={log.id} className="bg-gray-900/80 p-4 rounded-xl rounded-tl-none border border-gray-800 max-w-2xl shadow-md">
          <div className="flex justify-between items-center mb-2">
            <strong className="text-theme-orange font-black uppercase text-xs tracking-wider">{log.sender}</strong>
            <span className="text-xs text-gray-600 font-bold">{log.time}</span>
          </div>
          <span className={`${log.color} font-medium tracking-wide`}>{log.text}</span>
        </div>
      ))}
      {/* Elemento invisível usado para forçar o scroll para o final */}
      <div ref={logsEndRef} />
    </div>
  );
}