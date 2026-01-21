/* eslint-disable react-hooks/incompatible-library */
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { AppDispatch, RootState } from "@/store/store";
import { useDispatch, useSelector } from "react-redux";
import { loginSchema, type LoginSchemaType } from "@/schema/schema";
import { clearAuthError, login } from "@/features/authSlice";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import FloatingInput from "./FloatingInput";
import { Facebook } from "lucide-react";

type LocationState = {
  from?: string;
};

export default function LoginForm() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation() as { state: LocationState | null };
  const { error, isAuthenticated, loginLoading } = useSelector(
    (state: RootState) => state.auth,
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors,
    watch,
  } = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    const subscription = watch(() => {
      clearErrors();
    });

    return () => subscription.unsubscribe();
  }, [watch, clearErrors]);

  const from = location.state?.from ?? "/";
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, from, navigate]);

  const onSubmit = (data: LoginSchemaType) => {
    dispatch(login(data));
  };

  const handleInputChange = () => {
    dispatch(clearAuthError());
  };

  return (
    <div className="w-full max-w-sm space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 ">
        <FloatingInput
          label="Email"
          registration={register("email", {
            onChange: handleInputChange,
          })}
          error={errors.email?.message}
        />

        <FloatingInput
          label="Mật khẩu"
          type="password"
          registration={register("password", {
            onChange: handleInputChange,
          })}
          error={errors.password?.message}
        />

        {error && <p className="text-red-500 text-xs">{error}</p>}

        <button
          type="submit"
          disabled={loginLoading}
          className="mt-2 w-full bg-[#3846b5] hover:bg-[#3846b5]/90 text-white py-2 rounded-lg font-semibold transition disabled:opacity-60 cursor-pointer"
        >
          {loginLoading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>
      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-[#262626]" />
        <span className="text-xs text-gray-400 font-semibold">HOẶC</span>
        <div className="h-px flex-1 bg-[#262626]" />
      </div>

      <button
        type="button"
        className="flex items-center justify-center gap-2 w-full
          text-[#1877f2] text-sm font-semibold cursor-pointer"
      >
        <span className="relative bg-[#0095f6] rounded-full w-5 h-5">
          <Facebook
            size={20}
            fill="#0c1014"
            strokeWidth={0}
            className="absolute left-1/2 -bottom-0.5 -translate-x-1/2"
          />
        </span>
        Đăng nhập bằng Facebook
      </button>

      {/* FORGOT PASSWORD */}
      <div className="text-center">
        <Link
          to="/forgot-password"
          className="text-sm text-[#fafafa] font-semibold hover:underline"
        >
          Quên mật khẩu?
        </Link>
      </div>
    </div>
  );
}
