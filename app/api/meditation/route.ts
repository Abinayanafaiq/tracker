import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import Meditation from '@/models/Meditation';

// GET: Fetch recent meditation sessions
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();
  // @ts-ignore
  const sessions = await Meditation.find({ userId: session.user.id }).sort({ createdAt: -1 }).limit(10);
  
  return NextResponse.json(sessions);
}

// POST: Log a new session
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { duration } = await req.json();

  await dbConnect();
  // @ts-ignore
  const meditation = await Meditation.create({
    // @ts-ignore
    userId: session.user.id,
    duration,
  });

  return NextResponse.json(meditation);
}
