import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(req: Request) {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { name, description, parentId } = body;
    const user = await prisma.user.findFirst({
        where: { id: userId },
        include: { organization: true },
    });

    if (!user?.organization?.id) {
        return NextResponse.json({ error: "Organization not found" }, { status: 400 });
    }

    try {
        const newSection = await prisma.inventorySection.create({
            data: {
                name,
                description,
                parentId: parentId || null, // optional nesting
                organizationId: user.organization.id,
            },
        });

        return NextResponse.json(newSection, { status: 201 });
    } catch (err) {
        console.error("Error creating section:", err);
        return NextResponse.json({ error: "Failed to create section" }, { status: 500 });
    }
}

export async function GET() {
    const session = await auth();
    const userId = session?.user?.id;
    console.log(userId)

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  
    const user = await prisma.user.findFirst({
      where: { id: userId },
      include: { organization: true },
    });
    console.log(user)

  
    if (!user?.organization?.id) {
      return NextResponse.json({ error: "Organization not found" }, { status: 400 });
    }
  
    try {
      const sections = await prisma.inventorySection.findMany({
        where: {
          organizationId: user.organization.id,
        },
      });
  
      return NextResponse.json(sections);
    } catch {
      return NextResponse.json({ error: "Failed to fetch sections" }, { status: 500 });
    }
  }