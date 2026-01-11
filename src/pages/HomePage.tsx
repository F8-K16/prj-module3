import { Card, CardContent } from "@/components/ui/card";
import type { Post } from "@/types/post";
import { Heart, MessageCircle } from "lucide-react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { openPostModal } from "@/features/postModalSlice";
const fakePosts = [
  {
    id: 1,
    image: [
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
      "https://images.unsplash.com/photo-1601813913455-118810e79277?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    ],
    caption:
      "Cuối tuần chill nhẹ với ly cà phê ban mai sương sớm quá là chill các ông ạ☕",
    likes: 124,
    isLiked: false,
    comments: [
      {
        id: 1,
        user: {
          name: "thao.le",
          avatar:
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        },
        text: "Nhìn thích ghê 😍",
      },
      {
        id: 2,
        user: {
          name: "quang.dev",
          avatar:
            "https://images.unsplash.com/photo-1654110455429-cf322b40a906?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        },
        text: "Quán này ở đâu vậy?",
      },
    ],
    createdAt: "2 giờ trước",
    user: {
      name: "minh.nguyen",
      avatar: "https://i.pravatar.cc/150?img=12",
    },
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e",
    caption: "Một ngày đầy nắng 🌤️",
    likes: 542,
    isLiked: true,
    comments: [
      {
        id: 1,
        user: {
          name: "minh.nguyen",
          avatar: "https://i.pravatar.cc/150?img=12",
        },
        text: "Xinh quá ✨",
      },
    ],
    createdAt: "5 giờ trước",
    user: {
      name: "thao.le",
      avatar: "https://i.pravatar.cc/150?img=32",
    },
  },
];

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>(fakePosts);

  const dispatch = useDispatch();

  return (
    <>
      <div className="space-y-3 ml-80">
        {posts.map((post) => (
          <Card key={post.id} className="border-0 bg-transparent p-0">
            <CardContent className="p-4 space-y-4 max-w-125 ">
              <div className="ml-4 flex items-center gap-3 mb-3">
                <img
                  src={post.user.avatar}
                  className="h-10 w-10 rounded-full"
                />
                <div className="flex items-center gap-2">
                  <p className="font-medium">{post.user.name}</p>
                  <p className="mt-auto text-sm text-muted-foreground">
                    • {post.createdAt}
                  </p>
                </div>
              </div>

              <img
                src={Array.isArray(post.image) ? post.image[0] : post.image}
                className="h-146.25 w-full object-cover rounded-lg mb-3"
              />

              <div className="flex items-center gap-4 px-4 mb-3">
                <button className="flex items-center gap-1 cursor-pointer">
                  <Heart
                    className={`h-6 w-6 hover:scale-105 ${
                      post.isLiked ? "fill-red-500 text-red-500" : ""
                    }`}
                  />
                  <span className="text-sm font-semibold">{post.likes}</span>
                </button>

                <button
                  onClick={() => dispatch(openPostModal(post))}
                  className="flex items-center gap-1 cursor-pointer"
                >
                  <MessageCircle className="h-6 w-6 hover:scale-105" />
                  <span className="text-sm font-semibold">
                    {post.comments.length}
                  </span>
                </button>
              </div>

              <p className="text-sm px-4">
                <span className="font-medium mr-1">{post.user.name}</span>
                {post.caption}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
