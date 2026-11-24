"""Check static HTML route and fragment integrity, including published-state controls."""
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit


root = Path(__file__).resolve().parents[1] / "dist"


class Page(HTMLParser):
    def __init__(self, file):
        super().__init__(convert_charrefs=True)
        self.ids = Counter()
        self.links = []
        self.lesson = None
        self.sim = 0
        self.quizzes = 0
        self.downloads = 0
        self.feed(file.read_text(encoding="utf-8"))

    def handle_starttag(self, tag, attrs):
        props = dict(attrs)
        if "id" in props:
            self.ids[props["id"]] += 1
        if tag == "body":
            self.lesson = props.get("data-lesson")
        self.sim += "data-sim" in props
        self.quizzes += props.get("data-quiz") == "quiz"
        for key in ("href", "src", "action"):
            if key in props:
                self.links.append(props[key])
        if "download" in props:
            self.downloads += 1


pages = {file: Page(file) for file in root.rglob("*.html")}
assert len(pages) == 75
links = 0
for file, page in pages.items():
    assert all(count == 1 for count in page.ids.values()), (file, page.ids)
    for target in page.links:
        url = urlsplit(target)
        if url.scheme or url.netloc:
            continue
        assert not url.path.startswith("/"), (file, target)
        path = (file.parent / url.path).resolve() if url.path else file
        assert path.is_relative_to(root), (file, target)
        if path.is_dir():
            path = path / "index.html"
        assert path.is_file(), (file, target)
        if url.fragment and path in pages:
            assert url.fragment in pages[path].ids, (file, target, url.fragment)
        links += 1
    if file.parent.parent.name == "lessons":
        live = file.parent.name.startswith("m01-")
        assert (page.lesson == file.parent.name) == live
        assert page.sim == int(live)
        assert page.quizzes == int(live)
        assert bool(page.downloads) == live
print(f"W1 PASS — {len(pages)} pages, {links} internal links/assets/forms, unique fragment IDs, and published-state checks.")
