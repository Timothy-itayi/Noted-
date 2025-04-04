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
        //  Update note
        const response = await fetch(`/api/notes/${currentNote.id}`, { 
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, body }), 
        });
        
  
        if (response.ok) {
          await fetchNotes(); //  Refresh list
          setIsEditing(false);
          setCurrentNote(null);
          setTitle('');
          setBody('');
        } else {
          console.error('Update failed:', await response.json());
        }
      } else {
        //  Create new note
        const response = await fetch('/api/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, body }),
        });
  
        if (response.ok) {
          await fetchNotes(); //  Refresh list
          setTitle('');
          setBody('');
        } else {
          console.error('Create failed:', await response.json());
        }
      }
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };
  

  const handleDelete = async (id: string) => {
    try {
      if (!id) {
        console.error('Cannot delete note: Invalid ID');
        return;
      }
  
      
      const response = await fetch(`/api/notes/${id}`, {
        method: 'DELETE',
      });
  
      const data = await response.json(); 
  
      if (response.ok) {
        console.log('Delete successful:', data);
        setNotes(prevNotes => prevNotes.filter(note => note.id !== id)); // Update the UI
      } else {
        console.error('Delete failed:', data.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Error deleting note:', error);
   
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