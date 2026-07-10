import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BookOpen, Calendar, ArrowRight, Loader2, Info } from 'lucide-react';
import api from '../utils/api';

const BlogList = () => {
  const [searchParams] = useSearchParams();
  const catParam = searchParams.get('category');

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        const query = catParam ? `?category=${catParam}` : '';
        const res = await api.get(`/blogs${query}`);
        setBlogs(res.data.blogs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, [catParam]);

  const categories = [
    'Real Estate Advice',
    'Market Trends',
    'Legal & Taxes',
    'Home Decor',
    'Neighborhood Guides'
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <BookOpen className="mx-auto h-12 w-12 text-primary-500" />
        <h1 className="text-3xl font-extrabold tracking-tight dark:text-white">Real Estate Advisory Blog</h1>
        <p className="text-xs text-slate-500">Expert tips, design tutorials, and market analysis forecasts.</p>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar border-b dark:border-slate-800">
        <Link
          to="/blogs"
          className={`rounded-full px-4 py-1 text-xs font-semibold shrink-0 transition ${
            !catParam
              ? 'bg-primary-600 text-white shadow'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          All Articles
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat}
            to={`/blogs?category=${cat}`}
            className={`rounded-full px-4 py-1 text-xs font-semibold shrink-0 transition ${
              catParam === cat
                ? 'bg-primary-600 text-white shadow'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {cat}
          </Link>
        ))}
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        </div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 dark:bg-slate-900 rounded-2xl">
          <Info className="mx-auto h-12 w-12 text-slate-300 mb-2" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No blog articles found</p>
          <p className="text-xs text-slate-500 mt-1">Check back later or change filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <Link
              key={blog._id}
              to={`/blogs/${blog.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md dark:border-slate-800 dark:bg-slate-900 transition"
            >
              <div className="aspect-[16/10] overflow-hidden bg-slate-100">
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="h-full w-full object-cover transition group-hover:scale-105 duration-500"
                />
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <span className="text-[9px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider">
                    {blog.category}
                  </span>
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 line-clamp-2">
                    {blog.title}
                  </h3>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-500 border-t pt-3 dark:border-slate-800">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(blog.createdAt).toLocaleDateString()}
                  </span>
                  <span className="font-bold flex items-center gap-0.5 hover:underline">
                    Read article <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogList;
