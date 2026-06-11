 const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

// Pehle check karo model already exist karta hai ya nahi
if (mongoose.models.User) {
  delete mongoose.models.User;
}

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName:  { type: String, required: true, trim: true },
  email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone:     { type: String, required: true },
  password:  { type: String, required: true, minlength: 6, select: false },
  role:      { type: String, enum: ['user', 'admin'], default: 'user' },
}, { timestamps: true });

// Password hash karo save se pehle
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Password check
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);