import { NextResponse } from 'next/server';
import { PrismaClient } from '../../../generated/prisma';

const prisma = new PrismaClient();

export async function POST(request: Request) {
    try {
        const { user, content } = await request.json();

        if (!user || !content) {
            return NextResponse.json(
                { error: 'User and content are required' },
                { status: 400 }
            );
        }

        const message = await prisma.message.create({
            data: {
                user,
                content,
            },
        });

        return NextResponse.json(message);
    } catch (error) {
        console.error('Error creating message:', error);
        return NextResponse.json(
            { error: 'Failed to create message' },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const messages = await prisma.message.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        return NextResponse.json(
            { error: 'Failed to fetch messages' },
            { status: 500 }
        );
    }
} 