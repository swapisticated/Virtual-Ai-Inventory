// app/api/organization/join/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(request: Request) {
  try {
    const { orgCode } = await request.json();
    
    // Fetch user session
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // Check if the organization code exists
    const organization = await prisma.organization.findUnique({
      where: { organizationCode: orgCode }, // Check organization by code
    });

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Check if the user is already part of an organization
    const existingUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { organization: true },
    });

    if (existingUser?.organization) {
      return NextResponse.json({ error: 'User is already part of an organization' }, { status: 400 });
    }

    // Update the user's organization to the selected one
    await prisma.user.update({
      where: { email: session.user.email },
      data: { organizationId: organization.id },
    });

    return NextResponse.json({ message: 'Successfully joined the organization' }, { status: 200 });
  } catch (error) {
    console.error('Error joining organization:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
