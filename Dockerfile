FROM node:18-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy only the files needed for pnpm install to utilize Docker cache
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install

# Copy the Prisma schema and generate the Prisma client only if the schema has changed
COPY prisma ./prisma/
RUN pnpm dlx prisma generate

# Copy the rest of the application code
COPY . .

EXPOSE 5000

CMD ["pnpm", "dev"]