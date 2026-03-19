import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PostForm from '@/admin/blog/components/PostForm';
import { getBlogRepository } from '@/blog/lib/data';
import { Post } from '@/blog/types';
import { Loader2 } from 'lucide-react';

export default function EditarPost() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      const repository = getBlogRepository();
      const result = await repository.getPostById(id!);
      setPost(result);
      setLoading(false);
    };

    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!post) {
    return <div className="p-8">Post não encontrado</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <PostForm post={post} />
    </div>
  );
}
