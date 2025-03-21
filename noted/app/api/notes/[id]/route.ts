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
  props: { params: Promise<{ id: string }> }
) {
  // Log the request details
  console.log(`[${request.method}] ${request.url}`);
  
  try {
    // Get params from Promise
    const { id } = await props.params;
    
    // Get note by ID from DynamoDB
    const note = await Note.get(id);
    
    // Check if note exists
    if (!note) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      );
    }
    
    // Return the note if found
    return NextResponse.json(note);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    // Handle any errors
    return NextResponse.json(
      { error: 'Failed to fetch note' },
      { status: 500 }
    );
  }
}

// PUT /api/notes/[id] - Update a note
export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  console.log(`[${request.method}] ${request.url}`);
  try {
    const { id } = await props.params;
    const body = await request.json();
    const existingNote = await Note.get(id);
    
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
    
    await Note.update({ id }, updatedNote);
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
  props: { params: Promise<{ id: string }> }
) {
  console.log(`[${request.method}] ${request.url}`);
  try {
    const { id } = await props.params;
    
    // Validate ID
    if (!id) {
      console.error('Invalid ID provided for deletion');
      return NextResponse.json(
        { error: 'Invalid note ID' },
        { status: 400 }
      );
    }

    console.log('Attempting to delete note with ID:', id);
    
    // First check if the note exists
    const note = await Note.get(id);
    console.log('Found note:', note);
    
    if (!note) {
      console.log('Note not found, returning 404');
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      );
    }
    
    // Delete the note using the correct Dynamoose method
    console.log('Deleting note...');
    await Note.delete({ id: id.trim() });  // Ensure ID is trimmed
    console.log('Note deleted successfully');
    
    return NextResponse.json({ success: true });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    console.error('Error in DELETE handler:', error);
    return NextResponse.json(
      { error: 'Failed to delete note' },
      { status: 500 }
    );
  }
} 