#!/bin/bash

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$script_dir/.."

git ls-files --others --ignored --exclude-standard --directory > .dockerignore
echo '.git' >> .dockerignore
sed '/config\/lib\/index.ts/d' -i .dockerignore