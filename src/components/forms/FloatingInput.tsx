import type { UseFormRegisterReturn } from "react-hook-form";

type FloatingInputProps = {
  label: string;
  type?: string;
  error?: string;
  registration: UseFormRegisterReturn;
};

export default function FloatingInput({
  label,
  type = "text",
  error,
  registration,
}: FloatingInputProps) {
  return (
    <div className="relative">
      <input
        type={type}
        placeholder=" "
        {...registration}
        className={`
          peer w-full bg-[#25292e] border
          ${error ? "border-red-500" : "border-[#262626]"}
          rounded px-3 pt-4 pb-2 text-sm text-white
          focus:outline-none
        `}
      />

      <label
        className={`
          pointer-events-none
          absolute left-3 top-3 text-sm text-gray-400
          transition-all duration-150
          peer-focus:top-0 peer-focus:text-xs
          peer-not-placeholder-shown:top-0
          peer-not-placeholder-shown:text-xs
        `}
      >
        {label}
      </label>

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
