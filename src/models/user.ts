import mongoose, { Schema, Document, models, Model } from 'mongoose';

// This is the interface for the document in the database.
export interface IUser extends Document {
  name: string;
  email: string;
  password: string; // In a real app, this should always be hashed.
  role: 'admin' | 'viewer';
}

const UserSchema: Schema<IUser> = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'viewer'], required: true },
});

// If the model already exists, use it. Otherwise, create a new one.
const User: Model<IUser> = models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
