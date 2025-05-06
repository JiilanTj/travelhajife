'use client';

import { useState, useEffect, useCallback } from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FaSpinner, FaUpload, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { getAllBlogCategories, getBlogPostById, updateBlogPost, uploadContentImage } from '@/services/blog';
import { BlogCategory, CreateBlogPostData } from '@/types/blog';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TipTapImage from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import ListItem from '@tiptap/extension-list-item';
import Typography from '@tiptap/extension-typography';

interface ImageUploadButtonProps {
  editor: Editor;
}

const ImageUploadButton = ({ editor }: ImageUploadButtonProps) => {
  const handleImageUpload = useCallback(async () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (file) {
        try {
          const response = await uploadContentImage(file);
          editor.chain().focus().setImage({ src: response.data.url }).run();
        } catch (error) {
          console.error('Error uploading image:', error);
          toast.error('Gagal mengunggah gambar');
        }
      }
    };
  }, [editor]);

  return (
    <button
      onClick={handleImageUpload}
      className="px-2 py-1 rounded text-gray-700 hover:bg-gray-100"
      type="button"
    >
      Image
    </button>
  );
};

interface MenuBarProps {
  editor: Editor | null;
}

const MenuBar = ({ editor }: MenuBarProps) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="border-b border-gray-200 p-4 flex flex-wrap gap-2">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`px-2 py-1 rounded text-gray-700 ${editor.isActive('bold') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
        type="button"
      >
        Bold
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`px-2 py-1 rounded text-gray-700 ${editor.isActive('italic') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
        type="button"
      >
        Italic
      </button>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`px-2 py-1 rounded text-gray-700 ${editor.isActive('underline') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
        type="button"
      >
        Underline
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`px-2 py-1 rounded text-gray-700 ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
        type="button"
      >
        H1
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`px-2 py-1 rounded text-gray-700 ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
        type="button"
      >
        H2
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`px-2 py-1 rounded text-gray-700 ${editor.isActive('bulletList') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
        type="button"
      >
        Bullet List
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`px-2 py-1 rounded text-gray-700 ${editor.isActive('orderedList') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
        type="button"
      >
        Ordered List
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={`px-2 py-1 rounded text-gray-700 ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
        type="button"
      >
        Left
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={`px-2 py-1 rounded text-gray-700 ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
        type="button"
      >
        Center
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={`px-2 py-1 rounded text-gray-700 ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
        type="button"
      >
        Right
      </button>
      <ImageUploadButton editor={editor} />
    </div>
  );
};

interface PageParams {
  id: string;
}

export default function EditBlogPostPage({ params }: { params: Promise<PageParams> }) {
  const router = useRouter();
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [formData, setFormData] = useState<CreateBlogPostData>({
    title: '',
    content: '',
    categoryId: '',
    excerpt: '',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    status: 'draft'
  });
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [featuredImagePreview, setFeaturedImagePreview] = useState<string>('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: {
            class: 'list-disc ml-4 [&_li]:mt-2'
          }
        },
        orderedList: {
          HTMLAttributes: {
            class: 'list-decimal ml-4 [&_li]:mt-2'
          }
        },
        heading: {
          HTMLAttributes: {
            class: 'text-gray-900 font-bold',
            levels: [1, 2]
          }
        },
        paragraph: {
          HTMLAttributes: {
            class: 'text-gray-700 mb-2'
          }
        }
      }),
      TipTapImage.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto my-4'
        }
      }),
      Link.configure({
        HTMLAttributes: {
          class: 'text-emerald-600 hover:text-emerald-700 underline'
        }
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph']
      }),
      Underline,
      TextStyle,
      Color,
      Typography,
      ListItem.configure({
        HTMLAttributes: {
          class: 'text-gray-700'
        }
      })
    ],
    content: formData.content,
    onUpdate: ({ editor }) => {
      setFormData(prev => ({ ...prev, content: editor.getHTML() }));
    }
  });

  // Fetch post data and categories on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postData, categoriesData] = await Promise.all([
          getBlogPostById(id),
          getAllBlogCategories()
        ]);

        setCategories(categoriesData.data);

        // Pre-fill form data
        setFormData({
          title: postData.data.title,
          content: postData.data.content,
          categoryId: postData.data.categoryId,
          excerpt: postData.data.excerpt || '',
          metaTitle: postData.data.metaTitle,
          metaDescription: postData.data.metaDescription,
          metaKeywords: postData.data.metaKeywords,
          status: postData.data.status
        });

        // Set featured image preview if exists
        if (postData.data.featuredImage) {
          setFeaturedImagePreview(postData.data.featuredImage.url);
        }

        // Update editor content
        editor?.commands.setContent(postData.data.content);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Gagal memuat data artikel');
        router.push('/dashboard/admin/content');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, editor]);

  // Handle featured image change
  const handleFeaturedImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error('Format file tidak didukung. Gunakan JPG, PNG, atau WEBP');
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Ukuran file terlalu besar. Maksimal 5MB');
        return;
      }

      setFeaturedImage(file);
      setFeaturedImagePreview(URL.createObjectURL(file));
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await updateBlogPost(id, formData, featuredImage || undefined);
      toast.success('Blog post berhasil diperbarui');
      router.push('/dashboard/admin/content');
    } catch (error) {
      console.error('Error updating blog post:', error);
      toast.error('Gagal memperbarui blog post');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center">
            <FaSpinner className="animate-spin text-4xl text-emerald-500 mb-4" />
            <p className="text-gray-500">Memuat data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-[1600px] mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Edit Blog Post</h1>
          <p className="text-gray-600">Edit artikel, panduan, atau konten blog</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informasi Dasar</h2>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Judul <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Masukkan judul artikel"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-700 focus:border-emerald-500 focus:ring-emerald-500 placeholder:text-gray-500"
                />
              </div>

              <div>
                <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
                  Kategori <span className="text-red-500">*</span>
                </label>
                <select
                  id="categoryId"
                  name="categoryId"
                  required
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-700 focus:border-emerald-500 focus:ring-emerald-500"
                >
                  <option value="">Pilih Kategori</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700">
                  Ringkasan
                </label>
                <textarea
                  id="excerpt"
                  name="excerpt"
                  rows={3}
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  placeholder="Ringkasan singkat artikel"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-700 focus:border-emerald-500 focus:ring-emerald-500 placeholder:text-gray-500"
                />
              </div>
            </div>
          </div>

          {/* Featured Image */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Featured Image</h2>
            <div className="space-y-4">
              {featuredImagePreview ? (
                <div className="relative">
                  <Image
                    src={featuredImagePreview}
                    alt="Featured image preview"
                    width={300}
                    height={200}
                    className="rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFeaturedImage(null);
                      setFeaturedImagePreview('');
                    }}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <FaTimes className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <FaUpload className="w-8 h-8 mb-4 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG, WEBP (MAX. 5MB)</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFeaturedImageChange}
                    />
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Konten <span className="text-red-500">*</span></h2>
            <div className="prose max-w-none border rounded-lg">
              <MenuBar editor={editor} />
              <div className="p-4 min-h-[400px] text-gray-700">
                <EditorContent 
                  editor={editor} 
                  className="text-gray-700 [&_p]:text-gray-700 [&_h1]:text-gray-900 [&_h2]:text-gray-900 focus:outline-none [&_*]:focus:outline-none [&_.ProseMirror]:focus:outline-none [&_.ProseMirror]:min-h-[400px] [&_.ProseMirror]:px-0" 
                />
              </div>
            </div>
          </div>

          {/* SEO Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">SEO Settings</h2>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700">
                  Meta Title
                </label>
                <input
                  type="text"
                  id="metaTitle"
                  name="metaTitle"
                  value={formData.metaTitle}
                  onChange={handleInputChange}
                  placeholder="Judul untuk SEO"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-700 focus:border-emerald-500 focus:ring-emerald-500 placeholder:text-gray-500"
                />
              </div>

              <div>
                <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700">
                  Meta Description
                </label>
                <textarea
                  id="metaDescription"
                  name="metaDescription"
                  rows={3}
                  value={formData.metaDescription}
                  onChange={handleInputChange}
                  placeholder="Deskripsi untuk SEO"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-700 focus:border-emerald-500 focus:ring-emerald-500 placeholder:text-gray-500"
                />
              </div>

              <div>
                <label htmlFor="metaKeywords" className="block text-sm font-medium text-gray-700">
                  Meta Keywords
                </label>
                <input
                  type="text"
                  id="metaKeywords"
                  name="metaKeywords"
                  value={formData.metaKeywords}
                  onChange={handleInputChange}
                  placeholder="Pisahkan dengan koma"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-700 focus:border-emerald-500 focus:ring-emerald-500 placeholder:text-gray-500"
                />
              </div>
            </div>
          </div>

          {/* Publishing Options */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Status Publikasi</h2>
            <div>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-700 focus:border-emerald-500 focus:ring-emerald-500"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:bg-emerald-300 flex items-center space-x-2"
            >
              {submitting && <FaSpinner className="animate-spin" />}
              <span>Simpan</span>
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}