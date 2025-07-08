import { useEffect, useState } from 'react';

export default function TypingMessage({ content, speed = 30 }) {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let idx = 0;
    const interval = setInterval(() => {
      setDisplayedText(prev => prev + content.charAt(idx));
      idx++;
      if (idx >= content.length) clearInterval(interval);
    }, speed);

    return () => clearInterval(interval);
  }, [content, speed]);

  return (
    <div className="px-2 mb-6 flex justify-start">
      <div className="bg-[var(--color-border)] text-[var(--color-text)] px-5 py-3 rounded-2xl rounded-bl-none shadow-md max-w-[75%] whitespace-pre-wrap break-words animate-fadeInUp">
        <p className="text-base leading-relaxed">{displayedText}</p>
      </div>
    </div>
  );
}
