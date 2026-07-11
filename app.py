import os
import requests
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# Set these as environment variables — never hardcode them in the file.
# SENDGRID_API_KEY = the API key from SendGrid (Settings > API Keys)
# SENDGRID_FROM_EMAIL = the email you verified in SendGrid (Single Sender Verification)
# CONTACT_TO_EMAIL = where you want messages delivered (usually your own inbox)
SENDGRID_API_KEY = os.environ.get('SENDGRID_API_KEY')
SENDGRID_FROM_EMAIL = os.environ.get('SENDGRID_FROM_EMAIL')
CONTACT_TO_EMAIL = os.environ.get('CONTACT_TO_EMAIL', SENDGRID_FROM_EMAIL)


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

    if not SENDGRID_API_KEY or not SENDGRID_FROM_EMAIL:
        return jsonify({'error': 'Email is not configured on the server'}), 500

    body = f"New message from your portfolio contact form:\n\nName: {name}\nEmail: {email}\n\nMessage:\n{message}"

    payload = {
        "personalizations": [{
            "to": [{"email": CONTACT_TO_EMAIL}],
            "subject": f"Portfolio contact from {name}"
        }],
        "from": {"email": SENDGRID_FROM_EMAIL},
        "reply_to": {"email": email},
        "content": [{"type": "text/plain", "value": body}]
    }

    try:
        response = requests.post(
            "https://api.sendgrid.com/v3/mail/send",
            headers={
                "Authorization": f"Bearer {SENDGRID_API_KEY}",
                "Content-Type": "application/json"
            },
            json=payload,
            timeout=10
        )
        if response.status_code not in (200, 202):
            print('SendGrid error:', response.status_code, response.text)
            return jsonify({'error': 'Failed to send message'}), 500
    except Exception as e:
        print('Email send failed:', e)
        return jsonify({'error': 'Failed to send message'}), 500

    return jsonify({'success': True}), 200


if __name__ == '__main__':
    app.run(debug=True)