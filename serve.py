"""Serve the included course on the loopback interface for local study."""
from argparse import ArgumentParser
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import sys


class CourseFiles(SimpleHTTPRequestHandler):
    extensions_map = {
        **SimpleHTTPRequestHandler.extensions_map,
        ".mjs": "text/javascript",
        ".json": "application/json",
        ".py": "text/plain; charset=utf-8",
    }


def main():
    parser = ArgumentParser(description="Serve the Local Agent Bus course on 127.0.0.1.")
    parser.add_argument("--port", type=int, default=8765, help="Use 0 for any available port")
    args = parser.parse_args()
    site = Path(__file__).resolve().with_name("dist")
    if not (site / "index.html").is_file():
        parser.exit(1, "dist/index.html is missing. Extract the full course archive first.\n")
    handler = partial(CourseFiles, directory=str(site))
    try:
        server = ThreadingHTTPServer(("127.0.0.1", args.port), handler)
    except OSError as error:
        parser.exit(1, f"Could not start local server: {error}\nTry again with --port 0 if the port is in use.\n")
    with server:
        print(f"Local Agent Bus: http://127.0.0.1:{server.server_port}/", flush=True)
        print("Open that URL in your browser. Press Ctrl+C here to stop.", flush=True)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            print("\nCourse server stopped.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
