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
  props: { params: Promise<{ id: string }> }
) {
  // Access id from props
  const { id } = await props.params;

  try {
    console.log("Extracted ID for deletion:", id, "Type:", typeof id);

    if (!id) {
      console.error("Error: Invalid ID provided for delete.");
      return NextResponse.json({ error: "Invalid ID provided for delete" }, { status: 400 });
    }

    const apiUrl = `${process.env.PYTHON_API_URL}/notes/${id}`;
    console.log("Deleting note at:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    const responseText = await response.text();
    if (!response.ok) {
      console.error("Python API delete failed:", response.status, responseText);
      return NextResponse.json(
        { error: "Failed to delete note" },
        { status: response.status }
      );
    }

    console.log("Note deleted successfully:", id);
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Error deleting note:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}



//same as delete essentially but we update the data base with the updated notes 
// PUT /api/notes/[id] - Update a note


export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  // Access id from props
  const { id } = await props.params;

  if (!id) {
    return NextResponse.json({ error: 'Invalid ID provided for update' }, { status: 400 });
  }

  console.log('Attempting to update note with ID:', id);

  try {
    const updateData = await request.json(); // Get the note data to update from the body

    const pythonApiUrl = `${process.env.PYTHON_API_URL}/notes/${id}`;
    console.log('Full Python API URL:', pythonApiUrl);

    // Send PUT request to the Python API with the updated note data
    const response = await fetch(pythonApiUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData), // Send the updated data
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
    return NextResponse.json(updatedNote); // Return the updated note

  } catch (error) {
    console.error('Error in PUT handler:', error);
    return NextResponse.json({ error: 'Failed to update note' }, { status: 500 });
  }
}
