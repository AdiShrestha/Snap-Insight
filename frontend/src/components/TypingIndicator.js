export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 text-sm text-[var(--color-subtext)] animate-pulse">
      <span className="inline-block w-2 h-2 rounded-full bg-[var(--color-subtext)] animate-bounce"></span>
      <span className="inline-block w-2 h-2 rounded-full bg-[var(--color-subtext)] animate-bounce delay-100"></span>
      <span className="inline-block w-2 h-2 rounded-full bg-[var(--color-subtext)] animate-bounce delay-200"></span>
      <span>AI is typing...</span>
    </div>
  );
}
