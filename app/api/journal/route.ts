import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import Journal from '@/models/Journal';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();
  // @ts-ignore
  const journals = await Journal.find({ userId: session.user.id }).sort({ createdAt: -1 });

  return NextResponse.json(journals);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { content } = await req.json();
    if (!content) {
        return NextResponse.json({ message: 'Content is required' }, { status: 400 });
    }

    await dbConnect();
    const journal = await Journal.create({
        // @ts-ignore
        userId: session.user.id,
        content,
    });

    return NextResponse.json(journal, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Server Error' }, { status: 500 });
  }
}
