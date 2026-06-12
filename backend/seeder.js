 const mongoose = require('mongoose');
const dotenv   = require('dotenv');
dotenv.config();

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected!\n');

    // Direct schema yahan define karo — koi import issue nahi hoga
    const productSchema = new mongoose.Schema({
      name:          String,
      description:   String,
      price:         Number,
      originalPrice: Number,
      emoji:         String,
      category:      String,
      badge:         String,
      isAvailable:   { type: Boolean, default: true },
      isVeg:         { type: Boolean, default: false },
      rating:        Number,
      numReviews:    Number,
      prepTime:      Number,
      calories:      Number,
    }, { timestamps: true });

    const userSchema = new mongoose.Schema({
      firstName: String,
      lastName:  String,
      email:     { type: String, unique: true },
      phone:     String,
      password:  String,
      role:      { type: String, default: 'user' },
    }, { timestamps: true });

    const bcrypt = require('bcryptjs');

    const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
    const User    = mongoose.models.User    || mongoose.model('User', userSchema);

    // Data clear karo
    await Product.deleteMany();
    await User.deleteMany();
    console.log('🗑️  older data cleared');

    // Products daalo
    await Product.insertMany([
      { name:'Butter Chicken',   description:'Creamy tomato gravy, tender chicken, basmati rice',     price:249, originalPrice:349, emoji:'🍛', category:'indian',  badge:'Bestseller', isVeg:false, rating:4.9, numReviews:342, calories:520, prepTime:20 },
      { name:'Margherita Pizza', description:'San Marzano tomatoes, fresh mozzarella, basil',          price:319, originalPrice:399, emoji:'🍕', category:'pizza',   badge:'Hot',        isVeg:true,  rating:4.8, numReviews:218, calories:430, prepTime:18 },
      { name:'Smash Burger',     description:'Double patty, cheddar, caramelised onion, secret sauce', price:199, originalPrice:249, emoji:'🍔', category:'burger',  badge:'New',        isVeg:false, rating:4.7, numReviews:156, calories:680, prepTime:15 },
      { name:'Dragon Roll',      description:'Shrimp tempura, avocado, spicy mayo',                    price:389, originalPrice:null,emoji:'🍱', category:'sushi',   badge:null,         isVeg:false, rating:4.9, numReviews:89,  calories:320, prepTime:25 },
      { name:'Gulab Jamun',      description:'Soft milk-solid dumplings in rose syrup',                price:99,  originalPrice:149, emoji:'🍮', category:'dessert', badge:'Sweet',      isVeg:true,  rating:4.8, numReviews:201, calories:280, prepTime:10 },
      { name:'Mango Lassi',      description:'Fresh Alphonso mangoes, thick yogurt, cardamom',         price:89,  originalPrice:null,emoji:'🥭', category:'drinks',  badge:null,         isVeg:true,  rating:4.7, numReviews:167, calories:210, prepTime:5  },
      { name:'Paneer Tikka',     description:'Charred paneer, peppers, mint chutney',                  price:179, originalPrice:229, emoji:'🧆', category:'indian',  badge:'Veg',        isVeg:true,  rating:4.8, numReviews:289, calories:340, prepTime:20 },
      { name:'BBQ Chicken Pizza',description:'Smoky BBQ sauce, grilled chicken, red onions',           price:349, originalPrice:429, emoji:'🍕', category:'pizza',   badge:null,         isVeg:false, rating:4.6, numReviews:143, calories:510, prepTime:20 },
    ]);
    console.log('✅ 8 products are added to the database');

    // Admin user
    const adminPass = await bcrypt.hash('admin123', 10);
    await User.create({
      firstName:'Admin', lastName:'CraveMart',
      email:'admin@cravemart.com', phone:'9999999999',
      password: adminPass, role:'admin',
    });
    console.log('✅ Admin: admin@cravemart.com / admin123');

    // Demo user
    const demoPass = await bcrypt.hash('demo123', 10);
    await User.create({
      firstName:'Demo', lastName:'User',
      email:'demo@cravemart.com', phone:'9876543210',
      password: demoPass, role:'user',
    });
    console.log('✅ Demo:  demo@cravemart.com / demo123');

    console.log('\n🎉 Database ready! now "npm run dev" to start the server\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

seed();