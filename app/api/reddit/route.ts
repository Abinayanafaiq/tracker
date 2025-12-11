import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Ensure no caching for latest posts

export async function GET() {
  try {
    const res = await fetch('https://www.reddit.com/r/Semenretention/hot.json?limit=10', {
      headers: {
        'User-Agent': 'NoFapTracker/1.0', // Reddit API requires a User-Agent to avoid 429s
      },
      next: { revalidate: 0 } // No cache, always fetch fresh
    });

    if (!res.ok) {
        // If Reddit blocks the request (e.g. 429), return empty or error
        console.error('Reddit API returned status:', res.status);
        throw new Error('Failed to fetch from Reddit');
    }

    const data = await res.json();
    
    // Extract relevant data
    const posts = data.data.children
        .filter((child: any) => !child.data.stickied) // Try to filter out pinned welcome posts if possible, usually they are stickied
        .slice(0, 5) // Take top 5 non-stickied if possible, or just top 5
        .map((child: any) => ({
            id: child.data.id,
            title: child.data.title,
            url: `https://www.reddit.com${child.data.permalink}`,
            author: child.data.author,
            score: child.data.score,
            created: child.data.created_utc,
        }));

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Reddit API Error:', error);
    return NextResponse.json({ message: 'Failed to load community insights' }, { status: 500 });
  }
}
