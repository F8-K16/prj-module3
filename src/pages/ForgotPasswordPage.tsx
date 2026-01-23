import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  forgotPasswordSchema,
  type ForgotPasswordSchemaType,
} from "@/schema/schema";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import { forgotPassword, clearAuthError } from "@/features/authSlice";
import { Link } from "react-router-dom";
import FloatingInput from "@/components/forms/FloatingInput";

export default function ForgotPasswordPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { forgotLoading, forgotSuccess, error } = useSelector(
    (state: RootState) => state.auth,
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordSchemaType>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = (data: ForgotPasswordSchemaType) => {
    dispatch(forgotPassword(data.email));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0c1014]">
      <div className="w-full max-w-md bg-black text-[#f5f5f5] rounded-lg px-20 py-10 space-y-4">
        <h1 className="text-xl font-bold text-center">Quên mật khẩu</h1>

        {forgotSuccess ? (
          <p className="text-green-500 text-sm text-center">
            Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư 📧
          </p>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <FloatingInput
              label="Email"
              registration={register("email", {
                onChange: () => dispatch(clearAuthError()),
              })}
              error={errors.email?.message}
            />

            {error && <p className="text-red-500 text-xs">{error}</p>}

            <button
              type="submit"
              disabled={forgotLoading}
              className="w-full bg-[#3846b5] text-white py-2 rounded-lg
              font-semibold disabled:opacity-60"
            >
              {forgotLoading ? "Đang gửi..." : "Gửi email reset"}
            </button>
          </form>
        )}

        <div className="text-center">
          <Link to="/login" className="text-sm text-blue-400 hover:underline">
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
