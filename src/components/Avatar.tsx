import { getMediaUrl } from "@/utils/helper";

type AvatarProps = {
  src?: string | null;
  name?: string;
  size?: number;
  classes?: string;
};

export default function Avatar({ src, name, size = 24, classes }: AvatarProps) {
  let avatarSrc: string | undefined;

  if (src) {
    if (src.startsWith("blob:")) {
      avatarSrc = src;
    } else if (src.startsWith("http")) {
      avatarSrc = src;
    } else {
      avatarSrc = getMediaUrl(src);
    }
  }

  if (avatarSrc) {
    return (
      <img
        src={avatarSrc}
        alt={name}
        className={`rounded-full object-cover ${classes}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className="rounded-full bg-[#e4e6eb] text-[#050505] text-[1em]
      flex items-center justify-center font-semibold"
      style={{ width: size, height: size }}
    >
      {name?.charAt(0).toUpperCase()}
    </div>
  );
}
