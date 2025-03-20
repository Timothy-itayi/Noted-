from http.server import BaseHTTPRequestHandler
import json
import boto3
from datetime import datetime
import os

# Configure DynamoDB
dynamodb = boto3.resource('dynamodb',
    region_name=os.environ.get('AWS_REGION'),
    aws_access_key_id=os.environ.get('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.environ.get('AWS_SECRET_ACCESS_KEY')
)
table = dynamodb.Table('Notes')

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            note_id = self.path.split('/')[-1]
            response = table.get_item(Key={'id ': note_id})
            
            if 'Item' not in response:
                self.send_error(404, 'Note not found')
                return
                
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(response['Item']).encode())
        except Exception as e:
            self.send_error(500, str(e))

    def do_PUT(self):
        try:
            note_id = self.path.split('/')[-1]
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            body = json.loads(post_data.decode('utf-8'))
            
            # Check if note exists
            response = table.get_item(Key={'id ': note_id})
            if 'Item' not in response:
                self.send_error(404, 'Note not found')
                return
            
            # Update note
            update_expression = 'SET title = :title, body = :body, updated_at = :updated_at'
            expression_values = {
                ':title': body['title'],
                ':body': body['body'],
                ':updated_at': datetime.utcnow().isoformat()
            }
            
            table.update_item(
                Key={'id ': note_id},
                UpdateExpression=update_expression,
                ExpressionAttributeValues=expression_values,
                ReturnValues='ALL_NEW'
            )
            
            updated_note = table.get_item(Key={'id ': note_id})['Item']
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(updated_note).encode())
        except Exception as e:
            self.send_error(500, str(e))

    def do_DELETE(self):
        try:
            note_id = self.path.split('/')[-1]
            
            # Check if note exists
            response = table.get_item(Key={'id ': note_id})
            if 'Item' not in response:
                self.send_error(404, 'Note not found')
                return
            
            # Delete note
            table.delete_item(Key={'id ': note_id})
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'success': True}).encode())
        except Exception as e:
            self.send_error(500, str(e)) 