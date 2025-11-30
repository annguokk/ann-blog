"use client";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import Form from "next/form";
import { supabase } from "@/lib/supabase";

export default function NewPostPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  type Payload = {
    title: string;
    author: string;
    description: string | null;
    tags: string[];
    category: string | null;
    img: string | null;
    github: string | null;
    reading_time_minutes: number | null;
  };

  const mutation = useMutation({
    mutationFn: async (payload: Payload) => {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? "提交失败了");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="mb-6 text-2xl font-semibold">新增文章</h1>
      <Form
        action="/search"
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget as HTMLFormElement;
          const fd = new FormData(form);
          const title = String(fd.get("title") || "").trim();
          const author = String(fd.get("author") || "").trim();
          const description = String(fd.get("description") || "").trim();
          const tagsStr = String(fd.get("tags") || "");
          const category = String(fd.get("category") || "").trim();
          const img = String(fd.get("img") || "").trim();
          const github = String(fd.get("github") || "").trim();
          const rtm = fd.get("reading_time_minutes");
          const payload = {
            title,
            author,
            description: description || null,
            tags: tagsStr
              ? tagsStr
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean)
              : [],
            category: category || null,
            img: img || null,
            github: github || null,
            reading_time_minutes: rtm ? Number(rtm) : null,
          };
          mutation.mutate(payload, { onSuccess: () => router.push("/posts") });
        }}
        className="grid grid-cols-2 gap-4"
      >
        <input
          name="title"
          className="rounded border px-3 py-2"
          placeholder="文章标题"
          required
        />
        <input
          name="author"
          className="rounded border px-3 py-2"
          placeholder="作者"
          required
        />

        <textarea
          name="description"
          className="col-span-2 w-full min-h-32 rounded border px-3 py-2"
          placeholder="文章描述（支持粘贴代码）"
        />

        <input
          name="tags"
          className="rounded border px-3 py-2"
          placeholder="标签，使用逗号分隔"
        />
        <input
          name="category"
          className="rounded border px-3 py-2"
          placeholder="分类"
        />
        <input
          name="img"
          className="rounded border px-3 py-2"
          placeholder="封面图片 URL"
        />
        <input
          name="github"
          className="rounded border px-3 py-2"
          placeholder="GitHub 地址"
        />
        <input
          name="reading_time_minutes"
          type="number"
          className="rounded border px-3 py-2"
          placeholder="建议阅读时长（分钟）"
        />
        <div className="col-span-2">
          {mutation.error ? (
            <div className="text-sm text-red-600">
              {(mutation.error as Error).message}
            </div>
          ) : null}
        </div>
        <div className="col-span-2">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="rounded bg-black px-4 py-2 text-white disabled:opacity-50 dark:bg-white dark:text-black"
          >
            {mutation.isPending ? "提交中..." : "提交"}
          </button>
        </div>
      </Form>
    </div>
  );
}
