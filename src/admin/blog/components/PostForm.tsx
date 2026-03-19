import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Post } from '@/blog/types';
import { postFormSchema, PostFormData } from '../lib/validation';
import { useCategories } from '@/blog/hooks/useCategories';
import { getBlogRepository } from '@/blog/lib/data';
import { slugify } from '@/blog/lib/utils/slugify';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Save, Loader2, Image as ImageIcon } from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';
import ImageUploader from '@/blog/components/ui/ImageUploader';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';

interface PostFormProps {
  post?: Post;
}

export default function PostForm({ post }: PostFormProps) {
  const navigate = useNavigate();
  const { categories } = useCategories();
  const isEditing = !!post;
  const [showImageUploader, setShowImageUploader] = useState(false);

  const form = useForm<PostFormData>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      title: post?.title || '',
      slug: post?.slug || '',
      excerpt: post?.excerpt || '',
      content: post?.content || '',
      categoryId: post?.categoryId || '',
      status: post?.status || 'draft',
      seoTitle: post?.seoTitle || '',
      seoDescription: post?.seoDescription || '',
      featuredImage: post?.featuredImage || '',
    },
  });

  const { watch, setValue } = form;
  const title = watch('title');

  useEffect(() => {
    if (!isEditing && title) {
      setValue('slug', slugify(title));
    }
  }, [title, isEditing, setValue]);

  const handleImageInsert = (markdown: string) => {
    const currentContent = form.getValues('content');
    form.setValue('content', currentContent + '\n\n' + markdown);
  };

  const onSubmit = async (data: PostFormData) => {
    try {
      const repository = getBlogRepository();

      if (isEditing) {
        await repository.updatePost({ id: post.id, ...data });
        toast.success('Post atualizado!');
      } else {
        await repository.createPost({ ...data, authorId: 'e878e3c8-1e29-4fc3-a9a5-c8b865703cc0' });
        toast.success('Post criado!');
      }

      navigate('/admin/blog');
    } catch (error) {
      toast.error('Erro ao salvar post');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{isEditing ? 'Editar Post' : 'Novo Post'}</h1>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => navigate('/admin/blog')}>
              Cancelar
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="h-4 w-4 mr-2" />
              {isEditing ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="content">
          <TabsList>
            <TabsTrigger value="content">Conteúdo</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
            <TabsTrigger value="settings">Config</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Básico</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título *</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="slug" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug *</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="excerpt" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resumo *</FormLabel>
                    <FormControl><Textarea rows={3} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="content" render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between mb-2">
                      <FormLabel>Conteúdo *</FormLabel>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowImageUploader(true)}
                      >
                        <ImageIcon className="h-4 w-4 mr-2" />
                        Inserir Imagem
                      </Button>
                    </div>
                    <FormControl>
                      <div data-color-mode="light">
                        <MDEditor
                          value={field.value}
                          onChange={(val) => field.onChange(val || '')}
                          preview="live"
                          height={500}
                          style={{
                            borderRadius: 'var(--radius)',
                            border: '1px solid hsl(var(--border))',
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Use Markdown para formatar: **negrito**, *itálico*, [link](url), etc.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seo" className="space-y-4">
            <Card>
              <CardHeader><CardTitle>SEO</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <FormField control={form.control} name="seoTitle" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título SEO</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormDescription>Máx 60 caracteres</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="seoDescription" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição SEO</FormLabel>
                    <FormControl><Textarea rows={3} {...field} /></FormControl>
                    <FormDescription>Máx 160 caracteres</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="featuredImage" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Imagem URL</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Publicação</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <FormField control={form.control} name="status" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Rascunho</SelectItem>
                        <SelectItem value="published">Publicado</SelectItem>
                        <SelectItem value="archived">Arquivado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="categoryId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={showImageUploader} onOpenChange={setShowImageUploader}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Inserir Imagem</DialogTitle>
            </DialogHeader>
            <ImageUploader
              onImageInsert={handleImageInsert}
              onClose={() => setShowImageUploader(false)}
              postSlug={form.getValues('slug') || 'draft'}
            />
          </DialogContent>
        </Dialog>
      </form>
    </Form>
  );
}
