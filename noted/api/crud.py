import boto3
from botocore.exceptions import ClientError
from fastapi import HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime , timezone

import uuid


# Initialize DynamoDB resource
dynamodb = boto3.resource('dynamodb', region_name='ap-southeast-2') 
table = dynamodb.Table('Notes_Table')

def generate_note_id():
    """Generate a unique ID using UUID4"""
    note_id = str(uuid.uuid4())  # Generate a valid UUID
    return note_id

class Note(BaseModel):
    id: Optional[str] = None
    title: str
    body: str
    created_at: Optional[str] = None



def create_note(note: Note):
    try:
        # Generate a new unique ID for the note
        note_id = generate_note_id()
        print(f"Generated ID: {note_id}")  # Debug log

        # Get the current timestamp for creation
        created_at = datetime.now(timezone.utc).isoformat()

        # Create the item with all required fields
        item = {
            'id': note_id,  # Partition key for DynamoDB
            'title': note.title.strip(),  # Remove extra whitespace from title
            'body': note.body.strip(),   # Remove extra whitespace from body
            'created_at': created_at,
            'updated_at': created_at  # Set updated_at to match created_at initially
        }

        print(f"Item to be inserted: {item}")  # Debug log

        # Validate that required fields are not empty
        if not item['title'] or not item['body']:
            print("Validation failed: Title and body cannot be empty.")  # Debug log
            raise HTTPException(status_code=400, detail="Title and body cannot be empty")

        # Ensure ID is present and valid (shouldn't happen, but extra safety)
        if not item['id']:
            print("Validation failed: Failed to generate note ID.")  # Debug log
            raise HTTPException(status_code=500, detail="Failed to generate note ID")

        # Insert the note into DynamoDB
        try:
            response = table.put_item(Item=item)
            print(f"DynamoDB response: {response}")  # Debug log

            # Check if the response indicates success (optional validation)
            if response['ResponseMetadata']['HTTPStatusCode'] != 200:
                print("DynamoDB put_item failed.")  # Debug log
                raise HTTPException(status_code=500, detail="Failed to save note in database")
        
        except ClientError as e:
            error_code = e.response['Error']['Code']
            print(f"DynamoDB ClientError: {error_code} - {str(e)}")  # Debug log

            if error_code == 'ConditionalCheckFailedException':
                raise HTTPException(status_code=409, detail="Note with this ID already exists")
            
            raise HTTPException(status_code=500, detail=f"Error creating note: {str(e)}")

        # Return the created item as a response
        return {
            'id': item['id'],
            'title': item['title'],
            'body': item['body'],
            'created_at': item['created_at'],
            'updated_at': item['updated_at']
        }
    
    except HTTPException as http_exc:
        print(f"HTTPException: {http_exc.detail}")  # Debug log
        raise http_exc

    except Exception as e:
        print(f"Unexpected error in create_note: {str(e)}")  # Debug log
        raise HTTPException(status_code=500, detail=f"Unexpected error creating note: {str(e)}")

def get_note(note_id: str) -> Optional[Note]:
    if not note_id or not isinstance(note_id, str):
        raise HTTPException(status_code=400, detail="Invalid note ID")

    try:
        response = table.get_item(Key={'id': note_id})
        
        if 'Item' in response:
            return Note(**response['Item'])
         
        else:
            raise HTTPException(status_code=404, detail=f"No note found with ID: {note_id}")
    except ClientError as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving note: {e}")


def get_all_notes() -> List[Note]:
    try:
        response = table.scan()
        items = response.get('Items', [])
        
        if not items:
            print("No notes found in the database.")
            return []

        notes = [Note(**item) for item in items]
        return notes
    except ClientError as e:
        print(f"Error retrieving notes: {e}")
        raise HTTPException(status_code=500, detail=f"Error retrieving notes: {e}")

def update_note(note_id: str, note_data: dict):
    try:
        response = table.update_item(
            Key={'id': note_id},
            UpdateExpression="set title = :t, body = :b, updated_at = :u",
            ExpressionAttributeValues={
                ':t': note_data['title'],
                ':b': note_data['body'],
                ':u': datetime.now(timezone.utc).isoformat()
            },
            ReturnValues="ALL_NEW"
        )
        return response
    except ClientError as e:
        raise HTTPException(status_code=500, detail=f"Error updating note: {e}")
    

def delete_note(note_id: str):
    try:
        # Validate note_id
        if not note_id or not isinstance(note_id, str):
            raise HTTPException(status_code=400, detail="Invalid note ID")
        
        # First, check if the note exists
        existing_note = get_note(note_id)
        if not existing_note:
            raise HTTPException(status_code=404, detail="Note not found")
        
        print(f"Attempting to delete note with ID: {note_id}")  # Debug log
        
        # Delete the note from DynamoDB
        response = table.delete_item(
            Key={'id': note_id},
            ReturnValues="ALL_OLD"  # Return the deleted item
        )
        
        print(f"Delete response: {response}")  # Debug log
        
        # Check if the deletion was successful (Attributes contains the deleted item)
        if 'Attributes' not in response:
            raise HTTPException(status_code=500, detail="Failed to delete note")
        
        deleted_note = response['Attributes']
        return {"message": "Note deleted successfully", "deleted_note": deleted_note}
        
    except ClientError as e:
        error_code = e.response['Error']['Code']
        print(f"DynamoDB error: {error_code} - {str(e)}")  # Debug log
        raise HTTPException(status_code=500, detail=f"Error deleting note: {str(e)}")
    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected error in delete_note: {str(e)}")  # Debug log
        raise HTTPException(status_code=500, detail=f"Unexpected error deleting note: {str(e)}")
