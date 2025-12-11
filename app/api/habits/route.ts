import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import Habbit from '@/models/Habbit';

// GET: Fetch all habits for user
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();
  // @ts-ignore
  const habits = await Habbit.find({ userId: session.user.id }).sort({ createdAt: -1 });
  
  return NextResponse.json(habits);
}

// POST: Create a new habit
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { name, frequency } = await req.json();

  await dbConnect();
  // @ts-ignore
  const habbit = await Habbit.create({
    // @ts-ignore
    userId: session.user.id,
    name,
    frequency,
  });

  return NextResponse.json(habbit);
}

// PUT: Toggle completion for a specific date
export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { id, date } = await req.json();
  
  await dbConnect();

  const habbit = await Habbit.findById(id);
  if (!habbit) {
    return NextResponse.json({ message: 'Habbit not found' }, { status: 404 });
  }

  // Check if date already exists in completedDates (ignoring time)
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  const existingIndex = habbit.completedDates.findIndex((d: Date) => {
    const existingDate = new Date(d);
    existingDate.setHours(0, 0, 0, 0);
    return existingDate.getTime() === targetDate.getTime();
  });

  if (existingIndex > -1) {
    // Remove if exists (Toggle OFF)
    habbit.completedDates.splice(existingIndex, 1);
  } else {
    // Add if not exists (Toggle ON)
    habbit.completedDates.push(targetDate);
  }

  await habbit.save();

  return NextResponse.json(habbit);
}
