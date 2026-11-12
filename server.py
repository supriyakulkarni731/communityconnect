"""
Community Connect+ — Local Development Server
Runs on http://localhost:5500/
"""

import http.server
import socketserver
import os
import sys
import webbrowser

PORT = 5500
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class CommunityConnectHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Enable proper referrer headers for OpenStreetMap tile usage policy compliance
        self.send_header('Referrer-Policy', 'strict-origin-when-cross-origin')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-cache, must-revalidate')
        super().end_headers()

def run_server():
    os.chdir(DIRECTORY)
    port = PORT
    server = None
    
    # Try preferred port 5500, then fallback to 5501-5510 if busy
    for p in range(PORT, PORT + 10):
        try:
            socketserver.TCPServer.allow_reuse_address = True
            server = socketserver.TCPServer(("", p), CommunityConnectHandler)
            port = p
            break
        except OSError:
            continue

    if not server:
        print(f"Error: Could not bind to any port from {PORT} to {PORT + 10}.")
        sys.exit(1)

    print("=" * 65)
    print("  🌍 Community Connect+ Local Development Server")
    print("=" * 65)
    print(f"  Server root: {DIRECTORY}")
    print(f"  Local URL:   http://localhost:{port}/")
    print(f"  Care Map:    http://localhost:{port}/care-map.html")
    print(f"  Admin:       http://localhost:{port}/admin.html")
    print("=" * 65)
    print("  Press Ctrl+C to stop the server at any time.")
    print("=" * 65)

    try:
        # Open the Care Map page in user's default browser
        webbrowser.open(f"http://localhost:{port}/care-map.html")
    except Exception:
        pass

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped gracefully.")
        server.server_close()

if __name__ == "__main__":
    run_server()

