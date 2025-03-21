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
            response = table.scan()
            items = response.get('Items', [])
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(items).encode())
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