from PIL import Image, ImageDraw

def make_icon(size, path):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    bg = (10, 12, 16, 255)
    orange = (255, 106, 0, 255)
    cyan = (0, 229, 255, 255)

    pad = max(1, size // 16)
    d.rounded_rectangle([0, 0, size - 1, size - 1], radius=size // 5, fill=bg)

    # cyan running track arc (bottom)
    track_w = max(1, size // 9)
    d.arc([pad, pad, size - 1 - pad, size - 1 - pad], start=20, end=160, fill=cyan, width=track_w)

    # orange lightning/run bolt through the middle
    cx, cy = size / 2, size / 2
    bolt = [
        (cx - size * 0.10, cy - size * 0.28),
        (cx + size * 0.08, cy - size * 0.04),
        (cx - size * 0.02, cy - size * 0.04),
        (cx + size * 0.12, cy + size * 0.28),
        (cx - size * 0.06, cy + size * 0.02),
        (cx + size * 0.04, cy + size * 0.02),
    ]
    d.polygon(bolt, fill=orange)

    img.save(path)

for size in (16, 32, 48, 128):
    make_icon(size, f"icons/icon{size}.png")

print("done")
