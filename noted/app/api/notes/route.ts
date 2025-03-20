import { NextResponse } from 'next/server';
import * as dynamoose from 'dynamoose';
import { DynamoDB } from '@aws-sdk/client-dynamodb';

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
export async function GET() {
  try {
    const notes = await Note.scan().exec();
    return NextResponse.json(notes);
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: 500 }
    );
  }
}

// POST /api/notes - Create a new note
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const id = crypto.randomUUID();
    const note = {
      id,
      ...body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    await Note.create(note);
    return NextResponse.json(note);
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to create note' },
      { status: 500 }
    );
  }
} 