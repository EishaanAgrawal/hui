import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting FarmDirect database seed...');

  // Clean existing records
  await prisma.farmerPayout.deleteMany();
  await prisma.delivery.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.review.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.address.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.farmerProfile.deleteMany();
  await prisma.user.deleteMany();

  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const farmerPassword = await bcrypt.hash('Farmer@123', 10);
  const userPassword = await bcrypt.hash('User@123', 10);

  // 1. Create Admin
  const admin = await prisma.user.create({
    data: {
      name: 'FarmDirect System Admin',
      email: 'admin@farmdirect.com',
      passwordHash: adminPassword,
      role: 'ADMIN',
      phone: '+91 98765 00000',
      isVerified: true,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    },
  });
  console.log('✅ Admin created:', admin.email);

  // 2. Create Categories
  const categoriesData = [
    {
      name: 'Fresh Vegetables',
      slug: 'vegetables',
      description: 'Crisp, pesticide-free vegetables harvested daily from local farms',
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=600',
    },
    {
      name: 'Farm Fruits',
      slug: 'fruits',
      description: 'Naturally ripened seasonal and tropical fruits picked at peak sweetness',
      image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&q=80&w=600',
    },
    {
      name: 'Organic Grains',
      slug: 'grains',
      description: 'Single-origin unpolished rice, whole wheat, and heirloom millets',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=600',
    },
    {
      name: 'Pulses & Legumes',
      slug: 'pulses',
      description: 'Sun-dried native lentils, chickpeas, and protein-rich pulses',
      image: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&q=80&w=600',
    },
    {
      name: 'Farm Fresh Dairy',
      slug: 'dairy',
      description: 'Pure A2 milk, cultured Vedic bilona ghee, and fresh artisanal paneer',
      image: 'https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?auto=format&fit=crop&q=80&w=600',
    },
    {
      name: 'Certified Organic',
      slug: 'organic',
      description: '100% NPOP and PGS-India certified organic food products',
      image: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&q=80&w=600',
    },
    {
      name: 'Aromatic Spices',
      slug: 'spices',
      description: 'High-curcumin turmeric, Wayanad cardamom, and Malabar black pepper',
      image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=600',
    },
    {
      name: 'Fresh Herbs',
      slug: 'herbs',
      description: 'Medicinal and culinary fresh herbs harvested hours before delivery',
      image: 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?auto=format&fit=crop&q=80&w=600',
    },
  ];

  const categories: Record<string, any> = {};
  for (const cat of categoriesData) {
    const createdCat = await prisma.category.create({ data: cat });
    categories[cat.slug] = createdCat;
  }
  console.log('✅ Categories created:', Object.keys(categories).length);

  // 3. Create Farmers
  const farmersData = [
    {
      name: 'Rajesh Patil',
      email: 'farmer1@farmdirect.com',
      phone: '+91 98220 11111',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      farmName: 'Green Valley Organics',
      location: 'Nashik, Maharashtra',
      description: 'Third-generation regenerative organic farm specializing in vine-ripened tomatoes, sweet onions, and crisp seasonal vegetables.',
      farmSize: '25 Acres',
      farmingType: 'Certified Organic',
      experienceYears: 18,
    },
    {
      name: 'Suresh Shinde',
      email: 'farmer2@farmdirect.com',
      phone: '+91 98220 22222',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
      farmName: 'Sunrise Agro Farms',
      location: 'Pune Hills, Maharashtra',
      description: 'Pioneers in high-altitude hydroponic lettuce, heirloom carrots, and cold-pressed cold-climate herbs.',
      farmSize: '15 Acres',
      farmingType: 'Hydroponic & Natural',
      experienceYears: 12,
    },
    {
      name: 'Ananya Krishnan',
      email: 'farmer3@farmdirect.com',
      phone: '+91 98220 33333',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
      farmName: 'FreshRoots Heritage Groves',
      location: 'Coimbatore, Tamil Nadu',
      description: 'Cultivating heritage grains, native red rice, high-curcumin Lakadong turmeric, and Malabar spices.',
      farmSize: '30 Acres',
      farmingType: 'Biodynamic & Natural',
      experienceYears: 15,
    },
    {
      name: 'Gurpreet Singh',
      email: 'farmer4@farmdirect.com',
      phone: '+91 98220 44444',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
      farmName: 'Village Harvest Cooperative',
      location: 'Ludhiana, Punjab',
      description: 'Cooperative of 12 traditional wheat, mustard, and unpolished basmati rice growers dedicated to clean soil farming.',
      farmSize: '45 Acres',
      farmingType: 'Zero Budget Natural Farming (ZBNF)',
      experienceYears: 22,
    },
    {
      name: 'Pravin Sawant',
      email: 'farmer5@farmdirect.com',
      phone: '+91 98220 55555',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200',
      farmName: "Nature's Basket Groves",
      location: 'Ratnagiri, Konkan Coast',
      description: 'Famous for authentic GI-tagged Ratnagiri Alphonso mangoes, fresh cashew apples, and organic coastal coconuts.',
      farmSize: '20 Acres',
      farmingType: 'Coastal Natural Agroforestry',
      experienceYears: 25,
    },
  ];

  const farmers: any[] = [];
  for (const f of farmersData) {
    const user = await prisma.user.create({
      data: {
        name: f.name,
        email: f.email,
        phone: f.phone,
        passwordHash: farmerPassword,
        role: 'FARMER',
        avatar: f.avatar,
        isVerified: true,
        farmerProfile: {
          create: {
            farmName: f.farmName,
            location: f.location,
            description: f.description,
            farmSize: f.farmSize,
            farmingType: f.farmingType,
            experienceYears: f.experienceYears,
            verificationStatus: 'VERIFIED',
          },
        },
      },
      include: {
        farmerProfile: true,
      },
    });
    farmers.push(user.farmerProfile);
  }
  console.log('✅ Farmers created:', farmers.length);

  // 4. Create Consumers
  const consumersData = [
    { name: 'Priya Sharma', email: 'consumer1@farmdirect.com', phone: '+91 98111 00001' },
    { name: 'Amit Verma', email: 'consumer2@farmdirect.com', phone: '+91 98111 00002' },
    { name: 'Sneha Patel', email: 'consumer3@farmdirect.com', phone: '+91 98111 00003' },
    { name: 'Rohan Mehra', email: 'consumer4@farmdirect.com', phone: '+91 98111 00004' },
    { name: 'Kavita Rao', email: 'consumer5@farmdirect.com', phone: '+91 98111 00005' },
    { name: 'Vikram Joshi', email: 'consumer6@farmdirect.com', phone: '+91 98111 00006' },
    { name: 'Neha Gupta', email: 'consumer7@farmdirect.com', phone: '+91 98111 00007' },
    { name: 'Siddharth Nair', email: 'consumer8@farmdirect.com', phone: '+91 98111 00008' },
    { name: 'Pooja Iyer', email: 'consumer9@farmdirect.com', phone: '+91 98111 00009' },
    { name: 'Arjun Deshmukh', email: 'consumer10@farmdirect.com', phone: '+91 98111 00010' },
  ];

  const consumers: any[] = [];
  for (const c of consumersData) {
    const user = await prisma.user.create({
      data: {
        name: c.name,
        email: c.email,
        phone: c.phone,
        passwordHash: userPassword,
        role: 'CONSUMER',
        isVerified: true,
        cart: { create: {} },
        addresses: {
          create: {
            name: c.name,
            phone: c.phone,
            addressLine1: 'Flat 402, Green Acre Residences',
            addressLine2: 'Linking Road, Bandra West',
            city: 'Mumbai',
            state: 'Maharashtra',
            postalCode: '400050',
            isDefault: true,
          },
        },
      },
      include: { addresses: true },
    });
    consumers.push(user);
  }
  console.log('✅ Consumers created:', consumers.length);

  // 5. Create Realistic Agricultural Products
  const productsData = [
    // Farmer 1 (Green Valley Organics)
    {
      farmerIndex: 0,
      categorySlug: 'vegetables',
      name: 'Organic Vine-Ripened Red Tomatoes',
      slug: 'organic-vine-ripened-tomatoes',
      description: 'Plump, naturally sun-ripened farm tomatoes bursting with rich sweet flavor. Harvested at sunrise with zero synthetic pesticides.',
      price: 38,
      estimatedMarketPrice: 65,
      unit: 'KG',
      availableQuantity: 180,
      organic: true,
      image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=800',
    },
    {
      farmerIndex: 0,
      categorySlug: 'vegetables',
      name: 'Nashik Red Salad Onions',
      slug: 'nashik-red-salad-onions',
      description: 'Crisp, mildly pungent red onions directly from Nashik valley with prolonged storage shelf-life.',
      price: 32,
      estimatedMarketPrice: 50,
      unit: 'KG',
      availableQuantity: 350,
      organic: true,
      image: 'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&q=80&w=800',
    },
    {
      farmerIndex: 0,
      categorySlug: 'vegetables',
      name: 'Baby Spinach (Palak)',
      slug: 'baby-spinach-palak',
      description: 'Tender, nutrient-dense baby spinach leaves washed in natural spring water.',
      price: 25,
      estimatedMarketPrice: 45,
      unit: 'KG',
      availableQuantity: 90,
      organic: true,
      image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&q=80&w=800',
    },
    {
      farmerIndex: 0,
      categorySlug: 'vegetables',
      name: 'Farm Fresh Crunchy Carrots',
      slug: 'farm-fresh-crunchy-carrots',
      description: 'Naturally sweet deep-orange carrots rich in beta carotene, ideal for fresh salads and juicing.',
      price: 42,
      estimatedMarketPrice: 70,
      unit: 'KG',
      availableQuantity: 220,
      organic: true,
      image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&q=80&w=800',
    },

    // Farmer 2 (Sunrise Agro Farms)
    {
      farmerIndex: 1,
      categorySlug: 'vegetables',
      name: 'Hydroponic Butterhead Lettuce',
      slug: 'hydroponic-butterhead-lettuce',
      description: 'Crisp and delicate hydroponically-grown lettuce free of soil contaminants, perfect for gourmet salads.',
      price: 55,
      estimatedMarketPrice: 95,
      unit: 'PIECE',
      availableQuantity: 120,
      organic: true,
      image: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?auto=format&fit=crop&q=80&w=800',
    },
    {
      farmerIndex: 1,
      categorySlug: 'vegetables',
      name: 'English Seedless Cucumbers',
      slug: 'english-seedless-cucumbers',
      description: 'Refreshing, hydrating cucumbers grown under protective mesh farming.',
      price: 35,
      estimatedMarketPrice: 60,
      unit: 'KG',
      availableQuantity: 160,
      organic: false,
      image: 'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?auto=format&fit=crop&q=80&w=800',
    },
    {
      farmerIndex: 1,
      categorySlug: 'herbs',
      name: 'Italian Sweet Basil & Mint Bundle',
      slug: 'sweet-basil-and-mint',
      description: 'Fragrant aromatic herbs picked minutes prior to dispatch for unmatched culinary vibrancy.',
      price: 30,
      estimatedMarketPrice: 60,
      unit: 'PIECE',
      availableQuantity: 75,
      organic: true,
      image: 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?auto=format&fit=crop&q=80&w=800',
    },
    {
      farmerIndex: 1,
      categorySlug: 'vegetables',
      name: 'Green Bell Peppers (Capsicum)',
      slug: 'green-bell-peppers',
      description: 'Glossy, thick-walled crisp green peppers with sweet garden freshness.',
      price: 48,
      estimatedMarketPrice: 80,
      unit: 'KG',
      availableQuantity: 140,
      organic: true,
      image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&q=80&w=800',
    },

    // Farmer 3 (FreshRoots Heritage Groves)
    {
      farmerIndex: 2,
      categorySlug: 'spices',
      name: 'High-Curcumin Lakadong Turmeric Powder',
      slug: 'lakadong-turmeric-powder',
      description: 'Pure sun-dried golden turmeric with exceptional 7.5%+ natural curcumin content and deep aroma.',
      price: 180,
      estimatedMarketPrice: 280,
      unit: 'KG',
      availableQuantity: 85,
      organic: true,
      image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=800',
    },
    {
      farmerIndex: 2,
      categorySlug: 'grains',
      name: 'Heirloom Red Matta Rice',
      slug: 'heirloom-red-matta-rice',
      description: 'Unpolished nutrient-rich parboiled red rice from traditional indigenous paddy seeds.',
      price: 75,
      estimatedMarketPrice: 120,
      unit: 'KG',
      availableQuantity: 300,
      organic: true,
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=800',
    },
    {
      farmerIndex: 2,
      categorySlug: 'spices',
      name: 'Whole Malabar Black Peppercorns',
      slug: 'malabar-black-peppercorns',
      description: 'Bold grade aromatic tellicherry black peppercorns directly harvested from forest canopy vines.',
      price: 240,
      estimatedMarketPrice: 380,
      unit: 'KG',
      availableQuantity: 50,
      organic: true,
      image: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&q=80&w=800',
    },
    {
      farmerIndex: 2,
      categorySlug: 'pulses',
      name: 'Unpolished Organic Toor Dal',
      slug: 'unpolished-organic-toor-dal',
      description: 'Chemical-free, unpolished pigeon peas with natural protein layers intact.',
      price: 130,
      estimatedMarketPrice: 195,
      unit: 'KG',
      availableQuantity: 200,
      organic: true,
      image: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&q=80&w=800',
    },

    // Farmer 4 (Village Harvest Cooperative)
    {
      farmerIndex: 3,
      categorySlug: 'grains',
      name: 'Traditional Royal Basmati Rice (Aged 2 Years)',
      slug: 'traditional-royal-basmati-rice',
      description: 'Extra-long grain aromatic basmati grown in Himalayan foothills soil and naturally aged for fluffy texture.',
      price: 125,
      estimatedMarketPrice: 190,
      unit: 'KG',
      availableQuantity: 500,
      organic: true,
      image: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&q=80&w=800',
    },
    {
      farmerIndex: 3,
      categorySlug: 'grains',
      name: 'Whole Sharbati Wheat Flour (Atta)',
      slug: 'whole-sharbati-wheat-flour',
      description: 'Stone ground whole grain Sharbati wheat flour for soft rotis and traditional chapatis.',
      price: 45,
      estimatedMarketPrice: 70,
      unit: 'KG',
      availableQuantity: 600,
      organic: true,
      image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=800',
    },
    {
      farmerIndex: 3,
      categorySlug: 'pulses',
      name: 'Organic Whole Green Moong',
      slug: 'organic-whole-green-moong',
      description: 'High sprout-rate green gram harvested naturally without chemical drying agents.',
      price: 110,
      estimatedMarketPrice: 160,
      unit: 'KG',
      availableQuantity: 180,
      organic: true,
      image: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&q=80&w=800',
    },
    {
      farmerIndex: 3,
      categorySlug: 'dairy',
      name: 'Vedic Bilona A2 Desi Cow Ghee',
      slug: 'vedic-bilona-a2-ghee',
      description: 'Traditional slow-cooked bilona ghee made from grass-fed Gir cow cultured curd butter.',
      price: 850,
      estimatedMarketPrice: 1350,
      unit: 'LITRE',
      availableQuantity: 40,
      organic: true,
      image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&q=80&w=800',
    },

    // Farmer 5 (Nature's Basket Groves)
    {
      farmerIndex: 4,
      categorySlug: 'fruits',
      name: 'GI-Tagged Ratnagiri Alphonso Mangoes (Hapus)',
      slug: 'ratnagiri-alphonso-mangoes',
      description: 'World-famous authentic Alphonso mangoes, naturally tree-ripened in grass boxes without carbide.',
      price: 650,
      estimatedMarketPrice: 1100,
      unit: 'DOZEN',
      availableQuantity: 95,
      organic: true,
      image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=800',
    },
    {
      farmerIndex: 4,
      categorySlug: 'fruits',
      name: 'Fresh Tender Green Coconuts',
      slug: 'fresh-tender-green-coconuts',
      description: 'Sweet coastal coconuts packed with natural electrolytes and mineral-rich coconut water.',
      price: 45,
      estimatedMarketPrice: 75,
      unit: 'PIECE',
      availableQuantity: 250,
      organic: true,
      image: 'https://images.unsplash.com/photo-1525385133512-2f3bdd039054?auto=format&fit=crop&q=80&w=800',
    },
    {
      farmerIndex: 4,
      categorySlug: 'fruits',
      name: 'Organic Cavendish Sweet Bananas',
      slug: 'organic-sweet-bananas',
      description: 'Naturally sweetened bananas grown with companion planting and drip irrigation.',
      price: 48,
      estimatedMarketPrice: 75,
      unit: 'DOZEN',
      availableQuantity: 160,
      organic: true,
      image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&q=80&w=800',
    },
    {
      farmerIndex: 4,
      categorySlug: 'fruits',
      name: 'Sweet Nagpur Oranges',
      slug: 'sweet-nagpur-oranges',
      description: 'Juicy, sun-kissed citrus bursting with Vitamin C directly from Maharashtra orchards.',
      price: 70,
      estimatedMarketPrice: 110,
      unit: 'KG',
      availableQuantity: 210,
      organic: false,
      image: 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?auto=format&fit=crop&q=80&w=800',
    },
  ];

  const createdProducts: any[] = [];
  for (const p of productsData) {
    const farmer = farmers[p.farmerIndex];
    const category = categories[p.categorySlug];

    const prod = await prisma.product.create({
      data: {
        farmerId: farmer.id,
        categoryId: category.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        estimatedMarketPrice: p.estimatedMarketPrice,
        unit: p.unit,
        availableQuantity: p.availableQuantity,
        minimumOrderQuantity: 1,
        organic: p.organic,
        harvestDate: new Date(),
        image: p.image,
        isActive: true,
      },
    });
    createdProducts.push(prod);
  }
  console.log('✅ Products created:', createdProducts.length);

  // 6. Create Historical Orders, Order Items, Payouts, and Reviews
  const sampleCustomer = consumers[0];
  const orderProduct1 = createdProducts[0]; // Tomatoes
  const orderProduct2 = createdProducts[4]; // Hydroponic Lettuce

  const sampleOrder = await prisma.order.create({
    data: {
      orderNumber: 'FD-20260825-1001',
      customerId: sampleCustomer.id,
      subtotal: 131,
      deliveryFee: 40,
      platformFee: 7,
      discount: 0,
      total: 178,
      paymentStatus: 'SUCCESS',
      orderStatus: 'DELIVERED',
      deliveryAddressSnapshot: JSON.stringify(sampleCustomer.addresses[0]),
      notes: 'Please leave at security desk if unavailable.',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      items: {
        create: [
          {
            productId: orderProduct1.id,
            farmerId: orderProduct1.farmerId,
            productName: orderProduct1.name,
            unitPrice: orderProduct1.price,
            quantity: 2,
            unit: orderProduct1.unit,
            subtotal: orderProduct1.price * 2,
            status: 'DELIVERED',
          },
          {
            productId: orderProduct2.id,
            farmerId: orderProduct2.farmerId,
            productName: orderProduct2.name,
            unitPrice: orderProduct2.price,
            quantity: 1,
            unit: orderProduct2.unit,
            subtotal: orderProduct2.price * 1,
            status: 'DELIVERED',
          },
        ],
      },
      payment: {
        create: {
          provider: 'RAZORPAY',
          transactionId: 'pay_demo_seeded_tx1',
          amount: 178,
          currency: 'INR',
          status: 'SUCCESS',
          paidAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
      },
      delivery: {
        create: {
          deliveryPartner: 'FarmDirect Express Logistics',
          trackingNumber: 'FDTK202608251001',
          status: 'DELIVERED',
          deliveredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
      },
    },
  });

  // Payouts for this sample order
  await prisma.farmerPayout.create({
    data: {
      farmerId: orderProduct1.farmerId,
      orderId: sampleOrder.id,
      amount: 76,
      platformFee: 4,
      netAmount: 72,
      status: 'PAID',
    },
  });

  await prisma.farmerPayout.create({
    data: {
      farmerId: orderProduct2.farmerId,
      orderId: sampleOrder.id,
      amount: 55,
      platformFee: 3,
      netAmount: 52,
      status: 'PAID',
    },
  });

  // Sample Reviews
  const reviewsSeed = [
    {
      userId: consumers[0].id,
      productId: createdProducts[0].id,
      farmerId: createdProducts[0].farmerId,
      orderId: sampleOrder.id,
      rating: 5,
      comment: 'Super fresh tomatoes! You can truly taste the difference between these and supermarket cold-storage produce. Highly recommend!',
    },
    {
      userId: consumers[1].id,
      productId: createdProducts[0].id,
      farmerId: createdProducts[0].farmerId,
      rating: 5,
      comment: 'Delivered in eco-friendly packaging within 24 hours of harvest. Farmer Rajesh is doing amazing work.',
    },
    {
      userId: consumers[2].id,
      productId: createdProducts[4].id,
      farmerId: createdProducts[4].farmerId,
      rating: 5,
      comment: 'Crispest hydroponic lettuce ever. Perfect for Caesar salad and completely free of grit or insects.',
    },
    {
      userId: consumers[3].id,
      productId: createdProducts[8].id,
      farmerId: createdProducts[8].farmerId,
      rating: 5,
      comment: 'The aroma of this Lakadong turmeric is incredible. You only need a pinch and the color is gorgeous.',
    },
    {
      userId: consumers[4].id,
      productId: createdProducts[16].id,
      farmerId: createdProducts[16].farmerId,
      rating: 5,
      comment: 'Authentic Ratnagiri Hapus mangoes! Naturally sweet with no chemical aftertaste. Arrived safely packed in hay.',
    },
  ];

  for (const r of reviewsSeed) {
    await prisma.review.create({ data: r });
  }

  // Create notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: consumers[0].id,
        title: 'Order Delivered! 📦',
        message: 'Your order #FD-20260825-1001 was delivered successfully. Enjoy your fresh harvest!',
        type: 'ORDER',
        link: `/orders/${sampleOrder.id}`,
      },
      {
        userId: farmers[0].userId,
        title: 'New Order Received! 🌾',
        message: 'You have a new confirmed order for Organic Tomatoes.',
        type: 'ORDER',
        link: `/farmer/orders`,
      },
    ],
  });

  // 12. Create Vehicles and Drivers
  const driverPassword = await bcrypt.hash('Rider@123', 10);
  
  const vehicle1 = await prisma.vehicle.create({
    data: {
      registrationNumber: 'MH-15-AB-1234',
      type: 'MINI_TRUCK',
      maxWeightCapacity: 1000,
      maxVolumeCapacity: 500,
      status: 'AVAILABLE'
    }
  });

  const vehicle2 = await prisma.vehicle.create({
    data: {
      registrationNumber: 'MH-15-XY-9876',
      type: 'VAN',
      maxWeightCapacity: 500,
      maxVolumeCapacity: 300,
      status: 'AVAILABLE'
    }
  });

  const driverUser1 = await prisma.user.create({
    data: {
      name: 'Ramesh Delivery',
      email: 'rider1@farmdirect.com',
      passwordHash: driverPassword,
      role: 'DRIVER',
      phone: '+91 90000 11111',
      isVerified: true,
    }
  });

  await prisma.driver.create({
    data: {
      userId: driverUser1.id,
      assignedVehicleId: vehicle1.id,
      isVerified: true,
      status: 'AVAILABLE'
    }
  });

  const driverUser2 = await prisma.user.create({
    data: {
      name: 'Suresh Express',
      email: 'rider2@farmdirect.com',
      passwordHash: driverPassword,
      role: 'DRIVER',
      phone: '+91 90000 22222',
      isVerified: true,
    }
  });

  await prisma.driver.create({
    data: {
      userId: driverUser2.id,
      assignedVehicleId: vehicle2.id,
      isVerified: true,
      status: 'AVAILABLE'
    }
  });
  console.log('✅ Riders created:', driverUser1.email, driverUser2.email);

  console.log('✅ Seed finished successfully!');
  console.log('------------------------------------------------');
  console.log('🌟 Demo Credentials:');
  console.log('👑 Admin:    admin@farmdirect.com / Admin@123');
  console.log('🚜 Farmer:   farmer1@farmdirect.com / Farmer@123');
  console.log('🛒 Consumer: consumer1@farmdirect.com / User@123');
  console.log('🚚 Rider:    rider1@farmdirect.com / Rider@123');
  console.log('------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
