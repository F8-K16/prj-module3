import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Vui lòng nhập email").email("Email không hợp lệ"),
  password: z.string().min(8, "Mật khẩu phải tối thiểu là 8 ký tự"),
});
export type LoginSchemaType = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    email: z.string().email("Email không hợp lệ"),
    username: z.string().min(1, "Vui lòng nhập username"),
    fullName: z.string().min(1, "Vui lòng nhập họ và tên"),
    password: z
      .string()
      .min(8, "Mật khẩu tối thiểu 8 ký tự")
      .regex(/[A-Z]/, "Mật khẩu phải có ít nhất 1 chữ in hoa")
      .regex(/[a-z]/, "Mật khẩu phải có ít nhất 1 chữ in thường"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

export type RegisterSchemaType = z.infer<typeof registerSchema>;

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
];

export const updateProfileSchema = z.object({
  fullName: z
    .string()
    .min(2, "Họ tên tối thiểu 2 ký tự")
    .optional()
    .or(z.literal("")),

  bio: z.string().optional().or(z.literal("")),

  website: z.string().optional().or(z.literal("")),

  gender: z.enum(["male", "female", "other"]).optional(),

  profilePicture: z
    .any()
    .optional()
    .refine((file) => {
      if (!file || file.length === 0) return true;
      return ACCEPTED_IMAGE_TYPES.includes(file[0].type);
    }, "Chỉ chấp nhận ảnh jpg, jpeg, png, gif")
    .refine((file) => {
      if (!file || file.length === 0) return true;
      return file[0].size <= MAX_FILE_SIZE;
    }, "Dung lượng ảnh tối đa 5MB"),
});

export type UpdateProfileSchemaType = z.infer<typeof updateProfileSchema>;
