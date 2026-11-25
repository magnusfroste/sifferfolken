#!/usr/bin/env python3
"""Ritar ikoner och og-bild för Sifferfolken med PIL. Inga externa filer."""
import os
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
PUB = os.path.join(HERE, "public")
ACCENT = (168, 100, 42, 255)
PAPER = (250, 247, 242, 255)
INK = (59, 47, 34, 255)

def ikon(size, pad=0.0, bg=ACCENT, fg=PAPER):
    im = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    r = int(size * 0.22)
    d.rounded_rectangle([0, 0, size - 1, size - 1], radius=r, fill=bg)
    inner = size * (1 - 2 * pad)
    off = size * pad
    # streck (ett-tecknet) och prick (mayas ett) – två former, inga tunna linjer
    w = inner * 0.17
    d.rounded_rectangle([off + inner * 0.24, off + inner * 0.17,
                         off + inner * 0.24 + w, off + inner * 0.83],
                        radius=w / 2, fill=fg)
    dot_r = inner * 0.155
    cx, cy = off + inner * 0.68, off + inner * 0.5
    d.ellipse([cx - dot_r, cy - dot_r, cx + dot_r, cy + dot_r], fill=fg)
    return im

def main():
    ikon(192).save(os.path.join(PUB, "icon-192.png"))
    ikon(512).save(os.path.join(PUB, "icon-512.png"))
    ikon(512, pad=0.12, bg=ACCENT).save(os.path.join(PUB, "icon-maskable-512.png"))
    ikon(180).save(os.path.join(PUB, "apple-touch-icon.png"))

    # og.png 1200x630: papper, titel, två tecken
    W, H = 1200, 630
    im = Image.new("RGB", (W, H), PAPER[:3])
    d = ImageDraw.Draw(im)
    def font(px, bold=True):
        for p in ["/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else
                  "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"]:
            if os.path.exists(p):
                return ImageFont.truetype(p, px)
        return ImageFont.load_default()
    d.text((80, 150), "Sifferfolken", font=font(120), fill=INK[:3])
    d.text((84, 300), "Bygg tal med tecken från förr", font=font(52, False), fill=(74, 82, 96))
    # tecken längst ned: streck + hälben + prick
    d.rounded_rectangle([84, 430, 84 + 34, 430 + 170], radius=17, fill=INK[:3])
    d.arc([150, 430, 330, 610], start=180, end=360, fill=INK[:3], width=30)
    d.line([165, 520, 165, 600], fill=INK[:3], width=30)
    d.line([315, 520, 315, 600], fill=INK[:3], width=30)
    d.ellipse([380, 505, 470, 595], fill=INK[:3])
    im.save(os.path.join(PUB, "og.png"))

if __name__ == "__main__":
    main()
    print("ikoner + og.png skrivna")