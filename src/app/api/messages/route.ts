import { NextResponse } from 'next/server';
import { PrismaClient } from '../../../generated/prisma';
import { logger } from "@/lib/logger/server";

const prisma = new PrismaClient();

export async function POST(request: Request) {
    try {
        const { user, content } = await request.json();

        if (!user || !content) {
            logger.debug('Error creating message: User and content are required');
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
        logger.wait.error('Error creating message:', error);
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
        logger.wait.error('Error fetching messages:', error);
        return NextResponse.json(
            { error: 'Failed to fetch messages' },
            { status: 500 }
        );
    }
} 