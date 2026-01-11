import SavedPost from "@/layouts/profile/SavedPost";
import SelfPost from "@/layouts/profile/SelfPost";
import { Bookmark, Grid3X3, UserSquare2 } from "lucide-react";
import { useSearchParams } from "react-router-dom";

type TabType = "posts" | "saved" | "tagged";

function TabButton({
  icon,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-3 border-b-2 cursor-pointer ${
        active ? "border-white text-white" : "border-transparent text-gray-500"
      }`}
    >
      {icon}
    </button>
  );
}

export default function ProfilePage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const tab = (searchParams.get("tab") as TabType) ?? "posts";

  const changeTab = (nextTab: TabType) => {
    setSearchParams({ tab: nextTab });
  };

  return (
    <div className="w-6xl ml-50 px-4">
      <div className="flex gap-10 mb-6 mx-auto w-170">
        <div className="flex justify-center">
          <img
            src="https://i.pravatar.cc/150"
            alt="avatar"
            className="w-38 h-38 rounded-full object-cover"
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Hào Võ 26</h2>

          <div className="flex gap-6 text-sm">
            <span>
              <strong>12</strong> bài viết
            </span>
            <span>
              <strong>1,234</strong> người theo dõi
            </span>
            <span>
              Đang theo dõi <strong>321</strong> người dùng
            </span>
          </div>

          <div className="text-sm">
            <p className="font-medium">Hào Võ</p>
            <p>Frontend Developer 🚀</p>
            <a
              href="https://github.com"
              className="text-blue-500 hover:underline"
            >
              github.com/hao
            </a>
          </div>
        </div>
      </div>
      <div className="mb-12 flex w-170 mx-auto gap-2 text-sm font-semibold ">
        <button className="h-11 bg-[#25292e] rounded-xl w-full cursor-pointer hover:bg-[#25292e]/90">
          Chỉnh sửa trang cá nhân
        </button>
        <button className="h-11 bg-[#25292e] rounded-xl w-full cursor-pointer hover:bg-[#25292e]/90">
          Xem kho lưu trữ
        </button>
      </div>

      <div className="border-b border-[#2b3036] flex justify-center text-sm gap-32">
        <TabButton
          icon={<Grid3X3 size={24} />}
          label="POSTS"
          active={tab === "posts"}
          onClick={() => changeTab("posts")}
        />

        <TabButton
          icon={<Bookmark size={24} />}
          label="SAVED"
          active={tab === "saved"}
          onClick={() => changeTab("saved")}
        />

        <TabButton
          icon={<UserSquare2 size={24} />}
          label="TAGGED"
          active={tab === "tagged"}
          onClick={() => changeTab("tagged")}
        />
      </div>

      {tab === "posts" && <SelfPost />}
      {tab === "saved" && <SavedPost />}
    </div>
  );
}
