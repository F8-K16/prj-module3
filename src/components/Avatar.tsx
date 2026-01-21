import { getMediaUrl } from "@/utils/helper";

type AvatarProps = {
  src?: string | null;
  name?: string;
  size?: number;
};

export default function Avatar({ src, name, size = 24 }: AvatarProps) {
  if (src) {
    return (
      <img
        src={getMediaUrl(src)}
        alt={name}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className="rounded-full bg-[#e4e6eb] text-[#050505] text-[1em] flex items-center justify-center font-semibold"
      style={{ width: size, height: size }}
    >
      {name?.charAt(0).toUpperCase()}
    </div>
  );
}
