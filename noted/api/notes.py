from http.server import BaseHTTPRequestHandler
import json
import boto3
from datetime import datetime

import os

from crud import generate_note_id

# Configure DynamoDB
dynamodb = boto3.resource('dynamodb',
    region_name=os.environ.get('AWS_REGION'),
    aws_access_key_id=os.environ.get('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.environ.get('AWS_SECRET_ACCESS_KEY')
    
    
)
    # Validate AWS environment variables
aws_region = os.environ.get('AWS_REGION')
aws_access_key = os.environ.get('AWS_ACCESS_KEY_ID')
aws_secret_key = os.environ.get('AWS_SECRET_ACCESS_KEY')

if not aws_region or not aws_access_key or not aws_secret_key:
    print("WARNING: Missing AWS credentials environment variables")
    print(f"AWS_REGION: {'SET' if aws_region else 'NOT SET'}")
    print(f"AWS_ACCESS_KEY_ID: {'SET' if aws_access_key else 'NOT SET'}")
    print(f"AWS_SECRET_ACCESS_KEY: {'SET' if aws_secret_key else 'NOT SET'}")
table = dynamodb.Table('Notes_Table')

class handler(BaseHTTPRequestHandler):

    def do_GET(self):
        try:
            path = self.path.strip('/')
            
            if path == 'api/notes':
                response = table.scan()
                items = response.get('Items', [])
                
                # Return empty list if no items found
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(items).encode())
            
            elif path.startswith('api/notes/'):
                note_id = path.split('/')[-1]
                response = table.get_item(Key={'id': note_id})
                
                if 'Item' not in response:
                    self.send_error(404, json.dumps({"error": "Note not found"}))
                    return

                note = response['Item']
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(note).encode())
            
            else:
                self.send_error(404, json.dumps({"error": "Invalid endpoint"}))
        except Exception as e:
            print(f"Error in do_GET: {str(e)}")
            self.send_error(500, json.dumps({"error": str(e)}))



    def do_POST(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            body = json.loads(post_data.decode('utf-8'))

            note_id = generate_note_id()
            
            note = {
                'id': note_id,
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
            path = self.path.strip('/')
            if path.startswith('api/notes/'):
                note_id = path.split('/')[-1]
                if not note_id:
                    self.send_error(400, "Note ID is required")
                    return

                response = table.get_item(Key={'id': note_id})
                if 'Item' not in response:
                    self.send_error(404, "Note not found")
                    return

                table.delete_item(Key={'id': note_id})

                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"message": "Note deleted successfully"}).encode())
            
            else:
                self.send_error(404, "Invalid endpoint for deletion")

        except Exception as e:
            self.send_error(500, str(e))

    def do_OPTIONS(self):
        """Handle preflight CORS requests."""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
