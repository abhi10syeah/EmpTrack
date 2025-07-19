import mongoose, { Schema, Document, models, Model } from 'mongoose';

// This is the interface for the document in the database.
export interface IEmployee extends Document {
  name: string;
  email: string;
  position: string;
  department: string;
  dateOfJoining: Date;
}

const EmployeeSchema: Schema<IEmployee> = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  position: { type: String, required: true },
  department: { type: String, required: true },
  dateOfJoining: { type: Date, required: true },
});

// If the model already exists, use it. Otherwise, create a new one.
// This is important for Next.js HMR.
const Employee: Model<IEmployee> = models.Employee || mongoose.model<IEmployee>('Employee', EmployeeSchema);

export default Employee;
