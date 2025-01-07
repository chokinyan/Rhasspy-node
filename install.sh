path="$(temp=$( realpath "$0" ) && dirname "$temp")"
node $path/index.js
