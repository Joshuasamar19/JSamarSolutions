import os
import requests
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv

load_dotenv()  # reads variables from your .env file

app = Flask(__name__)

# Set these as environment variables — never hardcode them in the file.
# RESEND_API_KEY = the API key from Resend (Dashboard > API Keys)
# RESEND_FROM_EMAIL = the sender address (use 'onboarding@resend.dev' until
#                      your own domain is verified in Resend)
# CONTACT_TO_EMAIL = where you want messages delivered (usually your own inbox)
RESEND_API_KEY = os.environ.get('RESEND_API_KEY')
RESEND_FROM_EMAIL = os.environ.get('RESEND_FROM_EMAIL', 'onboarding@resend.dev')
CONTACT_TO_EMAIL = os.environ.get('CONTACT_TO_EMAIL')


@app.route('/')
def home():
    return render_template('index.html')


@app.route('/send-message', methods=['POST'])
def send_message():
    data = request.get_json(silent=True) or {}
    name = (data.get('name') or '').strip()
    email = (data.get('email') or '').strip()
    message = (data.get('message') or '').strip()

    if not name or not email or not message:
        return jsonify({'error': 'Missing fields'}), 400

    if not RESEND_API_KEY or not CONTACT_TO_EMAIL:
        return jsonify({'error': 'Email is not configured on the server'}), 500

    body = f"New message from your portfolio contact form:\n\nName: {name}\nEmail: {email}\n\nMessage:\n{message}"

    payload = {
        "from": f"Portfolio Site <{RESEND_FROM_EMAIL}>",
        "to": [CONTACT_TO_EMAIL],
        "reply_to": email,
        "subject": f"Portfolio contact from {name}",
        "text": body
    }

    try:
        response = requests.post(
            "https://api.resend.com/emails",
            headers={
                "Authorization": f"Bearer {RESEND_API_KEY}",
                "Content-Type": "application/json"
            },
            json=payload,
            timeout=10
        )
        if response.status_code not in (200, 201):
            print('Resend error:', response.status_code, response.text)
            return jsonify({'error': 'Failed to send message'}), 500
    except Exception as e:
        print('Email send failed:', e)
        return jsonify({'error': 'Failed to send message'}), 500

    return jsonify({'success': True}), 200


if __name__ == '__main__':
    app.run(debug=True)