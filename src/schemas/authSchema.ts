import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Vui lòng nhập email").email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải tối thiểu là 6 ký tự"),
});
export type LoginSchemaType = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  username: z.string().min(2, "Tên phải tối thiểu là 2 ký tự"),
  email: z.string().min(1, "Vui lòng nhập email").email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải tối thiểu là 6 ký tự"),
});

export type RegisterSchemaType = z.infer<typeof registerSchema>;
