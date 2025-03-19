from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from . import crud  


app = FastAPI()


class NoteRequest(BaseModel):
  
    title: str
    body: str
 

class NoteResponse(NoteRequest):
 
   title: str
   body: str
   created_at: str

# Root endpoint
@app.get("/")
def read_root():
    return {"message": "Notes of notes"}

# List notes
@app.get("/notes/")
def read_notes():
    return {"message": "List of notes"}

# Create a new note
@app.post("/notes/", response_model=NoteResponse)
async def create_note(note: NoteRequest):
    try:
        # Let the backend handle the created_at generation
        note_data = crud.create_note(note)
        return note_data
    except HTTPException as e:
        raise e
# Get a specific note by title
@app.get("/notes/{title}", response_model=NoteResponse)
async def get_note(title: str):
    note = crud.get_note(title)
    if note:
        return note
    else:
        raise HTTPException(status_code=404, detail="Note not found")

# Update a note
@app.put("/notes/{title}", response_model=NoteResponse)
async def update_note(title: str, note: NoteRequest):
    try:
        note_data = note.dict()
        response = crud.update_note(title, note_data)
        return response['Attributes']  
    except HTTPException as e:
        raise e

# Delete a note
@app.delete("/notes/{title}", response_model=dict)
async def delete_note(title: str):
    try:
        response = crud.delete_note(title)
        return {"message": "Note deleted successfully"}
    except HTTPException as e:
        raise e
