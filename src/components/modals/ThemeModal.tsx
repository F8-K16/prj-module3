import { Moon, ChevronLeft, Sun } from "lucide-react";
import { useTheme } from "../../theme/ThemeProvider";

type ThemeModalProps = {
  onBack: () => void;
};

export default function ThemeModal({ onBack }: ThemeModalProps) {
  const { theme, setTheme } = useTheme();
  const isDarkTheme = theme === "dark";

  const toggleTheme = () => {
    setTheme(isDarkTheme ? "light" : "dark");
  };

  return (
    <div className="absolute bottom-20 left-4 z-50">
      <div className="w-72 rounded-xl bg-[#f8f9f9] dark:bg-[#25292e] shadow-lg">
        <div className="flex items-center gap-3 border-b border-[#3a3a3a] p-4">
          <button onClick={onBack} className="cursor-pointer hover:opacity-70">
            <ChevronLeft />
          </button>
          <span className="font-semibold">Chuyển chế độ</span>
          <div className="ml-auto">{isDarkTheme ? <Moon /> : <Sun />}</div>
        </div>

        <div className="flex items-center justify-between p-4">
          <span>Chế độ tối</span>

          <button
            onClick={toggleTheme}
            className={`relative h-6 w-11 rounded-full transition ${
              isDarkTheme ? "bg-blue-500" : "bg-gray-500"
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
                isDarkTheme ? "left-5" : "left-0.5"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
