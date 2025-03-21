import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

// GET /api/notes - Fetch all notes
export async function GET(request: Request) {
  console.log(`[${request.method}] ${request.url}`);
  try {
    const response = await fetch(`${process.env.PYTHON_API_URL}/notes`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Python API fetch failed:', response.status);
      return NextResponse.json(
        { error: 'Failed to fetch notes' },
        { status: response.status }
      );
    }

    const notes = await response.json();
    return NextResponse.json(notes);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    console.error('Error fetching notes:', error);
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
    
    const response = await fetch(`${process.env.PYTHON_API_URL}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error('Python API create failed:', response.status);
      return NextResponse.json(
        { error: 'Failed to create note' },
        { status: response.status }
      );
    }

    const note = await response.json();
    return NextResponse.json(note);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    console.error('Error creating note:', error);
    return NextResponse.json(
      { error: 'Failed to create note' },
      { status: 500 }
    );
  }
} 