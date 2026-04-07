FROM node:18-alpine as builder

# Gosen Success Build (current directory is frontend)
WORKDIR /app/gosensuccess
COPY package*.json ./
RUN npm install
COPY . ./
RUN npm run build

# Ledo Build (ledo subdirectory)
WORKDIR /app/ledo
COPY ./ledo/package*.json ./
RUN npm install
COPY ./ledo/ ./
RUN npm run build

# Nginx - Production
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy Gosen Success
COPY --from=builder /app/gosensuccess/dist /usr/share/nginx/html

# Copy Ledo
COPY --from=builder /app/ledo/dist /usr/share/nginx/html/ledo

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
