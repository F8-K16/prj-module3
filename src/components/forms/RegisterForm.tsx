/* eslint-disable react-hooks/incompatible-library */
import {
  clearAuthError,
  register as registerAction,
} from "@/features/authSlice";
import { registerSchema, type RegisterSchemaType } from "@/schema/schema";
import type { AppDispatch, RootState } from "@/store/store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import FloatingInput from "./FloatingInput";

export default function RegisterForm() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { error, registerLoading } = useSelector(
    (state: RootState) => state.auth,
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors,
    watch,
  } = useForm<RegisterSchemaType>({
    resolver: zodResolver(registerSchema),
  });

  useEffect(() => {
    const subscription = watch(() => {
      clearErrors();
      dispatch(clearAuthError());
    });

    return () => subscription.unsubscribe();
  }, [watch, clearErrors, dispatch]);

  const onSubmit = (data: RegisterSchemaType) => {
    dispatch(registerAction(data)).then((res) => {
      if (registerAction.fulfilled.match(res)) {
        navigate("/verify-email", {
          state: { email: data.email },
        });
      }
    });
  };

  return (
    <div className="w-full max-w-sm space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <FloatingInput
          label="Email"
          registration={register("email")}
          error={errors.email?.message}
        />

        <FloatingInput
          label="Username"
          registration={register("username")}
          error={errors.username?.message}
        />

        <FloatingInput
          label="Họ và tên"
          registration={register("fullName")}
          error={errors.fullName?.message}
        />

        <FloatingInput
          label="Mật khẩu"
          type="password"
          registration={register("password")}
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
          disabled={registerLoading}
          className="mt-2 w-full bg-[#3846b5] hover:bg-[#3846b5]/90
            text-white py-2 rounded-lg font-semibold transition
            disabled:opacity-60 cursor-pointer"
        >
          {registerLoading ? "Đang đăng ký..." : "Đăng ký"}
        </button>
      </form>
    </div>
  );
}
