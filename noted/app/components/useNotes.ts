import { useState, useEffect } from 'react';

interface Note {
  id: string;
  title: string;
  body: string;
  created_at?: string;
}

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditing && currentNote?.id) {
        // Update note
        const response = await fetch(`/api/notes/${currentNote.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title, body }),
        });
        
        if (response.ok) {
          await fetchNotes(); // Fetch fresh data after update
          setIsEditing(false);
          setCurrentNote(null);
          setTitle('');
          setBody('');
        }
      } else {
        // Create new note
        const response = await fetch('/api/notes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title, body }),
        });

        if (response.ok) {
          await fetchNotes(); // Fetch fresh data after create
          setTitle('');
          setBody('');
        }
      }
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // Validate ID before making the request
      if (!id) {
        console.error('Cannot delete note: Invalid ID');
        return;
      }

      // Ensure ID is properly formatted
      const cleanId = id.trim();
      console.log('Attempting to delete note with ID:', cleanId);
      console.log('Current notes before delete:', notes);
      console.log('Python API URL:', process.env.PYTHON_API_URL);
      
      const deleteUrl = `/api/notes/${cleanId}`;
      console.log('Delete URL:', deleteUrl);
      
      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Delete response status:', response.status);
      console.log('Delete response headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const responseData = await response.json();
        console.log('Delete response data:', responseData);
        console.log('Delete successful, updating notes state');
        const updatedNotes = notes.filter(note => note.id !== cleanId);
        console.log('Updated notes after delete:', updatedNotes);
        setNotes(updatedNotes);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Delete failed with status:', response.status);
        console.error('Delete error data:', errorData);
        // Try to fetch fresh data if delete failed
        await fetchNotes();
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      // Try to fetch fresh data if delete failed
      await fetchNotes();
    }
  };

  const handleEdit = (note: Note) => {
    setIsEditing(true);
    setCurrentNote(note);
    setTitle(note.title);
    setBody(note.body);
  };

  const fetchNotes = async () => {
    try {
      console.log('Fetching notes...');
      const response = await fetch('/api/notes');
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Received data:', data);
        
        if (Array.isArray(data)) {
          // Log each note before filtering
          console.log('Notes before filtering:', data);
          
          // Only filter out completely invalid notes
          const validNotes = data.filter(note => {
            const isValid = note && typeof note === 'object' && note.id;
            console.log('Note validation:', note, isValid);
            return isValid;
          });
          
          console.log('Notes after filtering:', validNotes);
          setNotes(validNotes);
        } else {
          console.error('Received non-array data:', data);
          setNotes([]);
        }
      } else {
        console.error('Failed to fetch notes:', response.status);
        setNotes([]);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
      setNotes([]);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  return {
    notes,
    title,
    body,
    isEditing,
    setTitle,
    setBody,
    handleSubmit,
    handleDelete,
    handleEdit,
    setIsEditing,
    setCurrentNote,
  };
} 