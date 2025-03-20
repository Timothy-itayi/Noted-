'use client';

import '98.css';
import { useNotes } from './useNotes';

export default function Notes() {
  const {
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
  } = useNotes();

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
                
                </div>
              </div>
              <div className="window-body">
                <p>{note.body}</p>
                <div className="field-row mt-4">
                  <button onClick={() => handleEdit(note)}>Edit</button> 
                 <button  onClick={() => handleDelete(note.id)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 