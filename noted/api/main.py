from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from . import crud  
import json


app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)


class NoteRequest(BaseModel):
  
    title: str
    body: str
 

class NoteResponse(NoteRequest):
 
   id: str
   created_at: str

# Root endpoint
@app.get("/")
def read_root():
    try:
        notes = crud.get_all_notes()
        return {"message": "Notes API", "notes": notes}
    except HTTPException as e:
        raise e

# List notes
@app.get("/notes/")
def read_notes():
    try:
        notes = crud.get_all_notes()
        return notes
    except HTTPException as e:
        raise e

# Create a new note
@app.post("/notes/", response_model=NoteResponse)
async def create_note(note: NoteRequest):
    try:
        # Let the backend handle the created_at generation
        note_data = crud.create_note(note)
        return note_data
    except HTTPException as e:
        raise e


# GET /api/notes/{note_id} - Fetch a specific note by ID
@app.get("/notes/{note_id}", response_model=NoteResponse)
async def get_note(note_id: str):
    try:
        # Fetch the note from the database using the ID
        note = crud.get_note(note_id)
        if not note:
            raise HTTPException(status_code=404, detail="Note not found")
        return note
    except HTTPException as e:
        raise e


# Update a note
@app.put("/notes/{note_id}", response_model=NoteResponse)
async def update_note(note_id: str, note: NoteRequest):
    try:
        note_data = note.dict()
        response = crud.update_note(note_id, note_data)
        return response['Attributes']  
    except HTTPException as e:
        raise e

# Delete a note
@app.delete("/notes/{note_id}")
async def delete_note(note_id: str):
    try:
        response = crud.delete_note(note_id)
        return {"message": "Note deleted successfully", "deleted_note": response.get('deleted_note')}
    except HTTPException as e:
        raise e

# Serverless handler
def handler(event, context):
    """Handle AWS Lambda events"""
    print(f"Received event: {json.dumps(event)}")
    
    # Extract HTTP method and path
    http_method = event.get('httpMethod', '')
    path = event.get('path', '')
    
    # Handle different HTTP methods
    if http_method == 'DELETE' and path.startswith('/notes/'):
        note_id = path.split('/')[-1]
        try:
            response = crud.delete_note(note_id)
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'message': 'Note deleted successfully',
                    'deleted_note': response.get('deleted_note')
                })
            }
        except HTTPException as e:
            return {
                'statusCode': e.status_code,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': str(e.detail)})
            }
    
    # Add handlers for other methods as needed
    return {
        'statusCode': 404,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'error': 'Not found'})
    }
