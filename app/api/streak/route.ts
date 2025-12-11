import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();
  // @ts-ignore
  const userId = session.user.id;
  console.log('=== STREAK API DEBUG ===');
  console.log('User ID from session:', userId);
  
  const user = await User.findById(userId);
  console.log('User found:', user ? 'YES' : 'NO');
  console.log('currentStreakStart from DB:', user?.currentStreakStart);

  if (!user) {
    return NextResponse.json({ message: 'User not found' }, { status: 404 });
  }

  // Ensure currentStreakStart exists
  if (!user.currentStreakStart) {
    console.log('No currentStreakStart found, creating new one');
    user.currentStreakStart = new Date();
    await user.save();
  }

  // Calculate streak
  const now = new Date();
  const start = new Date(user.currentStreakStart);
  
  // Validate date
  if (isNaN(start.getTime())) {
      console.log('Invalid date detected, resetting');
      user.currentStreakStart = new Date();
      await user.save();
  }

  const validStart = new Date(user.currentStreakStart);
  const diffTime = Math.abs(now.getTime() - validStart.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));

  console.log('Returning startDate:', user.currentStreakStart);
  console.log('=== END DEBUG ===');

  return NextResponse.json({
    streakDays: isNaN(diffDays) ? 0 : diffDays,
    streakHours: isNaN(diffHours) ? 0 : diffHours,
    startDate: user.currentStreakStart,
    history: user.history,
  });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();
  // @ts-ignore
  const user = await User.findById(session.user.id);

  if (!user) {
    return NextResponse.json({ message: 'User not found' }, { status: 404 });
  }

  // Add current reset time to history
  user.history.push(new Date());
  // Reset current streak start
  user.currentStreakStart = new Date();
  
  await user.save();

  return NextResponse.json({ message: 'Streak reset successfully' });
}
