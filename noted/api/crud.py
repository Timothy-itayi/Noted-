import boto3
from botocore.exceptions import ClientError
from fastapi import HTTPException
from pydantic import BaseModel
from typing import List, Optional


dynamodb = boto3.resource('dynamodb', region_name='ap-southeast-2')  # Specify the region if needed
table = dynamodb.Table('Notes')  

class Note(BaseModel):
    title: str
    body: str
    created_at: str

def create_note(note: Note):
    try:
        response = table.put_item(
            Item={
                'title': note.title,
                'body': note.body,
                'created_at': note.created_at
            }
        )
        return response
    except ClientError as e:
        raise HTTPException(status_code=500, detail=f"Error creating note: {e}")

def get_note(title: str) -> Optional[Note]:
    try:
        response = table.get_item(Key={'title': title})
        if 'Item' in response:
            return Note(**response['Item'])
        else:
            return None
    except ClientError as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving note: {e}")

def update_note(title: str, note: Note):
    try:
        response = table.update_item(
            Key={'title': title},
            UpdateExpression="set body = :b, created_at = :c",
            ExpressionAttributeValues={
                ':b': note.body,
                ':c': note.created_at
            },
            ReturnValues="UPDATED_NEW"
        )
        return response
    except ClientError as e:
        raise HTTPException(status_code=500, detail=f"Error updating note: {e}")

def delete_note(title: str):
    try:
        response = table.delete_item(Key={'title': title})
        return response
    except ClientError as e:
        raise HTTPException(status_code=500, detail=f"Error deleting note: {e}")
