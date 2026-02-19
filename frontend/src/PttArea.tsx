interface PttAreaProps {
  isPowerOn: boolean;
  isRecording: boolean;
  startRecord: () => void;
  stopRecord: () => void;
}

export default function PttArea({ isPowerOn, isRecording, startRecord, stopRecord }: PttAreaProps) {
  return (
    <div className="p-8 bg-theme-darker border-t border-gray-800 flex flex-col items-center justify-center relative flex-shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
      
      {!isPowerOn && (
        <div className="absolute inset-0 bg-black/80 z-10 flex items-center justify-center backdrop-blur-sm">
          <span className="text-gray-400 font-bold uppercase tracking-widest">Rádio Desligado</span>
        </div>
      )}
      
      <h3 className={`text-sm font-black mb-6 tracking-[0.3em] uppercase ${isRecording ? 'text-red-500 animate-pulse' : 'text-gray-600'}`}>
        {isRecording ? 'TX (TRANSMITINDO)' : 'RX (STANDBY)'}
      </h3>
      
      <button 
        onMouseDown={startRecord} 
        onMouseUp={stopRecord} 
        onMouseLeave={stopRecord}
        onTouchStart={startRecord} 
        onTouchEnd={stopRecord}
        className={`w-40 h-40 md:w-48 md:h-48 rounded-full border-[10px] border-black/50 text-black font-black text-4xl shadow-2xl transition-all select-none flex items-center justify-center tracking-tighter ${
          isRecording 
            ? 'bg-red-600 scale-95 border-red-900 shadow-[0_0_50px_#dc2626]' 
            : 'bg-theme-orange hover:bg-orange-500 hover:scale-105'
        }`}>
        PTT
      </button>
      
    </div>
  );
}