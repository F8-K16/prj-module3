import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  resetPasswordSchema,
  type ResetPasswordSchemaType,
} from "@/schema/schema";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import { resetPassword, clearAuthError } from "@/features/authSlice";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import FloatingInput from "@/components/forms/FloatingInput";

export default function ResetPasswordPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();

  const { resetLoading, resetSuccess, error } = useSelector(
    (state: RootState) => state.auth,
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordSchemaType>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = (data: ResetPasswordSchemaType) => {
    if (!token) return;

    dispatch(
      resetPassword({
        token,
        password: data.password,
        confirmPassword: data.confirmPassword,
      }),
    );
  };

  useEffect(() => {
    if (resetSuccess) {
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    }
  }, [resetSuccess, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0c1014]">
      <div className="w-full max-w-md bg-black text-[#f5f5f5] rounded-lg px-20 py-10 space-y-4">
        <h1 className="text-xl font-bold text-center">Đặt mật khẩu mới</h1>

        {resetSuccess ? (
          <p className="text-green-500 text-sm text-center">
            Đặt lại mật khẩu thành công 🎉 Đang chuyển về trang đăng nhập...
          </p>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <FloatingInput
              label="Mật khẩu mới"
              type="password"
              registration={register("password", {
                onChange: () => dispatch(clearAuthError()),
              })}
              error={errors.password?.message}
            />

            <FloatingInput
              label="Xác nhận mật khẩu"
              type="password"
              registration={register("confirmPassword")}
              error={errors.confirmPassword?.message}
            />

            {error && <p className="text-red-500 text-xs">{error}</p>}

            <button
              type="submit"
              disabled={resetLoading}
              className="w-full bg-[#3846b5] text-white py-2 rounded-lg
              font-semibold disabled:opacity-60"
            >
              {resetLoading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
