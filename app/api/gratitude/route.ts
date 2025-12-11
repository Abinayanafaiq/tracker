import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import Gratitude from '@/models/Gratitude';

// GET: Fetch gratitude items
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('mode'); // 'today' or 'history'

  await dbConnect();

  // @ts-ignore
  const userId = session.user.id;
  let data;

  if (mode === 'history') {
    // Fetch past entries (excluding today?? or just all?)
    // Let's fetch all for history, sorted by newest
    data = await Gratitude.find({ userId }).sort({ createdAt: -1 }).limit(50);
  } else {
    // Default: Fetch TODAY'S entries
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    data = await Gratitude.find({
      userId,
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    }).sort({ createdAt: 1 });
  }
  
  return NextResponse.json(data);
}

// POST: Add new gratitude
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { content } = await req.json();

  await dbConnect();
  // @ts-ignore
  const item = await Gratitude.create({
    // @ts-ignore
    userId: session.user.id,
    content,
    isChecked: false
  });

  return NextResponse.json(item);
}

// PUT: Toggle checked status
export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await req.json();

  await dbConnect();
  const item = await Gratitude.findById(id);
  if (!item) return NextResponse.json({ message: 'Not found' }, { status: 404 });

  item.isChecked = !item.isChecked;
  await item.save();

  return NextResponse.json(item);
}

// DELETE: Remove item
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  await dbConnect();
  await Gratitude.findByIdAndDelete(id);

  return NextResponse.json({ message: 'Deleted' });
}
