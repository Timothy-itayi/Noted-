import { NextResponse } from 'next/server';
import * as dynamoose from 'dynamoose';
import { NextRequest } from 'next/server';

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

// GET /api/notes/[id] - Get a specific note
export async function GET(
  request: NextRequest,
  { params }: { params: Record<string, string | string[]> }
) {
  console.log(`[${request.method}] ${request.url}`);
  try {
    const note = await Note.get(params.id as string);
    if (!note) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(note);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch note' },
      { status: 500 }
    );
  }
}

// PUT /api/notes/[id] - Update a note
export async function PUT(
  request: NextRequest,
  { params }: { params: Record<string, string | string[]> }
) {
  console.log(`[${request.method}] ${request.url}`);
  try {
    const body = await request.json();
    const existingNote = await Note.get(params.id as string);
    
    if (!existingNote) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      );
    }

    const updatedNote = {
      ...existingNote,
      ...body,
      updated_at: new Date().toISOString(),
    };
    
    await Note.update({ id: params.id as string }, updatedNote);
    return NextResponse.json(updatedNote);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update note' },
      { status: 500 }
    );
  }
}

// DELETE /api/notes/[id] - Delete a note
export async function DELETE(
  request: NextRequest,
  { params }: { params: Record<string, string | string[]> }
) {
  console.log(`[${request.method}] ${request.url}`);
  try {
    const note = await Note.get(params.id as string);
    if (!note) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      );
    }
    
    await Note.delete(params.id as string);
    return NextResponse.json({ success: true });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete note' },
      { status: 500 }
    );
  }
} 