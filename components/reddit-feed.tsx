'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface RedditPost {
  id: string;
  title: string;
  url: string;
  author: string;
  score: number;
}

export function RedditFeed() {
  const [posts, setPosts] = useState<RedditPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch('/api/reddit');
        if (res.ok) {
            const data = await res.json();
            // Handle array vs error object
            if (Array.isArray(data)) {
                setPosts(data);
            } else {
                setError(true);
            }
        } else {
            setError(true);
        }
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  return (
    <Card className="bg-slate-900/40 border-white/5 backdrop-blur-sm shadow-lg overflow-hidden flex flex-col h-full min-h-[300px]">
      <CardHeader className="pb-4 border-b border-white/5 bg-slate-900/20">
        <CardTitle className="text-sm font-semibold text-slate-200 flex items-center justify-between">
            <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-orange-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-2h2v2zm0-4h-2V7h2v6z" /></svg>
                 r/Semenretention
            </span>
             <span className="text-[10px] bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded-full uppercase tracking-wider">Hot</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-y-auto custom-scrollbar">
        {loading ? (
            <div className="flex flex-col gap-4 p-4">
               {[...Array(3)].map((_, i) => (
                   <div key={i} className="animate-pulse space-y-2">
                       <div className="h-4 bg-slate-800 rounded w-3/4"></div>
                       <div className="h-3 bg-slate-800/50 rounded w-1/2"></div>
                   </div>
               ))}
            </div>
        ) : error ? (
            <div className="p-6 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
                <span>⚠️</span>
                <span>Unable to load community update.</span>
                <span className="text-[10px] opacity-50">Reddit API might be busy.</span>
            </div>
        ) : (
            <div className="divide-y divide-white/5">
                {posts.map(post => (
                    <a 
                        key={post.id} 
                        href={post.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="block p-4 hover:bg-white/[0.02] transition-colors group"
                    >
                        <h4 className="text-sm text-slate-300 font-medium group-hover:text-orange-400 transition-colors line-clamp-2 leading-relaxed mb-2">
                            {post.title}
                        </h4>
                        <div className="flex items-center gap-3 text-[10px] text-slate-500">
                             <span className="flex items-center gap-1">
                                <svg className="w-3 h-3 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                                {post.score}
                             </span>
                             <span className="opacity-50">•</span>
                             <span>u/{post.author}</span>
                        </div>
                    </a>
                ))}
            </div>
        )}
      </CardContent>
    </Card>
  );
}
