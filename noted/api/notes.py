from http.server import BaseHTTPRequestHandler
import json
import boto3
from datetime import datetime
import uuid
import os

# Configure DynamoDB
dynamodb = boto3.resource('dynamodb',
    region_name=os.environ.get('AWS_REGION'),
    aws_access_key_id=os.environ.get('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.environ.get('AWS_SECRET_ACCESS_KEY')
)
table = dynamodb.Table('Notes_Table')

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            # Extract the base path and check for the note ID
            path = self.path.strip('/')
           
            
            # If there's a note_id, the path will contain only one element (e.g. 'notes/{id}')
            if path == 'api/notes':
                response = table.scan()
                items = response.get('Items', [])
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(items).encode())

            elif path.startswith('api/notes/'):
                note_id = path.split('/')[-1]
                response = table.get_item(Key={'id': note_id})
                if 'Item' not in response:
                    self.send_error(404, "Note not found")
                    return
                note = response['Item']
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(note).encode())
                
            else:
                self.send_error(404, "Invalid endpoint")
        except Exception as e:
            self.send_error(500, str(e))

    def do_POST(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            body = json.loads(post_data.decode('utf-8'))
            
            note = {
                'id': str(uuid.uuid4()),
                'title': body['title'],
                'body': body['body'],
                'created_at': datetime.utcnow().isoformat(),
                'updated_at': datetime.utcnow().isoformat()
            }
            
            table.put_item(Item=note)
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(note).encode())
        except Exception as e:
            self.send_error(500, str(e))

def do_DELETE(self):
    try:
        # Get the path from the request
        path = self.path.strip('/')

        # If the path is for deleting a note, it should contain '/api/notes/{id}'
        if path.startswith('api/notes/'):
            note_id = path.split('/')[-1]  # Extract the note ID from the path

            if not note_id:
                self.send_error(400, "Note ID is required")
                return

            # Check if the note exists
            response = table.get_item(Key={'id': note_id})
            if 'Item' not in response:
                self.send_error(404, "Note not found")
                return

            # Delete the note
            table.delete_item(Key={'id': note_id})

            # Send success response
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"message": "Note deleted successfully"}).encode())
        
        else:
            self.send_error(404, "Invalid endpoint for deletion")

    except Exception as e:
        self.send_error(500, str(e))
