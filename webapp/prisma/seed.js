  // "prisma": {
  //   "seed": "node prisma/seed.js"
  // },

// prisma/seed.js
const { PrismaClient } = require('../app/generated/prisma'); // Adjust path as needed
const prisma = new PrismaClient();

async function main() {
  console.log('Starting to seed the database...');
  
  // Create an organization
  const organization = await prisma.organization.create({
    data: {
      name: 'TechInventory Inc.',
    },
  });
  
  console.log(`Created organization: ${organization.name}`);
  
  // Create users with different roles
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin@techinventory.com',
        name: 'Admin User',
        role: 'ADMIN',
        organizationId: organization.id,
      },
    }),
    prisma.user.create({
      data: {
        email: 'manager@techinventory.com',
        name: 'Manager User',
        role: 'MANAGER',
        organizationId: organization.id,
      },
    }),
    prisma.user.create({
      data: {
        email: 'viewer@techinventory.com',
        name: 'Viewer User',
        role: 'VIEWER',
        organizationId: organization.id,
      },
    }),
  ]);
  
  console.log(`Created ${users.length} users`);
  
  // Create main inventory sections
  const mainSections = await Promise.all([
    prisma.inventorySection.create({
      data: {
        name: 'Electronics',
        description: 'All electronic devices and components',
        organizationId: organization.id,
      },
    }),
    prisma.inventorySection.create({
      data: {
        name: 'Office Supplies',
        description: 'General office materials and supplies',
        organizationId: organization.id,
      },
    }),
    prisma.inventorySection.create({
      data: {
        name: 'Furniture',
        description: 'Office furniture and fixtures',
        organizationId: organization.id,
      },
    }),
  ]);
  
  console.log(`Created ${mainSections.length} main sections`);
  
  // Create subsections
  const electronicsSubsections = await Promise.all([
    prisma.inventorySection.create({
      data: {
        name: 'Computers',
        description: 'Laptops, desktops, and accessories',
        parentId: mainSections[0].id,
        organizationId: organization.id,
      },
    }),
    prisma.inventorySection.create({
      data: {
        name: 'Networking',
        description: 'Routers, switches, and networking equipment',
        parentId: mainSections[0].id,
        organizationId: organization.id,
      },
    }),
  ]);
  
  const officeSubsections = await Promise.all([
    prisma.inventorySection.create({
      data: {
        name: 'Paper Products',
        description: 'Notebooks, paper, folders',
        parentId: mainSections[1].id,
        organizationId: organization.id,
      },
    }),
    prisma.inventorySection.create({
      data: {
        name: 'Writing Implements',
        description: 'Pens, pencils, markers',
        parentId: mainSections[1].id,
        organizationId: organization.id,
      },
    }),
  ]);
  
  console.log(`Created ${electronicsSubsections.length + officeSubsections.length} subsections`);
  
  // Create items for each section
  const items = [];
  
  // Electronics - Computers items
  const computerItems = await Promise.all([
    prisma.inventoryItem.create({
      data: {
        name: 'Dell XPS 13 Laptop',
        quantity: 15,
        location: 'Main Warehouse - Rack A1',
        sku: 'EL-COMP-001',
        createdById: users[0].id,
        sectionId: electronicsSubsections[0].id,
        organizationId: organization.id,
      },
    }),
    prisma.inventoryItem.create({
      data: {
        name: 'HP EliteDesk Desktop',
        quantity: 8,
        location: 'Main Warehouse - Rack A2',
        sku: 'EL-COMP-002',
        createdById: users[0].id,
        sectionId: electronicsSubsections[0].id,
        organizationId: organization.id,
      },
    }),
    prisma.inventoryItem.create({
      data: {
        name: 'Logitech Wireless Mouse',
        quantity: 30,
        location: 'Main Warehouse - Shelf B1',
        sku: 'EL-COMP-003',
        createdById: users[1].id,
        sectionId: electronicsSubsections[0].id,
        organizationId: organization.id,
      },
    }),
  ]);
  
  items.push(...computerItems);
  
  // Electronics - Networking items
  const networkingItems = await Promise.all([
    prisma.inventoryItem.create({
      data: {
        name: 'Cisco Network Switch',
        quantity: 5,
        location: 'Server Room - Cabinet 1',
        sku: 'EL-NET-001',
        createdById: users[0].id,
        sectionId: electronicsSubsections[1].id,
        organizationId: organization.id,
      },
    }),
    prisma.inventoryItem.create({
      data: {
        name: 'Wireless Router',
        quantity: 12,
        location: 'Server Room - Cabinet 2',
        sku: 'EL-NET-002',
        createdById: users[1].id,
        sectionId: electronicsSubsections[1].id,
        organizationId: organization.id,
      },
    }),
  ]);
  
  items.push(...networkingItems);
  
  // Office Supplies - Paper Products items
  const paperItems = await Promise.all([
    prisma.inventoryItem.create({
      data: {
        name: 'Printer Paper (Reams)',
        quantity: 50,
        location: 'Supply Closet - Shelf A1',
        sku: 'OF-PAP-001',
        createdById: users[1].id,
        sectionId: officeSubsections[0].id,
        organizationId: organization.id,
      },
    }),
    prisma.inventoryItem.create({
      data: {
        name: 'Legal Pads',
        quantity: 35,
        location: 'Supply Closet - Shelf A2',
        sku: 'OF-PAP-002',
        createdById: users[1].id,
        sectionId: officeSubsections[0].id,
        organizationId: organization.id,
      },
    }),
  ]);
  
  items.push(...paperItems);
  
  // Office Supplies - Writing Implements items
  const writingItems = await Promise.all([
    prisma.inventoryItem.create({
      data: {
        name: 'Ballpoint Pens (Box)',
        quantity: 40,
        location: 'Supply Closet - Drawer B1',
        sku: 'OF-WRI-001',
        createdById: users[1].id,
        sectionId: officeSubsections[1].id,
        organizationId: organization.id,
      },
    }),
    prisma.inventoryItem.create({
      data: {
        name: 'Mechanical Pencils',
        quantity: 25,
        location: 'Supply Closet - Drawer B2',
        sku: 'OF-WRI-002',
        createdById: users[1].id,
        sectionId: officeSubsections[1].id,
        organizationId: organization.id,
      },
    }),
  ]);
  
  items.push(...writingItems);
  
  // Furniture items (no subsections)
  const furnitureItems = await Promise.all([
    prisma.inventoryItem.create({
      data: {
        name: 'Office Chair',
        quantity: 20,
        location: 'Furniture Warehouse - Section A',
        sku: 'FUR-001',
        createdById: users[0].id,
        sectionId: mainSections[2].id,
        organizationId: organization.id,
      },
    }),
    prisma.inventoryItem.create({
      data: {
        name: 'Standing Desk',
        quantity: 10,
        location: 'Furniture Warehouse - Section B',
        sku: 'FUR-002',
        createdById: users[0].id,
        sectionId: mainSections[2].id,
        organizationId: organization.id,
      },
    }),
    prisma.inventoryItem.create({
      data: {
        name: 'Filing Cabinet',
        quantity: 15,
        location: 'Furniture Warehouse - Section C',
        sku: 'FUR-003',
        createdById: users[1].id,
        sectionId: mainSections[2].id,
        organizationId: organization.id,
      },
    }),
  ]);
  
  items.push(...furnitureItems);
  
  console.log(`Created ${items.length} inventory items`);
  
  // Create transactions for some items
  const transactions = [];
  
  // Add transactions
  for (let i = 0; i < items.length; i++) {
    // Add stock
    transactions.push(
      await prisma.stockTransaction.create({
        data: {
          itemId: items[i].id,
          quantity: items[i].quantity,
          type: 'ADD',
          timestamp: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000), // Random date within last 30 days
        },
      })
    );
    
    // Random remove transaction for some items
    if (i % 3 === 0) {
      const removeQty = Math.floor(items[i].quantity * 0.2); // Remove 20% of stock
      transactions.push(
        await prisma.stockTransaction.create({
          data: {
            itemId: items[i].id,
            quantity: removeQty,
            type: 'REMOVE',
            timestamp: new Date(Date.now() - Math.floor(Math.random() * 15) * 24 * 60 * 60 * 1000), // Random date within last 15 days
          },
        })
      );
    }
    
    // Random transfer transaction for some items
    if (i % 5 === 0) {
      const transferQty = Math.floor(items[i].quantity * 0.1); // Transfer 10% of stock
      transactions.push(
        await prisma.stockTransaction.create({
          data: {
            itemId: items[i].id,
            quantity: transferQty,
            type: 'TRANSFER',
            timestamp: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000), // Random date within last 7 days
          },
        })
      );
    }
  }
  
  console.log(`Created ${transactions.length} stock transactions`);
  
  // Create audit logs
  const auditLogs = [];
  
  // Create audit logs for each item
  for (let i = 0; i < items.length; i++) {
    // Create log
    auditLogs.push(
      await prisma.auditLog.create({
        data: {
          itemId: items[i].id,
          action: 'CREATE',
          quantityChange: items[i].quantity,
          timestamp: new Date(Date.now() - Math.floor(Math.random() * 45) * 24 * 60 * 60 * 1000), // Random date within last 45 days
        },
      })
    );
    
    // Update log for some items
    if (i % 2 === 0) {
      auditLogs.push(
        await prisma.auditLog.create({
          data: {
            itemId: items[i].id,
            action: 'UPDATE',
            quantityChange: Math.floor(Math.random() * 5) + 1, // Random update between 1-5 items
            timestamp: new Date(Date.now() - Math.floor(Math.random() * 20) * 24 * 60 * 60 * 1000), // Random date within last 20 days
          },
        })
      );
    }
    
    // Adjust log for some items
    if (i % 4 === 0) {
      const adjustQty = Math.floor(Math.random() * 3) + 1; // Random adjustment between 1-3 items
      auditLogs.push(
        await prisma.auditLog.create({
          data: {
            itemId: items[i].id, 
            action: 'ADJUST',
            quantityChange: Math.random() > 0.5 ? adjustQty : -adjustQty, // Randomly positive or negative adjustment
            timestamp: new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000), // Random date within last 10 days
          },
        })
      );
    }
  }
  
  console.log(`Created ${auditLogs.length} audit logs`);
  console.log('Database seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });