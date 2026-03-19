import { useState } from 'react';
import { usePosts } from '@/blog/hooks/usePosts';
import { useCategories } from '@/blog/hooks/useCategories';
import { getBlogRepository } from '@/blog/lib/data';
import { formatDate } from '@/blog/lib/utils/formatDate';
import { truncate } from '@/blog/lib/utils/truncate';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Eye, Edit, Trash2, Loader2, ExternalLink } from 'lucide-react';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import InfiniteScrollIndicator from '@/components/loading/InfiniteScrollIndicator';

export default function PostsManager() {
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState<any>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deletePostId, setDeletePostId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { categories } = useCategories();
  const { posts, loading, hasMore, loadMore, refetch } = usePosts(
    {
      ...(selectedStatus !== 'all' && { status: selectedStatus }),
      ...(searchQuery && { search: searchQuery }),
    },
    20 // Page size
  );

  const { ref: scrollRef } = useInfiniteScroll({
    loading,
    hasNextPage: hasMore,
    onLoadMore: loadMore,
  });

  const handleDelete = async () => {
    if (!deletePostId) return;

    try {
      setDeleting(true);
      const repository = getBlogRepository();
      await repository.deletePost(deletePostId);
      
      toast.success('Post deletado com sucesso!');
      setDeletePostId(null);
      refetch();
    } catch (err) {
      toast.error('Erro ao deletar post');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Posts</h1>
          <p className="text-muted-foreground mt-1">{posts.length} post(s) encontrado(s)</p>
        </div>
        <Button onClick={() => navigate('/admin/blog/novo')} size="lg">
          <Plus className="h-4 w-4 mr-2" />
          Novo Post
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[300px] relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="draft">Rascunhos</SelectItem>
                <SelectItem value="published">Publicados</SelectItem>
                <SelectItem value="scheduled">Agendados</SelectItem>
                <SelectItem value="archived">Arquivados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead className="text-center">Views</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post) => (
              <TableRow key={post.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{truncate(post.title, 60)}</div>
                    <div className="text-sm text-muted-foreground">/{post.slug}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={
                      post.status === 'published' ? 'default' : 
                      post.status === 'scheduled' ? 'outline' :
                      'secondary'
                    }
                  >
                    {post.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">{post.category?.name || '-'}</TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Eye className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm">{post.viewCount}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(post.publishedAt || post.createdAt)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                      title="Ver post"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate(`/admin/blog/editar/${post.id}`)}
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletePostId(post.id)}
                      title="Deletar"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {posts.length === 0 && !loading && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg">Nenhum post encontrado</p>
          </div>
        )}
      </Card>

      {/* Infinite Scroll */}
      <div ref={scrollRef}>
        <InfiniteScrollIndicator
          isFetchingNextPage={loading && posts.length > 0}
          hasNextPage={hasMore}
          itemsCount={posts.length}
          isInitialLoading={loading && posts.length === 0}
        />
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={!!deletePostId} onOpenChange={() => setDeletePostId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar este post? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
