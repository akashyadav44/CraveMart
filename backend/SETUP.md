# CraveMart Backend — Setup Guide

## Step 1: Node.js install karo
Download from: https://nodejs.org (LTS version)

## Step 2: MongoDB Atlas (Free Database)
1. https://mongodb.com/atlas → Sign up (free)
2. "Create a cluster" → Free tier select karo
3. Username aur password set karo (yaad rakhna!)
4. "Connect" → "Drivers" → Connection string copy karo
   Example: mongodb+srv://riya:mypassword@cluster0.abc.mongodb.net/cravemart

## Step 3: .env file update karo
`backend/.env` file mein MONGO_URI mein apna connection string paste karo:
```
MONGO_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxx.mongodb.net/cravemart
JWT_SECRET=koi_bhi_random_string_likho_yahan
```

## Step 4: Backend start karo
Terminal open karo (VS Code mein Ctrl+` ):
```bash
cd cravemart/backend
npm install
node seeder.js       # Database mein sample data bharo
npm run dev          # Server start karo
```

Browser mein open karo: http://localhost:5000
Agar "CraveMart API running!" dikhe → sab sahi hai! ✅

## Step 5: Frontend use karo
Ab signup.html mein naya account banao — real database mein save hoga!

---
## Test karne ke liye
- Signup karo → MongoDB Atlas dashboard mein "Users" collection mein user dikhega
- Login karo → JWT token milega
- Admin: node seeder.js se admin@cravemart.com / admin123 banta hai
