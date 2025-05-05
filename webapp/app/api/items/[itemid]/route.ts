import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(req: Request, { params }: { params: { itemid: string } }) {
  const session = await auth();
  const userId = session?.user?.id;
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const itemId = params.itemid;
  
  try {
    // Get the item details before deletion for audit purposes
    const item = await prisma.inventoryItem.findUnique({
      where: { id: itemId },
    });
    
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }
    
    // Create an audit log for the item deletion
    await prisma.auditLog.create({
      data: {
        itemId: item.id,
        action: "DELETE",
        quantityChange: -item.quantity,
      },
    });
    
    // Delete the item
    await prisma.inventoryItem.delete({
      where: { id: itemId },
    });
    
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error deleting item:", err);
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
  }
}

export async function GET(req: Request, { params }: { params: { itemid: string } }) {
  const session = await auth();
  const userId = session?.user?.id;
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const itemId = params.itemid;
  
  try {
    const item = await prisma.inventoryItem.findUnique({
      where: { id: itemId },
      include: {
        section: true,
        auditLogs: {
          orderBy: { timestamp: 'desc' },
          take: 10,
        },
        transactions: {
          orderBy: { timestamp: 'desc' },
          take: 10,
        },
      },
    });
    
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }
    
    return NextResponse.json(item);
  } catch (err) {
    console.error("Error fetching item:", err);
    return NextResponse.json({ error: "Failed to fetch item" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { itemid: string } }) {
  const session = await auth();
  const userId = session?.user?.id;
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const itemId = params.itemid;
  
  let body;
  try {
    body = await req.json();
  } catch (err) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  
  try {
    // Get the current item to calculate quantity change
    const currentItem = await prisma.inventoryItem.findUnique({
      where: { id: itemId },
    });
    
    if (!currentItem) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }
    
    // Update the item
    const updatedItem = await prisma.inventoryItem.update({
      where: { id: itemId },
      data: body,
    });
    
    // If quantity changed, create audit log and transaction
    if (body.quantity !== undefined && body.quantity !== currentItem.quantity) {
      const quantityChange = Number(body.quantity) - currentItem.quantity;
      
      // Create audit log
      await prisma.auditLog.create({
        data: {
          itemId,
          action: "ADJUST",
          quantityChange,
        },
      });
      
      // Create transaction
      await prisma.stockTransaction.create({
        data: {
          itemId,
          quantity: Math.abs(quantityChange),
          type: quantityChange > 0 ? "ADD" : "REMOVE",
        },
      });
    }
    
    return NextResponse.json(updatedItem);
  } catch (err) {
    console.error("Error updating item:", err);
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  }
}
