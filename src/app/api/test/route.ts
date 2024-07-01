import type { NextApiRequest, NextApiResponse } from 'next';
import { NextResponse } from "next/server";

// Define the type for the user data
type User = {
  _id: number;
  description: string;
  email: string;
};

// Sample data (in a real application, this data might come from a database or another API)
const sampleUsers: User[] = [
  { _id: 2, description: 'Jane Doe', email: 'jane.doe@example.com' },
  { _id: 3, description: 'Alice Smith', email: 'alice.smith@example.com'},
  { _id: 8, description: 'Rajeev Dave', email: 'rajeev.dave@example.com' },
  { _id: 5, description: 'Bob Johnson', email: 'bob.johnson@example.com'},
  { _id: 1, description: 'John Doe', email: 'john.doe@example.com' },
  
  
];

// Utility function to get users
export async function GET(req: Request, res: Response) {
  return NextResponse.json(sampleUsers)
};

// // Utility function to add a new user
// export async function POST(req: NextApiRequest, res: NextApiResponse<{ message: string }>) {
//   const newUser: User = req.body;
//   sampleUsers.push(newUser);
//   res.status(201).json({ message: 'User added successfully' });
// };

// // Utility function to update a user
// export async function PUT(req: NextApiRequest, res: NextApiResponse<{ message: string }>) {
//   const updatedUser: User = req.body;
//   const index = sampleUsers.findIndex(user => user.id === updatedUser.id);
//   if (index !== -1) {
//     sampleUsers[index] = updatedUser;
//     res.status(200).json({ message: 'User updated successfully' });
//   } else {
//     res.status(404).json({ message: 'User not found' });
//   }
// };

// // Utility function to delete a user
// export async function DELETE(req: NextApiRequest, res: NextApiResponse<{ message: string }>) {
//   const { id } = req.query;
//   const index = sampleUsers.findIndex(user => user.id === Number(id));
//   if (index !== -1) {
//     sampleUsers.splice(index, 1);
//     res.status(200).json({ message: 'User deleted successfully' });
//   } else {
//     res.status(404).json({ message: 'User not found' });
//   }
// };

// Main handler to dispatch requests to the appropriate function based on HTTP method
// export default function handler(req: NextApiRequest, res: NextApiResponse) {
//   switch (req.method) {
//     case 'GET':
//       return getUsers(req, res);
//     case 'POST':
//       return addUser(req, res);
//     case 'PUT':
//       return updateUser(req, res);
//     case 'DELETE':
//       return deleteUser(req, res);
//     default:
//       res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
//       res.status(405).end(`Method ${req.method} Not Allowed`);
//       console.log("method is:", req.method)
//   }
// }