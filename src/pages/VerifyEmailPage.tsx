import { useLocation } from "react-router-dom";
import { useState } from "react";
import { resendVerifyEmailApi } from "@/services/authApi";

export default function VerifyEmailPage() {
  const location = useLocation();
  const email = (location.state as { email?: string })?.email;

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleResend = async () => {
    if (!email) return;

    try {
      setLoading(true);
      await resendVerifyEmailApi({ email });
      setMessage("Email xác thực đã được gửi lại. Vui lòng kiểm tra hộp thư.");
    } catch (err) {
      setMessage((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0c1014]">
      <div className="w-full max-w-md bg-[#25292e] text-[#f5f5f5] rounded-lg px-20 py-10 text-center space-y-4">
        <img
          src="/icons/logo.svg"
          alt="Instagram"
          className="w-36 mx-auto mb-4"
        />

        <h1 className="text-lg font-semibold ">Xác thực email</h1>

        <p className="text-sm text-white leading-relaxed">
          Chúng tôi đã gửi link xác thực đến email của bạn. Vui lòng kiểm tra
          hộp thư để kích hoạt tài khoản.
        </p>

        {email && (
          <button
            onClick={handleResend}
            disabled={loading}
            className="mt-4 w-full bg-[#0095f6] hover:bg-[#1877f2]
               py-2 rounded-lg font-semibold transition
              disabled:opacity-60 cursor-pointer"
          >
            {loading ? "Đang gửi..." : "Gửi lại email xác thực"}
          </button>
        )}

        {message && <p className="text-sm text-green-600 mt-2">{message}</p>}
      </div>
    </div>
  );
}
