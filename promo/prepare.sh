#!/usr/bin/env bash
# Prepares promo/.work: installs the headless renderer and extracts footage as frame sequences.
set -e
cd "$(dirname "$0")"
R=".."
mkdir -p .work/frames && cd .work
[ -d node_modules/playwright-core ] || { [ -f package.json ] || echo '{"name":"promo-work","private":true}' > package.json; npm i playwright-core >/dev/null; }
ex() { # id file start duration
  mkdir -p "frames/$1"
  ffmpeg -v error -y -ss "$3" -t "$4" -i "../$R/$2" -vf "fps=30,scale=1600:900:force_original_aspect_ratio=increase,crop=1600:900" -q:v 3 "frames/$1/%04d.jpg"
  echo "$1 $(ls "frames/$1" | wc -l) frames"
}
ex reel   services-assets/media/services/reel.mp4 2 7
ex reel2  services-assets/media/services/reel.mp4 30 7.6
ex norman services-assets/media/norman-ascension/hero-loop.mp4 1 2.7
ex sf     services-assets/media/services/editor/sf-edit-preview-export.mp4 6 2.7
ex nd     portfolio-media/my-games/network-defense.mp4 6 2.7
ex soc    portfolio-media/my-games/soc.mp4 6 2.7
ex mc     portfolio-media/mission-control/mission-control.mp4 4 2.7
ex fps    videos/fpsscifi.mp4 5 5.1
