#!/bin/bash
shopt -s extglob
npm run build
npm run translate-and-patchsw
rm -Rf ../ninicobox-v3-server/web/!(package.json)
mv -f ./dist/* ../ninicobox-v3-server/web/
