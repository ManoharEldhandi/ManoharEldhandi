#!/usr/bin/env zsh
set -euo pipefail

here="${0:A:h}"
render_dir="${here}/.render"

github_mp4="${here}/assets/profile-footer.mp4"
github_gif="${here}/assets/profile-footer.gif"

export W="3840"
export H="480"
export LOOP="30"
export FPS="30"
export SCENE="scene-footer.html"

gif_w="800"
gif_fps="10"
gif_colors="64"

cd "$render_dir"
echo "==> Rendering Footer 30s loop at 3840x480..."
node render.js

echo "==> Encoding 4K MP4..."
ffmpeg -v error -y -framerate "$FPS" -i frames/f_%04d.png \
  -c:v libx264 -preset veryslow -tune animation -crf 18 -pix_fmt yuv420p -movflags +faststart \
  "$github_mp4"

echo "==> Encoding heavily optimized GIF for GitHub README..."
ffmpeg -v error -y -framerate "$FPS" -i frames/f_%04d.png \
  -vf "fps=${gif_fps},scale=${gif_w}:-1:flags=lanczos,palettegen=max_colors=${gif_colors}" \
  -frames:v 1 -update 1 palette.png
ffmpeg -v error -y -framerate "$FPS" -i frames/f_%04d.png -i palette.png \
  -lavfi "fps=${gif_fps},scale=${gif_w}:-1:flags=lanczos[v];[v][1:v]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle" \
  -loop 0 "$github_gif"

rm -f frames/*.png palette.png
echo "Done."
