import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import connectDB from '../config/db.js';
import Product from '../models/products.js';
import Category from '../models/Category.js';
import Review from '../models/Review.js';
import Message from '../models/Message.js';
import Admin from '../models/Admin.js';


// Load environment variables
dotenv.config();

// Sample Categories
const categories = [
  {
    name: 'Robot Cleaners',
    slug: 'robot-cleaners',
    description: 'Advanced robotic vacuum and floor cleaning solutions',
    icon: '🧹',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'
  },
  {
    name: 'Kitchen Robots',
    slug: 'kitchen-robots',
    description: 'Automated cooking and food preparation assistants',
    icon: '👨‍🍳',
    image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400'
  },
  {
    name: 'Lawn Care',
    slug: 'lawn-care',
    description: 'Smart lawn mowing and garden maintenance robots',
    icon: '🌱',
    image: 'https://images.unsplash.com/photo-1558904541-efa843a96f01?w=400'
  },
  {
    name: 'Security Robots',
    slug: 'security-robots',
    description: 'Autonomous security and surveillance systems',
    icon: '🔒',
    image: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=400'
  },
  {
    name: 'Service Robots',
    slug: 'service-robots',
    description: 'Food service and hospitality automation',
    icon: '🍽️',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400'
  },
  {
    name: 'Companion Robots',
    slug: 'companion-robots',
    description: 'Social and entertainment robotic companions',
    icon: '🤖',
    image: 'https://images.unsplash.com/photo-1563207153-f403bf289096?w=400'
  }
];

