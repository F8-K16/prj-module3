import type { AppDispatch } from "@/store/store";
import type { Post } from "@/types/post";
import { useDispatch } from "react-redux";
import { openPostModal } from "@/features/postModalSlice";

const mockPosts: Post[] = Array.from({ length: 12 }).map((_, i) => ({
  id: i,
  image: "https://picsum.photos/500/500?random=" + i,
  caption: `Lorem ipsum dolor sit amet, consectetur adipisicing elit. Vitae quo eligendi maxime sit officiis perspiciatis ea incidunt recusandae, eius reiciendis quasi quisquam velit labore consequatur tenetur eos eveniet voluptate temporibus?`,
  likes: Math.floor(Math.random() * 1000),
  comments: [
    {
      id: 1,
      user: {
        name: "thao.le",
        avatar: "",
      },
      text: "Nhìn thích ghê 😍",
    },
    {
      id: 2,
      user: {
        name: "quang.dev",
        avatar: "",
      },
      text: "Quán này ở đâu vậy?",
    },
  ],
  createdAt: "2 ngày trước",
  user: {
    name: "Hào Võ",
    avatar: "https://i.pravatar.cc/100",
  },
}));

export default function SelfPost() {
  const dispatch = useDispatch<AppDispatch>();

  return (
    <div className="grid grid-cols-5 gap-1 mt-8">
      {mockPosts.map((post) => (
        <div
          key={post.id}
          className="overflow-hidden cursor-pointer "
          onClick={() => dispatch(openPostModal(post))}
        >
          <img
            src={Array.isArray(post.image) ? post.image[0] : post.image}
            alt="post"
            className="w-full h-75 object-cover hover:opacity-40"
          />
        </div>
      ))}
    </div>
  );
}
