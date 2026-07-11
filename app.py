import os
import re
import secrets
import requests
from flask import (
    Flask, render_template, request, jsonify,
    session, send_from_directory, abort
)
from dotenv import load_dotenv
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

load_dotenv()  # reads variables from your .env file

app = Flask(__name__)

# =========================================================
# REQUIRED ENV VARS (set these in your .env file — never
# hardcode them, and never commit .env to git):
#
#   SECRET_KEY          = a long random string, used to sign
#                          session cookies. Generate one with:
#                          python -c "import secrets; print(secrets.token_hex(32))"
#   PROJECTS_PASSCODE    = the real passcode for the Projects
#                          section. Pick something long and
#                          random, not "2026" — short/guessable
#                          codes defeat the rate limiting.
#   RESEND_API_KEY       = API key from Resend (Dashboard > API Keys)
#   RESEND_FROM_EMAIL    = sender address (use 'onboarding@resend.dev'
#                          until your own domain is verified)
#   CONTACT_TO_EMAIL     = where contact form messages are delivered
#   FLASK_DEBUG          = '1' to enable debug mode locally only.
#                          Leave unset (or '0') anywhere this app
#                          is exposed publicly.
# =========================================================

app.secret_key = os.environ.get('SECRET_KEY')
if not app.secret_key:
    raise RuntimeError(
        'SECRET_KEY environment variable is required. '
        'Generate one with: python -c "import secrets; print(secrets.token_hex(32))"'
    )

PROJECTS_PASSCODE = os.environ.get('PROJECTS_PASSCODE')
if not PROJECTS_PASSCODE:
    raise RuntimeError('PROJECTS_PASSCODE environment variable is required.')

# Session cookie hardening. Set SESSION_COOKIE_SECURE to True once the
# site is served over HTTPS (it must be True in production).
app.config.update(
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE='Lax',
    SESSION_COOKIE_SECURE=os.environ.get('FLASK_ENV') == 'production',
)

limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["50 per hour"]
)

RESEND_API_KEY = os.environ.get('RESEND_API_KEY')
RESEND_FROM_EMAIL = os.environ.get('RESEND_FROM_EMAIL', 'onboarding@resend.dev')
CONTACT_TO_EMAIL = os.environ.get('CONTACT_TO_EMAIL')

EMAIL_RE = re.compile(r'^[^@\s]+@[^@\s]+\.[^@\s]+$')

NAME_MAX_LEN = 200
MESSAGE_MAX_LEN = 5000

# Images for the confidential Projects section live OUTSIDE the
# /static folder so they can never be requested directly by URL —
# they are only served through the protected_image route below,
# which checks the session first.
PROTECTED_IMAGES_DIR = os.path.join(app.root_path, 'protected_images')


@app.route('/')
def home():
    return render_template('index.html')


# =========================================================
# CONTACT FORM
# =========================================================
@app.route('/send-message', methods=['POST'])
@limiter.limit("5 per minute")
def send_message():
    data = request.get_json(silent=True) or {}
    name = (data.get('name') or '').strip()
    email = (data.get('email') or '').strip()
    message = (data.get('message') or '').strip()

    if not name or not email or not message:
        return jsonify({'error': 'Missing fields'}), 400

    if not EMAIL_RE.match(email):
        return jsonify({'error': 'Invalid email address'}), 400

    if len(name) > NAME_MAX_LEN:
        return jsonify({'error': 'Name is too long'}), 400

    if len(message) > MESSAGE_MAX_LEN:
        return jsonify({'error': 'Message is too long'}), 400

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


# =========================================================
# PROJECTS SECTION — SERVER-SIDE PASSCODE PROTECTION
# =========================================================

@app.route('/check-passcode', methods=['POST'])
@limiter.limit("5 per minute; 15 per hour")
def check_passcode():
    """
    Verifies the passcode server-side. The real passcode is never
    sent to the browser — only a True/False result. Rate-limited
    per IP to slow down brute-force guessing.
    """
    data = request.get_json(silent=True) or {}
    submitted = (data.get('passcode') or '').strip()

    # Timing-safe comparison so response time can't leak how many
    # characters matched.
    is_correct = secrets.compare_digest(submitted, PROJECTS_PASSCODE)

    if is_correct:
        session['projects_unlocked'] = True
        return jsonify({'success': True}), 200

    return jsonify({'success': False, 'error': 'Incorrect passcode'}), 401


@app.route('/projects-status')
def projects_status():
    """Lets the frontend check, on page load, whether this browser
    session is already unlocked (e.g. after a refresh)."""
    return jsonify({'unlocked': bool(session.get('projects_unlocked'))}), 200


@app.route('/projects-content')
def projects_content():
    """
    Returns the Projects section HTML (cards + modals + image URLs).
    This route — and therefore the confidential project details —
    is only reachable with a valid session. Without it, this data
    never reaches the browser at all, unlike a client-side gate.
    """
    if not session.get('projects_unlocked'):
        abort(403)
    return render_template('_projects.html')


@app.route('/protected/images/<path:filename>')
def protected_image(filename):
    """
    Serves project images only to unlocked sessions. Because these
    files live outside /static, they cannot be requested directly
    by guessing the URL — this route is the only path to them, and
    it checks the session before returning anything.
    """
    if not session.get('projects_unlocked'):
        abort(403)
    return send_from_directory(PROTECTED_IMAGES_DIR, filename)


if __name__ == '__main__':
    debug_mode = os.environ.get('FLASK_DEBUG', '0') == '1'
    app.run(debug=debug_mode)