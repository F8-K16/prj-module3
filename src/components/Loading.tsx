export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-transparent">
      <img
        src="/icons/logo.svg"
        alt="Instagram"
        className="w-20 h-20 animate-pulse"
      />
    </div>
  );
}
