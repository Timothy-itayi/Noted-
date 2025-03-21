import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

// GET /api/notes/[id] - Get a specific note
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  console.log(`[${request.method}] ${request.url}`);
  try {
    const { id } = await props.params;
    
    const response = await fetch(`${process.env.PYTHON_API_URL}/notes/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Python API fetch failed:', response.status);
      return NextResponse.json(
        { error: 'Failed to fetch note' },
        { status: response.status }
      );
    }

    const note = await response.json();
    return NextResponse.json(note);
  } catch (error: unknown) {
    console.error('Error fetching note:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to fetch note', details: errorMessage },
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
    
    const response = await fetch(`${process.env.PYTHON_API_URL}/notes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error('Python API update failed:', response.status);
      return NextResponse.json(
        { error: 'Failed to update note' },
        { status: response.status }
      );
    }

    const note = await response.json();
    return NextResponse.json(note);
  } catch (error: unknown) {
    console.error('Error updating note:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to update note', details: errorMessage },
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
    console.log('Python API URL:', process.env.PYTHON_API_URL);
    
    const pythonApiUrl = `${process.env.PYTHON_API_URL}/notes/${id}`;
    console.log('Full Python API URL:', pythonApiUrl);
    
    const response = await fetch(pythonApiUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Python API response status:', response.status);
    console.log('Python API response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Python API delete failed:', response.status);
      console.error('Python API error data:', errorData);
      return NextResponse.json(
        { error: 'Failed to delete note', details: errorData },
        { status: response.status }
      );
    }

    const responseData = await response.json();
    console.log('Python API response data:', responseData);
    console.log('Note deleted successfully');
    return NextResponse.json(responseData);
  } catch (error: unknown) {
    console.error('Error in DELETE handler:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to delete note', details: errorMessage },
      { status: 500 }
    );
  }
} 