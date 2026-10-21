import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { subDays, format } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data (development only)
  if (process.env.NODE_ENV !== 'production') {
    await prisma.wasteLog.deleteMany();
    await prisma.productionLog.deleteMany();
    await prisma.reuseRule.deleteMany();
    await prisma.item.deleteMany();
    await prisma.user.deleteMany();
    await prisma.station.deleteMany();
  }

  // Create Stations
  console.log('Creating stations...');
  const stations = await Promise.all([
    prisma.station.create({
      data: {
        name: 'Pizza & Pasta',
        code: 'PIZZA_PASTA',
        description: 'Italian station serving pizzas and pasta dishes'
      }
    }),
    prisma.station.create({
      data: {
        name: 'Simply 3',
        code: 'SIMPLY_3',
        description: 'Balanced meals with protein, grain, and vegetable'
      }
    }),
    prisma.station.create({
      data: {
        name: 'Cooked Vegetables',
        code: 'COOKED_VEG',
        description: 'Variety of cooked vegetable sides'
      }
    }),
    prisma.station.create({
      data: {
        name: 'Chicken/Meat',
        code: 'CHICKEN_MEAT',
        description: 'Protein station with various meat options'
      }
    })
  ]);

  console.log(`✅ Created ${stations.length} stations`);

  // Create Items (8 per station)
  console.log('Creating items...');
  const items = await prisma.item.createMany({
    data: [
      // Pizza & Pasta
      { station_id: stations[0].id, name: 'Pepperoni Pizza', category: 'Pizza', unit: 'slice', lb_per_unit: 0.35 },
      { station_id: stations[0].id, name: 'Cheese Pizza', category: 'Pizza', unit: 'slice', lb_per_unit: 0.33 },
      { station_id: stations[0].id, name: 'Veggie Pizza', category: 'Pizza', unit: 'slice', lb_per_unit: 0.37 },
      { station_id: stations[0].id, name: 'Spaghetti with Marinara', category: 'Pasta', unit: 'portion', lb_per_unit: 0.75 },
      { station_id: stations[0].id, name: 'Fettuccine Alfredo', category: 'Pasta', unit: 'portion', lb_per_unit: 0.85 },
      { station_id: stations[0].id, name: 'Penne Arrabbiata', category: 'Pasta', unit: 'portion', lb_per_unit: 0.70 },
      { station_id: stations[0].id, name: 'Garlic Bread', category: 'Side', unit: 'piece', lb_per_unit: 0.15 },
      { station_id: stations[0].id, name: 'Breadsticks', category: 'Side', unit: 'piece', lb_per_unit: 0.10 },
      
      // Simply 3
      { station_id: stations[1].id, name: 'Grilled Chicken Breast', category: 'Protein', unit: 'piece', lb_per_unit: 0.50 },
      { station_id: stations[1].id, name: 'Steamed Rice', category: 'Grain', unit: 'portion', lb_per_unit: 0.40 },
      { station_id: stations[1].id, name: 'Mixed Vegetables', category: 'Vegetable', unit: 'portion', lb_per_unit: 0.35 },
      { station_id: stations[1].id, name: 'Baked Salmon', category: 'Protein', unit: 'piece', lb_per_unit: 0.55 },
      { station_id: stations[1].id, name: 'Quinoa Bowl', category: 'Grain', unit: 'portion', lb_per_unit: 0.45 },
      { station_id: stations[1].id, name: 'Black Beans', category: 'Protein', unit: 'portion', lb_per_unit: 0.38 },
      { station_id: stations[1].id, name: 'Corn on the Cob', category: 'Vegetable', unit: 'piece', lb_per_unit: 0.25 },
      { station_id: stations[1].id, name: 'Side Salad', category: 'Vegetable', unit: 'portion', lb_per_unit: 0.20 },
      
      // Cooked Vegetables
      { station_id: stations[2].id, name: 'Roasted Carrots', category: 'Root Vegetable', unit: 'portion', lb_per_unit: 0.30 },
      { station_id: stations[2].id, name: 'Steamed Broccoli', category: 'Green Vegetable', unit: 'portion', lb_per_unit: 0.28 },
      { station_id: stations[2].id, name: 'Sautéed Green Beans', category: 'Green Vegetable', unit: 'portion', lb_per_unit: 0.25 },
      { station_id: stations[2].id, name: 'Roasted Brussels Sprouts', category: 'Green Vegetable', unit: 'portion', lb_per_unit: 0.32 },
      { station_id: stations[2].id, name: 'Glazed Carrots', category: 'Root Vegetable', unit: 'portion', lb_per_unit: 0.30 },
      { station_id: stations[2].id, name: 'Corn Medley', category: 'Mixed Vegetable', unit: 'portion', lb_per_unit: 0.27 },
      { station_id: stations[2].id, name: 'Roasted Cauliflower', category: 'Mixed Vegetable', unit: 'portion', lb_per_unit: 0.29 },
      { station_id: stations[2].id, name: 'Mixed Vegetable Stir-Fry', category: 'Mixed Vegetable', unit: 'portion', lb_per_unit: 0.35 },
      
      // Chicken/Meat
      { station_id: stations[3].id, name: 'Fried Chicken', category: 'Chicken', unit: 'piece', lb_per_unit: 0.60 },
      { station_id: stations[3].id, name: 'BBQ Ribs', category: 'Pork', unit: 'portion', lb_per_unit: 0.80 },
      { station_id: stations[3].id, name: 'Beef Brisket', category: 'Beef', unit: 'portion', lb_per_unit: 0.70 },
      { station_id: stations[3].id, name: 'Pork Chops', category: 'Pork', unit: 'piece', lb_per_unit: 0.55 },
      { station_id: stations[3].id, name: 'Turkey Breast', category: 'Poultry', unit: 'portion', lb_per_unit: 0.65 },
      { station_id: stations[3].id, name: 'Meatballs', category: 'Beef', unit: 'each', lb_per_unit: 0.12 },
      { station_id: stations[3].id, name: 'Chicken Wings', category: 'Chicken', unit: 'portion', lb_per_unit: 0.45 },
      { station_id: stations[3].id, name: 'Pulled Pork', category: 'Pork', unit: 'portion', lb_per_unit: 0.50 }
    ]
  });

  console.log(`✅ Created items`);

  // Get items for waste logs
  const allItems = await prisma.item.findMany({ include: { station: true } });
  const penneItem = allItems.find(i => i.name === 'Penne Arrabbiata');
  const chickenItem = allItems.find(i => i.name === 'Grilled Chicken Breast');

  // Create Users
  console.log('Creating users...');
  const hashedPin = await bcrypt.hash('1111', 10);
  
  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@maxwell.edu',
        role: 'ADMIN',
        password_hash: hashedPin
      }
    }),
    prisma.user.create({
      data: {
        name: 'Sarah Johnson',
        email: 'manager@maxwell.edu',
        role: 'MANAGER',
        password_hash: await bcrypt.hash('2222', 10)
      }
    }),
    prisma.user.create({
      data: {
        name: 'Mike Chen',
        email: 'mike@maxwell.edu',
        role: 'STAFF',
        station_id: stations[0].id,
        password_hash: await bcrypt.hash('3333', 10)
      }
    }),
    prisma.user.create({
      data: {
        name: 'Emma Davis',
        email: 'emma@maxwell.edu',
        role: 'STAFF',
        station_id: stations[1].id,
        password_hash: await bcrypt.hash('4444', 10)
      }
    }),
    prisma.user.create({
      data: {
        name: 'James Wilson',
        email: 'james@maxwell.edu',
        role: 'STAFF',
        station_id: stations[2].id,
        password_hash: await bcrypt.hash('5555', 10)
      }
    }),
    prisma.user.create({
      data: {
        name: 'Lisa Martinez',
        email: 'lisa@maxwell.edu',
        role: 'STAFF',
        station_id: stations[3].id,
        password_hash: await bcrypt.hash('6666', 10)
      }
    })
  ]);

  console.log(`✅ Created ${users.length} users`);

  // Create Reuse Rule (Chicken → Pizza)
  console.log('Creating reuse rules...');
  if (chickenItem && penneItem) {
    await prisma.reuseRule.create({
      data: {
        source_station_id: stations[3].id, // Chicken/Meat
        source_item_id: chickenItem.id,
        target_station_id: stations[0].id, // Pizza & Pasta
        target_use: 'Chicken topping for pizzas and pasta dishes',
        confidence_score: 0.85,
        is_active: true
      }
    });
  }

  console.log('✅ Created reuse rules');

  // Generate 14 days of waste and production data
  console.log('Generating 14 days of demo data...');
  
  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const shiftDate = subDays(today, i);
    
    // For each station and its items, create realistic data
    for (const station of stations) {
      const stationItems = allItems.filter(item => item.station_id === station.id);
      const staffUser = users.find(u => u.station_id === station.id) || users[0];
      
      for (const item of stationItems.slice(0, 5)) { // Sample 5 items per station
        // Production log
        const quantityProduced = Math.floor(Math.random() * 50) + 30; // 30-80 units
        await prisma.productionLog.create({
          data: {
            station_id: station.id,
            item_id: item.id,
            logged_by: staffUser.id,
            shift_date: shiftDate,
            quantity: quantityProduced,
            weight_lbs: quantityProduced * Number(item.lb_per_unit)
          }
        });
        
        // Waste log with patterns
        let wasteQuantity = 0;
        let wasteReason: any = 'OVERPRODUCTION';
        
        // Penne Arrabbiata overproduction after 8pm
        if (item.name === 'Penne Arrabbiata') {
          wasteQuantity = Math.floor(quantityProduced * (Math.random() * 0.15 + 0.30)); // 30-45% waste
          wasteReason = 'OVERPRODUCTION';
        }
        // Chicken waste for reuse opportunity
        else if (item.name === 'Grilled Chicken Breast') {
          wasteQuantity = Math.floor(Math.random() * 6) + 2; // 2-8 units
          wasteReason = 'OVERPRODUCTION';
        }
        // Simply 3 temperature issues
        else if (station.code === 'SIMPLY_3' && Math.random() > 0.4) {
          wasteQuantity = Math.floor(quantityProduced * 0.15); // 15% waste
          wasteReason = 'TEMPERATURE_ABUSE';
        }
        // Normal waste for others
        else {
          wasteQuantity = Math.floor(quantityProduced * (Math.random() * 0.10 + 0.05)); // 5-15% waste
          wasteReason = ['QUALITY', 'EXPIRED', 'OVERPRODUCTION'][Math.floor(Math.random() * 3)];
        }
        
        if (wasteQuantity > 0) {
          await prisma.wasteLog.create({
            data: {
              station_id: station.id,
              item_id: item.id,
              logged_by: staffUser.id,
              shift_date: shiftDate,
              quantity: wasteQuantity,
              weight_lbs: wasteQuantity * Number(item.lb_per_unit),
              reason: wasteReason,
              disposition: 'TRASH',
              created_at: item.name === 'Penne Arrabbiata' 
                ? new Date(shiftDate.setHours(21, 0, 0)) // 9 PM for evening spike
                : new Date(shiftDate.setHours(Math.floor(Math.random() * 12) + 10, 0, 0)) // 10am-10pm
            }
          });
        }
      }
    }
  }

  console.log('✅ Generated 14 days of demo data');
  console.log('\n✨ Database seeded successfully!');
  console.log('\n👥 Demo Users:');
  console.log('   Admin: Admin User / 1111');
  console.log('   Manager: Sarah Johnson / 2222');
  console.log('   Staff: Mike Chen / 3333 (Pizza & Pasta)');
  console.log('   Staff: Emma Davis / 4444 (Simply 3)');
  console.log('   Staff: James Wilson / 5555 (Cooked Veg)');
  console.log('   Staff: Lisa Martinez / 6666 (Chicken/Meat)');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
