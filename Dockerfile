ARG NODE_VERSION=24
FROM node:${NODE_VERSION} AS base
RUN apt update && apt install ffmpeg -y

WORKDIR /usr/src/app
EXPOSE 3000
ENV NODE_OPTIONS="--max-old-space-size=4096"


FROM base AS dev
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --include=dev
#USER node
COPY . .
CMD npm run dev

FROM base AS prod
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    #    npm install
    npm ci 
#--omit=dev
#USER node
COPY . .
RUN npm run build
CMD [ "node", ".output/server/index.mjs" ]

