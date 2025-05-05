import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { sectionid: string } }) {
  const session = await auth();
  const userId = session?.user?.id;
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const sectionId = params.sectionid;
  
  try {
    const subsections = await prisma.inventorySection.findMany({
      where: { parentId: sectionId },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { items: true }
        }
      }
    });
    
    return NextResponse.json(subsections);
  } catch (err) {
    console.error("Error fetching subsections:", err);
    return NextResponse.json({ error: "Failed to fetch subsections" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { sectionid: string } }) {
  const session = await auth();
  const userId = session?.user?.id;
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  let body;
  try {
    body = await req.json();
  } catch (err) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  
  const { name, description } = body;
  const parentId = params.sectionid;
  
  const user = await prisma.user.findFirst({
    where: { id: userId },
    include: { organization: true },
  });
  
  if (!user?.organization?.id) {
    return NextResponse.json({ error: "Organization not found" }, { status: 400 });
  }
  
  try {
    const newSubsection = await prisma.inventorySection.create({
      data: {
        name,
        description,
        parentId,
        organizationId: user.organization.id,
      },
    });
    
    return NextResponse.json(newSubsection, { status: 201 });
  } catch (err) {
    console.error("Error creating subsection:", err);
    return NextResponse.json({ error: "Failed to create subsection" }, { status: 500 });
  }
}
