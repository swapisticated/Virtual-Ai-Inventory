import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: { sectionid: string } }) {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
    const body = await req.json();
    const { type, ...data } = body;
    const sectionId = params.sectionid;
  
    const user = await prisma.user.findFirst({
      where: { id: userId },
      include: { organization: true },
    });
  
    if (!user?.organization?.id) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 400 });
    }
  
    try {
      if (type === 'item') {
        const newItem = await prisma.inventoryItem.create({
          data: {
            name: data.name,
            quantity: data.quantity,
            location: data.location,
            sku: data.sku,
            createdById: userId,
            sectionId,
            organizationId: user.organization.id,
          },
        });
        return NextResponse.json(newItem, { status: 201 });
      } else if (type === 'subsection') {
        const newSubsection = await prisma.inventorySection.create({
          data: {
            name: data.name,
            description: data.description,
            parentId: sectionId,
            organizationId: user.organization.id,
          },
        });
        return NextResponse.json(newSubsection, { status: 201 });
      } else {
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
      }
    } catch (err) {
      console.error('Error:', err);
      return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
    }
  }
  