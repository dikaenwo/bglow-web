#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "=== Starting B-Glow Project Deployment Setup ==="

# Define variables
PROJECT_DIR="$(pwd)"
DB_NAME="bglow_db"
DB_USER="bglow"
DB_PASS="Bglow@2026"
VENV_DIR="$PROJECT_DIR/backend/venv"

echo "Project Directory: $PROJECT_DIR"

# 1. Update and Upgrade packages
echo "Updating packages..."
sudo apt update -y

# 2. Install Node.js (NodeSource Node 20)
echo "Installing Node.js 20..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
else
    echo "Node.js is already installed: $(node -v)"
fi

# 3. Install Python, pip, virtualenv, MySQL, Nginx, and curl
echo "Installing python3, pip, virtualenv, mysql-server, nginx..."
sudo apt install -y python3-pip python3-venv mysql-server nginx curl

# 4. Configure MySQL Database
echo "Configuring MySQL Database..."
# Start MySQL Service if not running
sudo systemctl start mysql
sudo systemctl enable mysql

# Create database and database user
echo "Creating database user '$DB_USER' with privileges on '$DB_NAME'..."
sudo mysql -e "CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;"
sudo mysql -e "CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASS';"
sudo mysql -e "GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"

# Import database schema
if [ -f "$PROJECT_DIR/backend/database.sql" ]; then
    echo "Importing database schema from backend/database.sql..."
    sudo mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < "$PROJECT_DIR/backend/database.sql"
else
    echo "Warning: backend/database.sql not found!"
fi

# 5. Setup Python Virtual Environment and Backend
echo "Setting up Python virtual environment..."
cd "$PROJECT_DIR/backend"

# Create .env from .env.example if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp .env.example .env
    # Generate random JWT secret key
    JWT_SECRET=$(python3 -c "import secrets; print(secrets.token_hex(32))")
    # Replace default placeholder with generated key
    sed -i "s/JWT_SECRET_KEY=ganti-dengan-secret-key-yang-panjang-dan-random/JWT_SECRET_KEY=$JWT_SECRET/g" .env
    echo ".env file created with a secure JWT_SECRET_KEY."
fi

python3 -m venv venv
source venv/bin/activate

echo "Installing backend dependencies..."
pip install --upgrade pip
pip install -r requirements.txt
pip install gunicorn

# Test backend setup
echo "Backend dependencies installed successfully."
deactivate
cd "$PROJECT_DIR"

# 6. Build Frontend
echo "Building frontend using Vite..."
npm install
npm run build

# Copy build folder to /var/www/bglow/dist
echo "Copying built frontend to /var/www/bglow/dist..."
sudo mkdir -p /var/www/bglow/dist
sudo cp -r "$PROJECT_DIR/dist/"* /var/www/bglow/dist/
sudo chown -R www-data:www-data /var/www/bglow/dist

# 7. Configure Gunicorn Systemd Service
echo "Creating Gunicorn Systemd service..."
cat <<EOF | sudo tee /etc/systemd/system/bglow-backend.service
[Unit]
Description=Gunicorn instance to serve B-Glow backend
After=network.target

[Service]
User=$USER
WorkingDirectory=$PROJECT_DIR/backend
EnvironmentFile=$PROJECT_DIR/backend/.env
ExecStart=$VENV_DIR/bin/gunicorn --workers 3 --bind 127.0.0.1:5000 main:app
Restart=always

[Install]
WantedBy=multi-user.target
EOF

echo "Starting and enabling Gunicorn bglow-backend service..."
sudo systemctl daemon-reload
sudo systemctl start bglow-backend
sudo systemctl enable bglow-backend

# 8. Configure Nginx
echo "Configuring Nginx..."
cat <<EOF | sudo tee /etc/nginx/sites-available/bglow
server {
    listen 80;
    server_name localhost 103.247.8.169;

    location / {
        root /var/www/bglow/dist;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Enable the Nginx site
echo "Enabling Nginx configuration..."
sudo ln -sf /etc/nginx/sites-available/bglow /etc/nginx/sites-enabled/
# Remove default site if exists
sudo rm -f /etc/nginx/sites-enabled/default || true

# Test and restart Nginx
sudo nginx -t
sudo systemctl restart nginx

echo "=== B-Glow Project Deployment Setup Completed Successfully! ==="
echo "You can access your website at: http://103.247.8.169"

