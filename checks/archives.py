"""Copy and package the exact Python lesson sources used by the website."""
from pathlib import Path
import zipfile

root = Path(__file__).resolve().parents[1]
for id in ("m01-l01", "m01-l02", "m01-l03", "l01"):
    site = root / "dist" / "downloads" / id
    site.mkdir(parents=True, exist_ok=True)
    names = ["README.md", "a.py", "b.py"]
    if id == "l01":
        names.append("verify.py")
    for version in ("starter", "solution"):
        example = root / "examples" / id / version
        raw = site / version
        raw.mkdir(exist_ok=True)
        with zipfile.ZipFile(site / (version + ".zip"), "w", compression=zipfile.ZIP_DEFLATED) as archive:
            for name in names:
                data = (example / name).read_bytes()
                (raw / name).write_bytes(data)
                entry = zipfile.ZipInfo(name, date_time=(2026, 11, 24, 0, 0, 0))
                entry.external_attr = 0o644 << 16
                archive.writestr(entry, data, compress_type=zipfile.ZIP_DEFLATED)
print("Packaged 8 versioned lab ZIPs from their matching sources.")
