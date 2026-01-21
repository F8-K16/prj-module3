import LoginForm from "@/components/forms/LoginForm";
import RegisterForm from "@/components/forms/RegisterForm";
import { useState } from "react";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");

  return (
    <div className="min-h-screen bg-linear-to-br from-[#0b0f14] to-black text-white flex flex-col">
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-12 px-6">
          <div className="hidden md:flex items-center justify-center">
            <img
              src="/images/login.png"
              alt=""
              className="max-w-130 drop-shadow-2xl"
            />
          </div>

          <div className="flex items-center justify-center">
            <div className="w-full max-w-sm space-y-6">
              <div className="bg-transparent px-10 pb-6 space-y-6">
                <img
                  src="/icons/logo.svg"
                  alt="Instagram"
                  className="w-45 mx-auto mb-10"
                />

                {mode === "login" ? <LoginForm /> : <RegisterForm />}
              </div>

              <div className="text-center text-sm">
                {mode === "login" ? (
                  <>
                    Bạn chưa có tài khoản?{" "}
                    <button
                      className="text-blue-500 font-semibold cursor-pointer"
                      onClick={() => setMode("register")}
                    >
                      Đăng ký
                    </button>
                  </>
                ) : (
                  <>
                    Bạn đã có tài khoản?{" "}
                    <button
                      className="text-blue-500 font-semibold cursor-pointer"
                      onClick={() => setMode("login")}
                    >
                      Đăng nhập
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="text-xs text-gray-400 text-center py-10 space-y-2">
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
          <span>Meta</span>
          <span>Giới thiệu</span>
          <span>Instagram Lite</span>
          <span>Vị trí</span>
          <span>Blog</span>
          <span>Việc làm</span>
          <span>Trợ giúp</span>
          <span>API</span>
          <span>Quyền riêng tư</span>
          <span>Điều khoản</span>
        </div>
        <p>© 2026 Instagram from F8</p>
      </footer>
    </div>
  );
}
