import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, User, Eye, ArrowLeft, Loader2 } from 'lucide-react';
import api from '../utils/api';

const BlogDetails = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentBlogs, setRecentBlogs] = useState([]);

  useEffect(() => {
    const loadBlogData = async () => {
      setLoading(true);
      try {
        const blogRes = await api.get(`/blogs/${slug}`);
        setBlog(blogRes.data.blog);

        const listRes = await api.get('/blogs');
        setRecentBlogs(listRes.data.blogs.filter(b => b.slug !== slug).slice(0, 3));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadBlogData();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <h2 className="text-xl font-bold dark:text-white font-sans">Blog post not found</h2>
        <p className="text-xs text-slate-500 mt-2">The article has been deleted or moved elsewhere.</p>
        <Link to="/blogs" className="block text-primary-600 font-bold hover:underline text-xs mt-4">
          Back to all blogs
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back button */}
      <Link to="/blogs" className="flex items-center gap-1 text-xs text-slate-500 hover:text-primary-600 transition mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to Blogs
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-3">
            <span className="rounded bg-primary-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-600 dark:bg-primary-950/40 dark:text-primary-400">
              {blog.category}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold dark:text-white leading-tight font-sans">
              {blog.title}
            </h1>
            
            {/* Meta logs */}
            <div className="flex flex-wrap gap-4 text-xs text-slate-400 border-y py-3 dark:border-slate-800 font-medium">
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {blog.author?.name}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(blog.createdAt).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {blog.views} Views
              </span>
            </div>
          </div>

          {/* Banner image */}
          <div className="aspect-[16/9] overflow-hidden rounded-2xl bg-slate-100 shadow-md">
            <img src={blog.image} alt={blog.title} className="h-full w-full object-cover" />
          </div>

          {/* Content markdown/html */}
          <div className="prose max-w-none dark:prose-invert text-slate-700 dark:text-slate-300 leading-relaxed text-sm whitespace-pre-line">
            {blog.content}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl border bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Recent Advisories</h3>
            
            <div className="space-y-4">
              {recentBlogs.length === 0 ? (
                <p className="text-xs text-slate-400">No other recent articles.</p>
              ) : (
                recentBlogs.map((b) => (
                  <Link key={b._id} to={`/blogs/${b.slug}`} className="flex gap-3 group">
                    <img src={b.image} alt="thumb" className="h-12 w-20 object-cover rounded-lg shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 group-hover:underline dark:text-slate-200 line-clamp-2">
                        {b.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 block mt-1">{new Date(b.createdAt).toLocaleDateString()}</span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BlogDetails;
