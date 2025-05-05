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
    const items = await prisma.inventoryItem.findMany({
      where: { sectionId },
      orderBy: { name: 'asc' },
    });
    
    return NextResponse.json(items);
  } catch (err) {
    console.error("Error fetching items:", err);
    return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 });
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
  
  const { name, quantity, location, sku } = body;
  const sectionId = params.sectionid;
  
  const user = await prisma.user.findFirst({
    where: { id: userId },
    include: { organization: true },
  });
  
  if (!user?.organization?.id) {
    return NextResponse.json({ error: "Organization not found" }, { status: 400 });
  }
  
  try {
    const newItem = await prisma.inventoryItem.create({
      data: {
        name,
        quantity: Number(quantity) || 0,
        location: location || "",
        sku: sku || `SKU-${Date.now()}`,
        createdById: userId,
        sectionId,
        organizationId: user.organization.id,
      },
    });
    
    // Create an audit log for the item creation
    await prisma.auditLog.create({
      data: {
        itemId: newItem.id,
        action: "CREATE",
        quantityChange: Number(quantity) || 0,
      },
    });
    
    // Create a stock transaction for the initial quantity
    await prisma.stockTransaction.create({
      data: {
        itemId: newItem.id,
        quantity: Number(quantity) || 0,
        type: "ADD",
      },
    });
    
    return NextResponse.json(newItem, { status: 201 });
  } catch (err) {
    console.error("Error creating item:", err);
    return NextResponse.json({ error: "Failed to create item" }, { status: 500 });
  }
}
