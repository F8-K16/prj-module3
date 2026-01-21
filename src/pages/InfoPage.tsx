/* eslint-disable react-hooks/incompatible-library */
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";

import { useEffect, useMemo } from "react";
import {
  updateProfileSchema,
  type UpdateProfileSchemaType,
} from "@/schema/schema";
import { resetProfileUpdated, updateProfile } from "@/features/authSlice";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Avatar from "@/components/Avatar";

export default function InfoPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, updateLoading, error, isProfileUpdated } = useSelector(
    (state: RootState) => state.auth,
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    control,
    reset,
    watch,
  } = useForm<UpdateProfileSchemaType>({
    resolver: zodResolver(updateProfileSchema),
  });

  useEffect(() => {
    if (user) {
      reset({
        fullName: user.fullName || "",
        bio: user.bio || "",
        website: user.website || "",
        gender: user.gender as "male" | "female" | "other" | undefined,
      });
    }
  }, [user, reset]);

  useEffect(() => {
    return () => {
      dispatch(resetProfileUpdated());
    };
  }, [dispatch]);

  const onSubmit = (data: UpdateProfileSchemaType) => {
    const formData = new FormData();

    if (data.fullName) formData.append("fullName", data.fullName);
    if (data.bio) formData.append("bio", data.bio);
    if (data.website) formData.append("website", data.website);
    if (data.gender) formData.append("gender", data.gender);

    if (data.profilePicture && data.profilePicture.length > 0) {
      formData.append("profilePicture", data.profilePicture[0]);
    }

    dispatch(updateProfile(formData));
  };

  const avatarPreview = watch("profilePicture");
  const isAvatarChanged = avatarPreview && avatarPreview.length > 0;
  const isFormChanged = isDirty || isAvatarChanged;

  const avatarUrl = useMemo(() => {
    if (avatarPreview?.length) {
      return URL.createObjectURL(avatarPreview[0]);
    }
    return user?.profilePicture;
  }, [avatarPreview, user]);

  return (
    <div className="max-w-175 space-y-10 mx-auto">
      <h1 className="text-xl font-bold">Chỉnh sửa trang cá nhân</h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 bg-zinc-900 px-5 py-6 rounded-2xl"
      >
        {/* Avatar */}
        <div className="flex items-center gap-4 dark:bg-[#262626] p-4 rounded-3xl">
          <Avatar src={avatarUrl} name={user?.username || "U"} size={56} />
          <div className="flex flex-col">
            <span className="font-semibold">{user?.username}</span>
            <span className="text-sm text-[#a8a8a8]">{user?.fullName}</span>
          </div>

          <label
            htmlFor="input-file"
            className="ml-auto text-sm font-semibold bg-[#4a5df9] cursor-pointer px-5 py-2 rounded-lg"
          >
            Đổi ảnh
          </label>

          <input
            id="input-file"
            type="file"
            accept="image/*"
            {...register("profilePicture")}
            hidden
          />
        </div>

        {errors.profilePicture && (
          <p className="text-red-500 text-xs">
            {errors.profilePicture.message?.toString()}
          </p>
        )}

        {/* Full name */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Họ tên</label>
          <Input {...register("fullName")} placeholder="Họ và tên" />
          {errors.fullName && (
            <p className="text-red-500 text-xs">
              {errors.fullName.message?.toString()}
            </p>
          )}
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Tiểu sử</label>
          <Textarea {...register("bio")} placeholder="Tiểu sử" />
          {errors.bio && (
            <p className="text-red-500 text-xs">
              {errors.bio.message?.toString()}
            </p>
          )}
        </div>

        {/* Website */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Trang web</label>
          <Input {...register("website")} placeholder="Website" />
          {errors.website && (
            <p className="text-red-500 text-xs">
              {errors.website.message?.toString()}
            </p>
          )}
        </div>

        {/* Gender */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Giới tính</label>
          <Controller
            control={control}
            name="gender"
            render={({ field }) => (
              <Select
                key={field.value}
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn giới tính" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Nam</SelectItem>
                  <SelectItem value="female">Nữ</SelectItem>
                  <SelectItem value="other">Khác</SelectItem>
                </SelectContent>
              </Select>
            )}
          />

          {errors.gender && (
            <p className="text-red-500 text-xs">
              {errors.gender.message?.toString()}
            </p>
          )}
        </div>

        {error && <p className="text-red-500 text-xs">{error}</p>}
        {isProfileUpdated && (
          <p className="text-green-500 text-sm text-center">
            Cập nhật thông tin thành công
          </p>
        )}

        <button
          type="submit"
          disabled={updateLoading || !isFormChanged}
          className="block w-40 mx-auto mt-7 bg-[#3846b5] hover:bg-[#3846b5]/90 cursor-pointer px-4 py-2 rounded-lg disabled:bg-gray-600 disabled:text-zinc-400 disabled:pointer-events-none"
        >
          {updateLoading ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </form>
    </div>
  );
}
