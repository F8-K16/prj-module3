import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { verifyEmailApi } from "@/services/authApi";

type Status = "loading" | "success" | "error";

export default function VerifyEmailTokenPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const ranRef = useRef(false);

  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("Đang xác thực email...");

  useEffect(() => {
    if (!token || ranRef.current) return;
    ranRef.current = true;

    const verify = async () => {
      try {
        await verifyEmailApi(token);

        setStatus("success");
        setMessage(
          "Email đã được xác thực thành công. Đang chuyển tới đăng nhập...",
        );

        setTimeout(() => {
          navigate("/login", {
            replace: true,
            state: {
              message: "Xác thực email thành công. Vui lòng đăng nhập.",
            },
          });
        }, 1500);
      } catch (err) {
        setStatus("error");
        setMessage(
          err instanceof Error
            ? err.message
            : "Link xác thực không hợp lệ hoặc đã hết hạn",
        );

        setTimeout(() => {
          navigate("/verify-email", { replace: true });
        }, 2000);
      }
    };

    verify();
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0c1014]">
      <div className="w-full max-w-md bg-[#25292e] text-[#f5f5f5] rounded-lg px-20 py-10 text-center space-y-4">
        <img
          src="/icons/logo.svg"
          alt="Instagram"
          className="w-36 mx-auto mb-2"
        />

        <p
          className={`text-sm font-medium ${
            status === "error"
              ? "text-red-500"
              : status === "success"
                ? "text-green-600"
                : "text-zinc-300"
          }`}
        >
          {message}
        </p>
      </div>
    </div>
  );
}
