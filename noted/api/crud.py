import boto3
from botocore.exceptions import ClientError
from fastapi import HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import time
import uuid
import random

# Initialize DynamoDB resource
dynamodb = boto3.resource('dynamodb', region_name='ap-southeast-2') 
table = dynamodb.Table('Notes_Table')

# Custom epoch (you can adjust this)
CUSTOM_EPOCH = 1709251200000  

def generate_note_id():
    """Generate a unique ID using timestamp, random number, and UUID"""
    # Get current timestamp in milliseconds
    ts = int(time.time() * 1000) - CUSTOM_EPOCH
    
    # Generate a random number between 0 and 999
    random_num = random.randint(0, 999)
    
    # Generate a short UUID (first 8 chars of UUID4)
    short_uuid = str(uuid.uuid4())[:8]
    
    # Combine timestamp, random number, and short UUID
    note_id = f"{ts:013d}{random_num:03d}-{short_uuid}"
    
    return note_id

class Note(BaseModel):
    id: Optional[str] = None
    title: str
    body: str
    created_at: Optional[str] = None



def create_note(note: Note):
    try:
        # Generate a new ID
        note_id = generate_note_id()
        print(f"Generated ID: {note_id}")  # Debug log
        
        created_at = datetime.now().isoformat()
        
        # Create the item with all required fields
        item = {
            'id': note_id,  # This is the partition key
            'title': note.title,  # Remove any extra whitespace
            'body': note.body,    
            'created_at': created_at
        }
        
        print(f"Item to be inserted: {item}")  # Debug log
        
        # Validate that required fields are not empty
        if not item['title'] or not item['body']:
            raise HTTPException(status_code=400, detail="Title and body cannot be empty")
        
        # Ensure id is present and not empty
        if not item['id']:
            raise HTTPException(status_code=500, detail="Failed to generate note ID")
        
        # Insert the note into DynamoDB
        try:
            response = table.put_item(
                Item=item,
                ConditionExpression='attribute_not_exists(id)'
            )
            print(f"DynamoDB response: {response}")  # Debug log
        except ClientError as e:
            print(f"DynamoDB error details: {e.response}")  # Debug log
            raise
        
        # Return the created item
        return {
            'id': item['id'],
            'title': item['title'],
            'body': item['body'],
            'created_at': item['created_at']
        }
    except ClientError as e:
        error_code = e.response['Error']['Code']
        if error_code == 'ConditionalCheckFailedException':
            raise HTTPException(status_code=409, detail="Note with this ID already exists")
        raise HTTPException(status_code=500, detail=f"Error creating note: {str(e)}")

def get_note(note_id: str) -> Optional[Note]:
    try:
        response = table.get_item(Key={'id': note_id})
        if 'Item' in response:
            print(f"Note found: {response['Item']}")  # Debug log
            return Note(**response['Item'])
        else:
            print(f"No note found with ID: {note_id}")  # Debug log
            return None
    except ClientError as e:
        print(f"Error retrieving note: {e}")  # Debug log
        raise HTTPException(status_code=500, detail=f"Error retrieving note: {e}")

def get_all_notes() -> List[Note]:
    try:
        response = table.scan()
        items = response.get('Items', [])

        notes = []
        for item in items:
           
            note_data = {
                'id': item.get('id', ''),
                'title': item.get('title', ''),
                'body': item.get('body', ''),
                'created_at': item.get('created_at', '')
            }
            notes.append(Note(**note_data))
        return notes
    except ClientError as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving notes: {e}")

def update_note(note_id: str, note_data: dict):
    try:
        response = table.update_item(
            Key={'id': note_id},
            UpdateExpression="set title = :t, body = :b, updated_at = :u",
            ExpressionAttributeValues={
                ':t': note_data['title'],
                ':b': note_data['body'],
                ':u': datetime.utcnow().isoformat()
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
