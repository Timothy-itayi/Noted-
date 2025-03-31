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
        { error: 'Failed to fetch notes', notes: [] }, // Return empty list on failure
        { status: response.status }
      );
    }

    const notes = await response.json();

    // Ensure the response is an array (empty list fallback)
    if (!Array.isArray(notes)) {
      console.warn('Unexpected response format, returning empty list.');
      return NextResponse.json({ notes: [] });
    }

    return NextResponse.json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notes', notes: [] }, // Return empty list on error
      { status: 500 }
    );
  }
}

// POST /api/notes - Create a new note
export async function POST(request: NextRequest) {
  console.log(`[${request.method}] Creating a new note`);

  try {
      const body = await request.json();

      const response = await fetch(`${process.env.PYTHON_API_URL}/notes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
      });

      if (!response.ok) {
          console.error('Failed to create note:', response.status);
          const errorData = await response.json().catch(() => null); // Handle empty response
          return NextResponse.json(
              { error: 'Failed to create note', details: errorData },
              { status: response.status }
          );
      }

      const note = await response.json();
      return NextResponse.json(note);
  } catch (error) {
      console.error('Error creating note:', error);
      return NextResponse.json(
          { error: 'Failed to create note' },
          { status: 500 }
      );
  }
}
