import http.server, os, sys

PORT = 3000
DIR = "/Users/admin/Downloads/RumbleWords"

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=DIR, **kw)
    def log_message(self, fmt, *args):
        pass

with http.server.HTTPServer(("", PORT), Handler) as s:
    s.serve_forever()
