from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from . import crud  

app = FastAPI()

#
class NoteRequest(BaseModel):
    title: str
    body: str
    created_at: str

class NoteResponse(NoteRequest):
    pass

@app.post("/notes/", response_model=NoteResponse)
async def create_note(note: NoteRequest):
    try:
        response = crud.create_note(note)
        return response['ResponseMetadata']  
    except HTTPException as e:
        raise e

@app.get("/notes/{title}", response_model=NoteResponse)
async def get_note(title: str):
    note = crud.get_note(title)
    if note:
        return note
    else:
        raise HTTPException(status_code=404, detail="Note not found")

@app.put("/notes/{title}", response_model=NoteResponse)
async def update_note(title: str, note: NoteRequest):
    try:
        response = crud.update_note(title, note)
        return response['Attributes']  # Or return custom response as needed
    except HTTPException as e:
        raise e

@app.delete("/notes/{title}", response_model=dict)
async def delete_note(title: str):
    try:
        response = crud.delete_note(title)
        return {"message": "Note deleted successfully"}
    except HTTPException as e:
        raise e
