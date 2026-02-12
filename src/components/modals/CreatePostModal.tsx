/* eslint-disable react-hooks/set-state-in-effect */
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createPost } from "@/features/postSlice";
import type { AppDispatch, RootState } from "@/store/store";
import type { ModalProps } from "@/types/modal";
import { Image, SquarePlay } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Spinner } from "../ui/spinner";

export default function CreatePostModal({ open, onClose }: ModalProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const dispatch = useDispatch<AppDispatch>();
  const { createLoading } = useSelector((state: RootState) => state.posts);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > 50 * 1024 * 1024) {
      alert("File upload tối đa 50MB");
      return;
    }

    setFile(selectedFile);
  };

  const resetCreatePost = () => {
    setFile(null);
    setCaption("");
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    if (open) {
      resetCreatePost();
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!file) return;

    await dispatch(
      createPost({
        file,
        caption,
      }),
    ).unwrap();

    onClose();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v && !createLoading) {
          resetCreatePost();
          onClose();
        }
      }}
    >
      <DialogContent className="w-[80%] h-[80%] p-0 dark:bg-[#212328]  border-none flex flex-col gap-0">
        <DialogHeader className="h-14 flex gap-0 items-center justify-center border-b border-[#363636]">
          <DialogTitle className="font-semibold">Tạo bài viết mới</DialogTitle>
          <DialogDescription />
        </DialogHeader>

        {!file ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="flex gap-2">
              <Image size={48} />
              <SquarePlay size={48} />
            </div>

            <p className="text-lg">Tải ảnh và video vào đây</p>

            <button
              onClick={handleChooseFile}
              className="mt-2 px-4 py-2 bg-[#4a5df9] rounded-lg text-sm font-semibold hover:bg-[#4a5df9]/80 cursor-pointer"
            >
              Chọn từ máy tính
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              hidden
              onChange={handleFileChange}
            />
          </div>
        ) : (
          <div className="flex flex-col h-full">
            {/* Preview */}
            <div className="flex-1 flex items-center justify-center bg-black/40">
              <div className="relative w-full h-full flex items-center justify-center">
                {previewUrl &&
                  (file!.type.startsWith("image") ? (
                    <img
                      src={previewUrl}
                      alt="preview"
                      className="max-h-[90%] max-w-full object-contain"
                    />
                  ) : (
                    <video
                      src={previewUrl}
                      autoPlay
                      className="max-h-full max-w-full"
                    />
                  ))}
              </div>
            </div>

            {/* Caption + Actions */}
            <div className="flex items-center border-t border-[#363636] shrink-0">
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Viết chú thích..."
                className="px-3 py-4 bg-transparent outline-none resize-none w-full text-sm max-h-32"
              />

              <button
                onClick={resetCreatePost}
                className="px-4 py-3 text-sm font-semibold text-gray-400 hover:text-red-500 cursor-pointer"
              >
                Hủy
              </button>

              <button
                onClick={handleSubmit}
                disabled={!file || createLoading}
                className="px-4 py-3 font-semibold text-[#85a1ff]
             disabled:opacity-40 hover:text-[#85a1ff]/80
             cursor-pointer flex items-center gap-2"
              >
                {createLoading ? <Spinner /> : "Đăng"}
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
