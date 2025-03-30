import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import process from 'process';

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




// Send id in the request body instead of appending url 
// DELETE /api/notes/[id] - Delete a note
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } } // Extract `id` from URL params
) {
  console.log(`[${request.method}] ${request.url}`);
  try {
    const { id } = params;  // Get the ID from the URL params
    if (!id) {
      return NextResponse.json({ error: 'Missing note ID' }, { status: 400 });
    }

    const response = await fetch(`${process.env.PYTHON_API_URL}/notes/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      console.error('Python API delete failed:', response.status);
      return NextResponse.json(
        { error: 'Failed to delete note' },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error failed  deleting note:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


//same as delete essentially but we update the data base with the updated notes 
// PUT /api/notes/[id] - Update a note
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } } // Get the 'id' from the route params
) {
  console.log(`[${request.method}] ${request.url}`);

  try {
    const { id } = params; // Extract 'id' from the URL params
    const updateData = await request.json(); // Get the rest of the note data from the request body

    if (!id) {
      console.error('Invalid ID provided for update');
      return NextResponse.json({ error: 'Invalid note ID' }, { status: 400 });
    }

    console.log('Attempting to update note with ID:', id);
    console.log('Python API URL:', process.env.PYTHON_API_URL);

    const pythonApiUrl = `${process.env.PYTHON_API_URL}/notes/${id}`;
    console.log('Full Python API URL:', pythonApiUrl);

    // Send the PUT request to the Python API with the updated note data
    const response = await fetch(pythonApiUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData), // Send the updated note data
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Python API update failed:', response.status);
      return NextResponse.json(
        { error: 'Failed to update note', details: errorData },
        { status: response.status }
      );
    }

    const updatedNote = await response.json();
    console.log('Note updated successfully:', updatedNote);
    return NextResponse.json(updatedNote); // Return the updated note as JSON
  } catch (error: unknown) {
    console.error('Error in PUT handler:', error);
    return NextResponse.json({ error: 'Failed to update note' }, { status: 500 });
  }
}
