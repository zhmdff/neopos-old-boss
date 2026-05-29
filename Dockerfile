# BUILD STAGE
FROM node:22.13.0-alpine AS build
WORKDIR /app

# Install build dependencies for native modules
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    linux-headers \
    eudev-dev \
    libusb-dev \
    pkgconfig

# Cache bust
ARG CACHE_BUST=1

# Increase memory for large Vite builds (Crucial for Alpine/Docker)
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Copy package files
COPY package*.json ./

# Enforce legacy peer deps globally for this build
RUN npm config set legacy-peer-deps true
RUN npm install

# Copy everything and build
COPY . .
RUN npm run build

# RUN STAGE
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Custom nginx config to handle React Router (SPA)
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
