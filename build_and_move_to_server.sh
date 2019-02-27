#!/bin/bash
npm run build && rm -Rf ../ninicobox-v3-server/web/!(package.json) && mv -f ./dist/* ../ninicobox-v3-server/web/
