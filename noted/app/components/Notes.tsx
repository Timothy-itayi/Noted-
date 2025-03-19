'use client';

import { useState, useEffect } from 'react';
import '98.css';

interface Note {
  id?: string;
  title: string;
  body: string;
  created_at?: string;
}

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditing && currentNote) {
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
      const response = await fetch(`/api/notes/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setNotes(notes.filter(note => note.id !== id));
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
      const response = await fetch('/api/notes');
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setNotes(data.filter(note => note.title && note.body)); // Only show notes with content
        } else {
          console.error('Received non-array data:', data);
          setNotes([]);
        }
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  return (
    <div className="window max-w-4xl mx-auto p-4">
      <div className="title-bar">
        <div className="title-bar-text">My Notes</div>
        <div className="title-bar-controls">
          <button aria-label="Minimize"></button>
          <button aria-label="Maximize"></button>
          <button aria-label="Close"></button>
        </div>
      </div>
      <div className="window-body">
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="field-row-stacked mb-4">
            <label htmlFor="title">Title:</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title"
              required
            />
          </div>
          <div className="field-row-stacked mb-4">
            <label htmlFor="body">Content:</label>
            <textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Note content"
              className="h-32"
              required
            />
          </div>
          <div className="field-row">
            <button type="submit">
              {isEditing ? 'Update Note' : 'Add Note'}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setCurrentNote(null);
                  setTitle('');
                  setBody('');
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.isArray(notes) && notes.map((note) => (
            <div key={note.id} className="window" style={{ width: '100%' }}>
              <div className="title-bar">
                <div className="title-bar-text">{note.title}</div>
                <div className="title-bar-controls">
                  <button aria-label="Close" onClick={() => note.id && handleDelete(note.id)}></button>
                </div>
              </div>
              <div className="window-body">
                <p>{note.body}</p>
                <div className="field-row mt-4">
                  <button onClick={() => handleEdit(note)}>Edit</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 