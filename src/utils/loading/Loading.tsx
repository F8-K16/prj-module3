export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center dark:bg-[#0c1014]">
      <img
        src="/icons/favicon.png"
        alt="Instagram"
        className="w-20 h-20 animate-pulse"
      />
    </div>
  );
}
