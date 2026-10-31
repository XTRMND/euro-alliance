#!/usr/bin/env bash
# Rebuilds the self-hosted fonts in src/styles/fonts from the OFL sources in google/fonts.
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
out="$(cd "$(dirname "$0")/.." && pwd)/src/styles/fonts"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

unicodes='U+0020-007E,U+00A0-00FF,U+0400-045F,U+2010-2027,U+2030-203A,U+20AC,U+2116,U+2122,U+2212'

build() {
  local name=$1 path=$2 weights=$3
  curl -sfL -o "$tmp/$name.ttf" "$base/$path"
  fonttools varLib.instancer "$tmp/$name.ttf" "wght=$weights" -q -o "$tmp/$name-range.ttf"
  pyftsubset "$tmp/$name-range.ttf" --unicodes="$unicodes" --layout-features+=case,lnum,tnum,pnum,onum \
    --flavor=woff2 --output-file="$out/$name.woff2"
  echo "$name.woff2: weights $weights, $(wc -c < "$out/$name.woff2" | tr -d ' ') bytes"
}

mkdir -p "$out"
build SofiaSans 'sofiasans/SofiaSans%5Bwght%5D.ttf' 400:700
build SofiaSansExtraCondensed 'sofiasansextracondensed/SofiaSansExtraCondensed%5Bwght%5D.ttf' 700:900
curl -sfL -o "$out/OFL.txt" "$base/sofiasans/OFL.txt"
