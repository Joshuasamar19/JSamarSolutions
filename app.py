import os
import smtplib
from email.mime.text import MIMEText
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# Set these two as environment variables — never hardcode them in the file.
# GMAIL_USER = the Gmail address you want to send FROM and receive at
# GMAIL_APP_PASSWORD = the 16-character App Password from Google (not your normal password)
GMAIL_USER = os.environ.get('GMAIL_USER')
GMAIL_APP_PASSWORD = os.environ.get('GMAIL_APP_PASSWORD')


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

    if not GMAIL_USER or not GMAIL_APP_PASSWORD:
        return jsonify({'error': 'Email is not configured on the server'}), 500

    body = f"New message from your portfolio contact form:\n\nName: {name}\nEmail: {email}\n\nMessage:\n{message}"
    msg = MIMEText(body)
    msg['Subject'] = f'Portfolio contact from {name}'
    msg['From'] = GMAIL_USER
    msg['To'] = GMAIL_USER
    msg['Reply-To'] = email

    try:
        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.starttls()
            server.login(GMAIL_USER, GMAIL_APP_PASSWORD)
            server.sendmail(GMAIL_USER, [GMAIL_USER], msg.as_string())
    except Exception as e:
        print('Email send failed:', e)
        return jsonify({'error': 'Failed to send message'}), 500

    return jsonify({'success': True}), 200


if __name__ == '__main__':
    app.run(debug=True)