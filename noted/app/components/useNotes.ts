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
      console.log('Attempting to delete note with ID:', id);
      console.log('Current notes before delete:', notes);
      
      const response = await fetch(`/api/notes/${id}`, {
        method: 'DELETE',
      });
      
      console.log('Delete response status:', response.status);
      
      if (response.ok) {
        console.log('Delete successful, updating notes state');
        const updatedNotes = notes.filter(note => note.id !== id);
        console.log('Updated notes after delete:', updatedNotes);
        setNotes(updatedNotes);
      } else {
        console.error('Delete failed with status:', response.status);
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
            const isValid = note && typeof note === 'object';
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