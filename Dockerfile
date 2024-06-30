FROM node:18-alpine

COPY . /src

WORKDIR /src

RUN npm install -g pnpm

RUN pnpm install

EXPOSE 5000

CMD ["pnpm", "dev"]
