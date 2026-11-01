#!/usr/bin/env bash
# Rebuilds the self-hosted fonts from the OFL sources in google/fonts: Sofia Sans and Sofia Sans
# Extra Condensed in src/styles/fonts (next/font/local), Caveat in public/fonts. Caveat, the
# notebook's handwriting, has a fixed URL so the components that use it can preload it on their
# pages alone (src/styles/font-hand.tsx).
# Needs Python with fonttools and brotli on PATH: `pip install fonttools brotli`.
#
# One WOFF2 per family instead of Google's separate Cyrillic and Latin files: Bulgarian and
# Russian Cyrillic, basic Latin and the signs we typeset (dashes, Bulgarian quotes „“ « », №, €),
# only the weights in use. OpenType: fonttools' defaults (kerning, ligatures, locl, marks) plus
# case and numeral features; stylistic sets and small caps aren't used in the design.
# Characters outside the set fall back to the system font.
set -euo pipefail

source_commit=8b0a1d0f5983c89bc2b93f1b5fb55f9e252744b5
base="https://raw.githubusercontent.com/google/fonts/$source_commit/ofl"
root="$(cd "$(dirname "$0")/.." && pwd)"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

unicodes='U+0020-007E,U+00A0-00FF,U+0400-045F,U+2010-2027,U+2030-203A,U+20AC,U+2116,U+2122,U+2212'

build() {
  local name=$1 path=$2 weights=$3 out=$4
  curl -sfL -o "$tmp/$name.ttf" "$base/$path"
  fonttools varLib.instancer "$tmp/$name.ttf" "wght=$weights" -q -o "$tmp/$name-range.ttf"
  pyftsubset "$tmp/$name-range.ttf" --unicodes="$unicodes" --layout-features+=case,lnum,tnum,pnum,onum \
    --flavor=woff2 --output-file="$out/$name.woff2"
  echo "$name.woff2: weights $weights, $(wc -c < "$out/$name.woff2" | tr -d ' ') bytes"
}

mkdir -p "$root/src/styles/fonts" "$root/public/fonts"
build SofiaSans 'sofiasans/SofiaSans%5Bwght%5D.ttf' 400:700 "$root/src/styles/fonts"
build SofiaSansExtraCondensed 'sofiasansextracondensed/SofiaSansExtraCondensed%5Bwght%5D.ttf' 700:900 "$root/src/styles/fonts"
build Caveat 'caveat/Caveat%5Bwght%5D.ttf' 400:700 "$root/public/fonts"
curl -sfL -o "$root/src/styles/fonts/OFL.txt" "$base/sofiasans/OFL.txt"
curl -sfL -o "$root/public/fonts/Caveat-OFL.txt" "$base/caveat/OFL.txt"