// Sample Products (will be created after categories)
const getProducts = (categoryIds) => [
  {
    name: 'RoboClean Pro X1',
    description: 'The RoboClean Pro X1 is our flagship robotic vacuum cleaner featuring advanced AI navigation, 3000Pa suction power, and multi-floor mapping. Perfect for homes with pets and hard-to-reach areas.',
    price: 599.99,
    discountPrice: 499.99,
    category: categoryIds['robot-cleaners'],
    images: [
      { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', alt: 'RoboClean Pro X1' },
      { url: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=800', alt: 'RoboClean Pro X1 Side View' }
    ],
    thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    stock: 45,
    specifications: [
      { key: 'Suction Power', value: '3000Pa' },
      { key: 'Battery Life', value: '120 minutes' },
      { key: 'Dustbin Capacity', value: '600ml' },
      { key: 'Noise Level', value: '55dB' },
      { key: 'Navigation', value: 'LiDAR + AI' }
    ],
    features: [
      'Multi-floor mapping',
      'Auto-empty base station',
      'Pet hair optimization',
      'Voice control compatible',
      'App-based scheduling'
    ],
    rating: 4.8,
    numReviews: 0,
    featured: true,
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    tags: ['vacuum', 'smart home', 'pet-friendly', 'bestseller']
  },
  {
    name: 'ChefBot Deluxe',
    description: 'Revolutionary automated cooking assistant with 500+ pre-programmed recipes. The ChefBot Deluxe handles everything from chopping to cooking, making gourmet meals accessible to everyone.',
    price: 1299.99,
    category: categoryIds['kitchen-robots'],
    images: [
      { url: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800', alt: 'ChefBot Deluxe' }
    ],
    thumbnail: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400',
    stock: 23,
    specifications: [
      { key: 'Recipe Database', value: '500+ recipes' },
      { key: 'Cooking Capacity', value: '4-6 servings' },
      { key: 'Power', value: '1500W' },
      { key: 'Display', value: '10" touchscreen' }
    ],
    features: [
      'Automatic ingredient recognition',
      'Step-by-step guidance',
      'Custom recipe creation',
      'Nutritional tracking',
      'Easy cleanup design'
    ],
    rating: 4.9,
    numReviews: 0,
    featured: true,
    tags: ['cooking', 'kitchen', 'automation', 'new-arrival']
  },
  {
    name: 'LawnMaster AI',
    description: 'Smart robotic lawn mower with weather adaptation and GPS boundary mapping. Maintains your lawn perfectly while you relax.',
    price: 799.99,
    discountPrice: 699.99,
    category: categoryIds['lawn-care'],
    images: [
      { url: 'https://images.unsplash.com/photo-1558904541-efa843a96f01?w=800', alt: 'LawnMaster AI' }
    ],
    thumbnail: 'https://images.unsplash.com/photo-1558904541-efa843a96f01?w=400',
    stock: 34,
    specifications: [
      { key: 'Cutting Width', value: '22cm' },
      { key: 'Max Lawn Size', value: '1000m²' },
      { key: 'Battery Life', value: '90 minutes' },
      { key: 'Slope Capability', value: '35%' }
    ],
    features: [
      'GPS boundary mapping',
      'Weather sensor',
      'Automatic charging',
      'Anti-theft alarm',
      'Spiral cutting pattern'
    ],
    rating: 4.7,
    numReviews: 0,
    featured: true,
    tags: ['lawn', 'outdoor', 'gardening']
  },
  {
    name: 'ServeBot Elite',
    description: 'Professional food and beverage serving robot for restaurants and events. Autonomous navigation with tray stabilization technology.',
    price: 899.99,
    category: categoryIds['service-robots'],
    images: [
      { url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800', alt: 'ServeBot Elite' }
    ],
    thumbnail: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400',
    stock: 15,
    specifications: [
      { key: 'Payload Capacity', value: '10kg' },
      { key: 'Speed', value: '1.2 m/s' },
      { key: 'Battery Life', value: '8 hours' },
      { key: 'Tray Levels', value: '3 levels' }
    ],
    features: [
      'Obstacle avoidance',
      'Voice announcements',
      'Tray stabilization',
      'Multi-floor support',
      'Customer interaction'
    ],
    rating: 4.6,
    numReviews: 0,
    featured: true,
    tags: ['restaurant', 'service', 'hospitality']
  },
  {
    name: 'GuardBot Pro',
    description: 'Advanced security robot with 360° camera coverage, thermal imaging, and AI-powered threat detection for comprehensive property protection.',
    price: 1499.99,
    category: categoryIds['security-robots'],
    images: [
      { url: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800', alt: 'GuardBot Pro' }
    ],
    thumbnail: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=400',
    stock: 12,
    specifications: [
      { key: 'Camera Resolution', value: '4K 360°' },
      { key: 'Thermal Imaging', value: 'Yes' },
      { key: 'Patrol Range', value: '5km' },
      { key: 'Battery Life', value: '12 hours' }
    ],
    features: [
      'AI threat detection',
      'Two-way audio',
      'Automatic alerts',
      'Night vision',
      'Weather resistant'
    ],
    rating: 4.9,
    numReviews: 0,
    featured: false,
    tags: ['security', 'surveillance', 'ai']
  },
  {
    name: 'CompanionBot Joy',
    description: 'Friendly social robot designed for companionship and entertainment. Features emotional AI, games, and video calling capabilities.',
    price: 399.99,
    category: categoryIds['companion-robots'],
    images: [
      { url: 'https://images.unsplash.com/photo-1563207153-f403bf289096?w=800', alt: 'CompanionBot Joy' }
    ],
    thumbnail: 'https://images.unsplash.com/photo-1563207153-f403bf289096?w=400',
    stock: 56,
    specifications: [
      { key: 'Display', value: '8" touchscreen' },
      { key: 'Speakers', value: 'Stereo 10W' },
      { key: 'Camera', value: '1080p' },
      { key: 'Battery Life', value: '6 hours' }
    ],
    features: [
      'Emotional AI',
      'Video calling',
      'Games and entertainment',
      'Music streaming',
      'Daily reminders'
    ],
    rating: 4.5,
    numReviews: 0,
    featured: false,
    tags: ['companion', 'entertainment', 'family']
  },
  {
    name: 'RoboClean Mini',
    description: 'Compact robotic vacuum perfect for apartments and small spaces. Powerful cleaning in a small package.',
    price: 299.99,
    category: categoryIds['robot-cleaners'],
    images: [
      { url: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=800', alt: 'RoboClean Mini' }
    ],
    thumbnail: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400',
    stock: 67,
    specifications: [
      { key: 'Suction Power', value: '2000Pa' },
      { key: 'Battery Life', value: '90 minutes' },
      { key: 'Dustbin Capacity', value: '400ml' },
      { key: 'Height', value: '7.5cm' }
    ],
    features: [
      'Ultra-slim design',
      'Quiet operation',
      'Auto-recharge',
      'Edge cleaning',
      'App control'
    ],
    rating: 4.4,
    numReviews: 0,
    featured: false,
    tags: ['vacuum', 'compact', 'apartment']
  },
  {
    name: 'PoolBot Aqua',
    description: 'Automated pool cleaning robot with advanced filtration and wall-climbing capability.',
    price: 699.99,
    category: categoryIds['lawn-care'],
    images: [
      { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', alt: 'PoolBot Aqua' }
    ],
    thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    stock: 28,
    specifications: [
      { key: 'Pool Size', value: 'Up to 50ft' },
      { key: 'Cleaning Cycle', value: '2 hours' },
      { key: 'Filter Type', value: 'Dual cartridge' },
      { key: 'Cable Length', value: '60ft' }
    ],
    features: [
      'Wall climbing',
      'Smart navigation',
      'Energy efficient',
      'Easy filter cleaning',
      'Tangle-free cable'
    ],
    rating: 4.6,
    numReviews: 0,
    featured: false,
    tags: ['pool', 'cleaning', 'outdoor']
  }
];

// Sample Reviews
const getReviews = (productIds) => [
  {
    product: productIds[0],
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    rating: 5,
    comment: 'The RoboClean Pro X1 is absolutely amazing. It handles pet hair like a champ and the mapping feature is incredibly accurate. Worth every penny!',
    verified: true,
    helpful: 45,
    status: 'approved'
  },
  {
    product: productIds[0],
    name: 'Mike Chen',
    email: 'mike.c@email.com',
    rating: 4,
    comment: 'Overall very satisfied. The suction is powerful and it navigates well. Sometimes gets stuck on thick carpets but that\'s rare.',
    verified: true,
    helpful: 23,
    status: 'approved'
  },
  {
    product: productIds[1],
    name: 'Emily Rodriguez',
    email: 'emily.r@email.com',
    rating: 5,
    comment: 'ChefBot has transformed our dinner routine. The recipes are delicious and it\'s so easy to use. My kids love watching it cook!',
    verified: true,
    helpful: 67,
    status: 'approved'
  },
  {
    product: productIds[1],
    name: 'David Park',
    email: 'david.p@email.com',
    rating: 5,
    comment: 'As someone who loves cooking, I was skeptical. But this robot actually delivers restaurant-quality meals. Impressive!',
    verified: true,
    helpful: 34,
    status: 'approved'
  },
  {
    product: productIds[2],
    name: 'Jennifer Smith',
    email: 'jen.smith@email.com',
    rating: 5,
    comment: 'LawnMaster AI keeps my lawn perfectly manicured. The weather sensor is a great feature - it knows when to skip rainy days.',
    verified: true,
    helpful: 28,
    status: 'approved'
  },
  {
    product: productIds[2],
    name: 'Robert Taylor',
    email: 'rob.t@email.com',
    rating: 4,
    comment: 'Does a great job on flat lawns. Had some issues with slopes initially but customer service helped me adjust the settings.',
    verified: true,
    helpful: 15,
    status: 'approved'
  },
  {
    product: productIds[3],
    name: 'Lisa Anderson',
    email: 'lisa.a@email.com',
    rating: 5,
    comment: 'ServeBot Elite has been a fantastic addition to our restaurant. Customers love it and it really helps during busy hours.',
    verified: true,
    helpful: 52,
    status: 'approved'
  },
  {
    product: productIds[4],
    name: 'James Wilson',
    email: 'james.w@email.com',
    rating: 5,
    comment: 'GuardBot Pro provides peace of mind. The AI detection is very accurate and I love getting instant alerts on my phone.',
    verified: true,
    helpful: 41,
    status: 'approved'
  },
  {
    product: productIds[5],
    name: 'Maria Garcia',
    email: 'maria.g@email.com',
    rating: 4,
    comment: 'Bought this for my mother and she loves it. The video calling feature is perfect for staying connected.',
    verified: true,
    helpful: 19,
    status: 'approved'
  },
  {
    product: productIds[6],
    name: 'Tom Brown',
    email: 'tom.b@email.com',
    rating: 4,
    comment: 'RoboClean Mini is perfect for my small apartment. Quiet and effective. Would recommend for small spaces.',
    verified: true,
    helpful: 12,
    status: 'approved'
  }
];

// Sample Messages
const messages = [
  {
    name: 'John Doe',
    email: 'john.doe@email.com',
    subject: 'Question about RoboClean Pro X1',
    message: 'Hi, I\'m interested in the RoboClean Pro X1. Does it work well on hardwood floors? Also, what\'s the warranty period?',
    status: 'new',
    priority: 'normal'
  },
  {
    name: 'Alice Cooper',
    email: 'alice.cooper@email.com',
    subject: 'Bulk order inquiry',
    message: 'We\'re looking to purchase 10 ServeBot Elite units for our hotel chain. Can you provide a quote for bulk pricing?',
    status: 'new',
    priority: 'high'
  },
  {
    name: 'Bob Martin',
    email: 'bob.martin@email.com',
    subject: 'Shipping to Canada',
    message: 'Do you ship to Canada? I\'m interested in the ChefBot Deluxe.',
    status: 'read',
    priority: 'normal'
  },
  {
    name: 'Carol White',
    email: 'carol.white@email.com',
    subject: 'Product comparison',
    message: 'What\'s the difference between RoboClean Pro X1 and RoboClean Mini? Which one would you recommend for a 2-bedroom apartment?',
    status: 'replied',
    priority: 'normal',
    notes: 'Recommended RoboClean Mini for apartment size. Sent comparison chart.'
  },
  {
    name: 'Daniel Lee',
    email: 'daniel.lee@email.com',
    subject: 'Technical support needed',
    message: 'My LawnMaster AI is not connecting to WiFi. I\'ve tried resetting it multiple times. Please help!',
    status: 'new',
    priority: 'high'
  },
  {
    name: 'Emma Davis',
    email: 'emma.davis@email.com',
    subject: 'Partnership opportunity',
    message: 'I represent a retail chain and would like to discuss carrying your products in our stores. Please contact me.',
    status: 'read',
    priority: 'high'
  },
  {
    name: 'Frank Miller',
    email: 'frank.miller@email.com',
    subject: 'Great products!',
    message: 'Just wanted to say I love my RoboClean Pro X1. Best purchase I\'ve made this year!',
    status: 'archived',
    priority: 'low'
  }
];


// Admin user
const admin = {
  email: 'sakshm@gmail.com',
  password: 'sakshTech123',
  name: 'Admin User',
  role: 'admin'
};


// Seed function
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seed...');

    // Connect to database
    await connectDB();

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Product.deleteMany({});
    await Category.deleteMany({});
    await Review.deleteMany({});
    await Message.deleteMany({});
    await Admin.deleteMany({});

    // Drop indexes to prevent conflicts
    console.log('🔧 Dropping indexes...');
    try {
      await Product.collection.dropIndexes();
      await Category.collection.dropIndexes();
    } catch (err) {
      console.log('Note: Some indexes could not be dropped (this is normal on first run)');
    }


    // Create categories
    console.log('📁 Creating categories...');
    const createdCategories = await Category.insertMany(categories);
    console.log(`✅ Created ${createdCategories.length} categories`);

    // Create category ID map
    const categoryIds = {};
    createdCategories.forEach(cat => {
      categoryIds[cat.slug] = cat._id;
    });

    // Create products
    console.log('📦 Creating products...');
    const productsData = getProducts(categoryIds);
    const createdProducts = await Product.insertMany(productsData);
    console.log(`✅ Created ${createdProducts.length} products`);

    // Update category product counts
    for (const category of createdCategories) {
      await category.updateProductCount();
    }

    // Create reviews
    console.log('⭐ Creating reviews...');
    const productIds = createdProducts.map(p => p._id);
    const reviewsData = getReviews(productIds);
    const createdReviews = await Review.insertMany(reviewsData);
    console.log(`✅ Created ${createdReviews.length} reviews`);

    // Update product ratings
    for (const product of createdProducts) {
      const productReviews = createdReviews.filter(
        r => r.product.toString() === product._id.toString()
      );
      if (productReviews.length > 0) {
        const avgRating = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
        product.rating = Math.round(avgRating * 10) / 10;
        product.numReviews = productReviews.length;
        await product.save();
      }
    }

    // Create messages
    console.log('💬 Creating messages...');
    const createdMessages = await Message.insertMany(messages);
    console.log(`✅ Created ${createdMessages.length} messages`);

    // Create admin user
    console.log('👤 Creating admin user...');
    await Admin.create(admin);
    console.log('✅ Created admin user');


    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Categories: ${createdCategories.length}`);
    console.log(`   Products: ${createdProducts.length}`);
    console.log(`   Reviews: ${createdReviews.length}`);
    console.log(`   Messages: ${createdMessages.length}`);
    console.log(`   Admin: 1`);
    console.log('\n🔐 Admin Credentials:');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Password: ${admin.password}`);
    console.log('\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seed
seedDatabase();
