import paramiko

HOST = "bglow.store"
USER = "bglow"
PASS = "bglow2026"
LOCAL_FILE = r"d:\B-Glow\privacy-policy.html"

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

print("[1] Connecting to VPS...")
ssh.connect(HOST, username=USER, password=PASS, timeout=15)
print("[1] Connected!")

# Upload file to /var/www/bglow/ (owned by bglow:bglow, no sudo needed)
print("[2] Uploading privacy-policy.html...")
sftp = ssh.open_sftp()
sftp.put(LOCAL_FILE, "/var/www/bglow/privacy-policy.html")
print("[2] Uploaded to /var/www/bglow/privacy-policy.html")
sftp.close()

# Verify file exists
stdin, stdout, stderr = ssh.exec_command("ls -la /var/www/bglow/privacy-policy.html")
print(f"[2] Verify: {stdout.read().decode().strip()}")

# Read current nginx bglow config
print("[3] Reading current nginx config...")
stdin, stdout, stderr = ssh.exec_command("cat /etc/nginx/sites-available/bglow")
current_conf = stdout.read().decode()
print(f"[3] Current config:\n{current_conf}")

# Check if privacy-policy location already exists
if '/privacy-policy' in current_conf:
    print("[3] Location /privacy-policy already exists in nginx config!")
else:
    # Add location block for /privacy-policy BEFORE the closing of the first server block
    # Insert after the /api/ location block
    new_location = """
    location = /privacy-policy {
        alias /var/www/bglow/privacy-policy.html;
        default_type text/html;
    }
"""
    
    # Find the right place to insert - after the /api/ location block
    # We'll insert before the first `listen [::]:443` line
    insert_marker = "    listen [::]:443 ssl"
    if insert_marker in current_conf:
        new_conf = current_conf.replace(insert_marker, new_location + "\n" + insert_marker)
        
        # Write updated config
        print("[4] Writing updated nginx config...")
        # Write to temp file first
        stdin, stdout, stderr = ssh.exec_command(f"cat > /tmp/bglow_nginx_conf << 'NGINX_EOF'\n{new_conf}NGINX_EOF")
        stdout.read()
        
        # Copy with sudo
        stdin, stdout, stderr = ssh.exec_command("echo 'bglow2026' | sudo -S cp /tmp/bglow_nginx_conf /etc/nginx/sites-available/bglow")
        out = stdout.read().decode()
        err = stderr.read().decode()
        print(f"[4] Copy result: {out} {err}")
        
        # Verify new config
        stdin, stdout, stderr = ssh.exec_command("cat /etc/nginx/sites-available/bglow")
        print(f"[4] New config:\n{stdout.read().decode()}")
    else:
        print("[4] ERROR: Could not find insert marker in config!")

# Test nginx config
print("[5] Testing nginx config...")
stdin, stdout, stderr = ssh.exec_command("echo 'bglow2026' | sudo -S nginx -t 2>&1")
out = stdout.read().decode().strip()
err = stderr.read().decode().strip()
print(f"[5] nginx test: {out} {err}")

# Reload nginx
print("[6] Reloading nginx...")
stdin, stdout, stderr = ssh.exec_command("echo 'bglow2026' | sudo -S systemctl reload nginx 2>&1")
out = stdout.read().decode().strip()
err = stderr.read().decode().strip()
print(f"[6] reload: {out} {err}")

# Quick test
print("[7] Testing URL locally on VPS...")
stdin, stdout, stderr = ssh.exec_command("curl -sI http://localhost/privacy-policy 2>&1 | head -5")
out = stdout.read().decode().strip()
print(f"[7] curl test:\n{out}")

ssh.close()
print("\n[DONE] Deployment complete!")
print("URL: https://bglow.store/privacy-policy")
