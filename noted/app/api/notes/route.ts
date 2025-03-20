import { NextResponse } from 'next/server';
import * as dynamoose from 'dynamoose';
import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { NextRequest } from 'next/server';

// Configure DynamoDB
const client = new DynamoDB({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

dynamoose.aws.ddb.set(client);

// Define the Note schema
const NoteSchema = new dynamoose.Schema({
  id: {
    type: String,
    hashKey: true,
  },
  title: String,
  body: String,
  created_at: String,
  updated_at: String,
});

const Note = dynamoose.model('Note', NoteSchema);

// GET /api/notes - Fetch all notes
export async function GET(request: Request) {
  console.log(`[${request.method}] ${request.url}`);
  try {
    const notes = await Note.scan().exec();
    return NextResponse.json(notes);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: 500 }
    );
  }
}

// POST /api/notes - Create a new note
export async function POST(request: NextRequest) {
  console.log(`[${request.method}] ${request.url}`);
  try {
    const body = await request.json();
    const now = new Date().toISOString();
    
    const note = {
      id: crypto.randomUUID(), // Generate a UUID for the ID
      title: body.title,
      body: body.body,
      created_at: now,
      updated_at: now,
    };
    
    await Note.create(note);
    return NextResponse.json(note);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create note' },
      { status: 500 }
    );
  }
} 