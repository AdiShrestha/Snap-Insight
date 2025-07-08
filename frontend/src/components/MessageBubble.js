import { format } from 'date-fns';

export default function MessageBubble({ role, content, timestamp, screenshot, isAudio, isError }) {
  const isUser = role === 'user';
  const avatar = isUser ? '🧑' : '🤖';
  const name = isUser ? 'You' : 'SnapAI';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} px-2 mb-6`}>
      {!isUser && (
        <div className="w-8 h-8 bg-[var(--color-border)] text-lg rounded-full flex items-center justify-center mr-2">
          {avatar}
        </div>
      )}
      <div
          className={`relative px-5 py-3 rounded-2xl shadow-sm max-w-[80%] whitespace-pre-wrap break-words transition-all
         ${isUser 
            ? 'bg-[var(--color-primary)] text-white rounded-br-sm self-end' 
            : isError
              ? 'bg-red-100 border border-red-300 text-red-800 rounded-bl-sm self-start'
              : 'bg-[var(--color-border)] text-[var(--color-text)] rounded-bl-sm self-start'}`}
        >       
         <p className={`text-[15px] leading-[1.6] font-medium ${isAudio ? 'flex items-center gap-2' : ''}`}>
           {isAudio && <span className="text-blue-500">🎤</span>}
           {content}
         </p>
         
         {/* Screenshot display */}
         {screenshot && (
           <div className="mt-3 border border-gray-200 rounded-lg overflow-hidden">
             <img 
               src={screenshot} 
               alt="Screenshot context" 
               className="w-full h-auto max-h-48 object-contain"
             />
           </div>
         )}
         
         <span className="text-xs absolute bottom-[-1.5rem] right-2 text-[var(--color-subtext)] opacity-60">
            {format(new Date(timestamp), 'p')}
            </span>
        </div>


      {isUser && (
        <div className="w-8 h-8 bg-[var(--color-primary-hover)] text-lg rounded-full flex items-center justify-center ml-2">
          {avatar}
        </div>
      )}
    </div>
  );
}
