# High-Performance Production Nginx Container for Synology DS925+
# Pre-compiled React + Vite bundle with instant 1-second deployment
FROM nginx:alpine

# Remove default nginx configuration
RUN rm -rf /etc/nginx/conf.d/default.conf

# Copy custom reverse proxy & WebSocket configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy pre-compiled production build bundle directly into web root
COPY dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
