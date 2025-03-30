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



// DELETE /api/notes/ - Delete a note
// Send id in the request body instead of appending url 
export async function DELETE(request: NextRequest) {
  console.log(`[${request.method}] ${request.url}`);

  try {
    
    const { id } = await request.json();

    if (!id) {
      console.error('Invalid ID provided for deletion');
      return NextResponse.json({ error: 'Invalid note ID' }, { status: 400 });
    }

    console.log('Attempting to delete note with ID:', id);
    
    const pythonApiUrl = `${process.env.PYTHON_API_URL}/notes/${id}`;
    console.log('Full Python API URL:', pythonApiUrl);
    
    const response = await fetch(pythonApiUrl, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Python API delete failed:', response.status);
      return NextResponse.json({ error: 'Failed to delete note', details: errorData }, { status: response.status });
    }

    const responseData = await response.json();
    console.log('Note deleted successfully');
    return NextResponse.json(responseData);

  } catch (error: unknown) {
    console.error('Error in DELETE handler:', error);
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 });
  }
}


//same as delete essentially but we update the data base with the updated notes 
export async function PUT(request: NextRequest) {
  console.log(`[${request.method}] ${request.url}`);

  try {
    //Extract data from request body
    const { id, ...updateData } = await request.json();

    if (!id) {
      console.error('Invalid ID provided for update');
      return NextResponse.json({ error: 'Invalid note ID' }, { status: 400 });
    }

    console.log('Attempting to update note with ID:', id);
    console.log('Python API URL:', process.env.PYTHON_API_URL);
    
    const pythonApiUrl = `${process.env.PYTHON_API_URL}/notes/${id}`;
    console.log('Full Python API URL:', pythonApiUrl);

    const response = await fetch(pythonApiUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData), 
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
    return NextResponse.json(updatedNote);

  } catch (error: unknown) {
    console.error('Error in PUT handler:', error);
    return NextResponse.json({ error: 'Failed to update note' }, { status: 500 });
  }
}
