import boto3
from botocore.exceptions import ClientError
from fastapi import HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import time
import random

# Initialize DynamoDB resource
dynamodb = boto3.resource('dynamodb', region_name='ap-southeast-2') 
table = dynamodb.Table('Notes')

# Custom epoch (you can adjust this)
CUSTOM_EPOCH = 1709251200000  

def generate_note_id():
    """Generate a unique ID using timestamp and random number"""
    # Get current timestamp in milliseconds
    ts = int(time.time() * 1000) - CUSTOM_EPOCH
    
    # Generate a random number between 0 and 999
    random_num = random.randint(0, 999)
    
    # Combine timestamp and random number
    # Format: timestamp (left-padded with zeros) + random number
    note_id = f"{ts:013d}{random_num:03d}"
    
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
            'id ': note_id,  # This is the partition key
            'title': note.title,  # Remove any extra whitespace
            'body': note.body,    
            'created_at': created_at
        }
        
        print(f"Item to be inserted: {item}")  # Debug log
        
        # Validate that required fields are not empty
        if not item['title'] or not item['body']:
            raise HTTPException(status_code=400, detail="Title and body cannot be empty")
        
        # Ensure id is present and not empty
        if not item['id ']:
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
            'id ': item['id '],
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
        response = table.get_item(Key={'id ': note_id})
        if 'Item' in response:
            return Note(**response['Item'])
        else:
            return None
    except ClientError as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving note: {e}")

def get_all_notes() -> List[Note]:
    try:
        response = table.scan()
        items = response.get('Items', [])

        notes = []
        for item in items:
           
            note_data = {
                'id': item.get('id ', ''),
                'title': item.get('title', ''),
                'body': item.get('body', ''),
                'created_at': item.get('created_at', '')
            }
            notes.append(Note(**note_data))
        return notes
    except ClientError as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving notes: {e}")

def update_note(note_id: str, note: Note):
    try:
        response = table.update_item(
            Key={'id ': note_id},
            UpdateExpression="set title = :t, body = :b",
            ExpressionAttributeValues={
                ':t': note.title,
                ':b': note.body,
            },
            ReturnValues="UPDATED_NEW"
        )
        return response
    except ClientError as e:
        raise HTTPException(status_code=500, detail=f"Error updating note: {e}")


def delete_note(note_id: str):
    try:
        response = table.delete_item(Key={'id ': note_id})
        return response
    except ClientError as e:
        raise HTTPException(status_code=500, detail=f"Error deleting note: {e}")
