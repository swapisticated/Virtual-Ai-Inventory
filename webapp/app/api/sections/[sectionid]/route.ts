import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(Request: Request, { params }: { params: { sectionid: string } }) {
  const session = await auth();
  console.log('API session:', session);
  const userId = session?.user?.id;
  if (!userId) {
    console.log('Unauthorized access attempt for section', params.sectionid);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const sectionId = params.sectionid;
  console.log('Fetching section:', sectionId);
  try {
    const section = await prisma.inventorySection.findUnique({
      where: { id: sectionId },
      include: {
        items: true,
        children: true,
        organization: true,
      },
    });
    if (!section) return NextResponse.json({ error: 'Section not found' }, { status: 404 });
    return NextResponse.json(section);
  } catch (err) {
    console.error('Error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { sectionid: string } }) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const sectionId = params.sectionid;
  const body = await req.json();
  try {
    const updatedSection = await prisma.inventorySection.update({
      where: { id: sectionId },
      data: body,
    });
    return NextResponse.json(updatedSection);
  } catch (err) {
    console.error('Error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { sectionid: string } }) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const sectionId = params.sectionid;
  try {
    // Delete all items in the section first (optional: cascade delete)
    await prisma.inventoryItem.deleteMany({ where: { sectionId } });
    // Delete all child sections (optional: cascade delete)
    await prisma.inventorySection.deleteMany({ where: { parentId: sectionId } });
    // Delete the section
    await prisma.inventorySection.delete({ where: { id: sectionId } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

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