#!/usr/bin/env python3
"""
Simple HTTP Server untuk menjalankan aplikasi PWA
Jalankan dengan: python3 server.py
"""

import http.server
import socketserver
import os

PORT = 8000

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add headers untuk PWA dan CORS
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

def run_server():
    Handler = MyHTTPRequestHandler
    
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print("=" * 60)
        print("🚀 SERVER BERJALAN!")
        print("=" * 60)
        print(f"📱 Buka browser dan akses:")
        print(f"   http://localhost:{PORT}")
        print(f"   http://127.0.0.1:{PORT}")
        print("")
        print("⚠️  Untuk fitur kamera, gunakan:")
        print("   - Localhost (sudah aman)")
        print("   - Atau deploy ke HTTPS")
        print("")
        print("🛑 Tekan CTRL+C untuk stop server")
        print("=" * 60)
        print("")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n✓ Server dihentikan")
            httpd.shutdown()

if __name__ == "__main__":
    run_server()