# GitHub Deployment Information

This file contains the configuration details required for pushing changes to the GitHub repository.

## Repository Details
- **Repository URL:** `https://github.com/dreamhouseweb55-web/dreamhouse-website.git`
- **Remote Origin URL (Authenticated):** `https://dreamhouseweb55-web@github.com/dreamhouseweb55-web/dreamhouse-website.git`

## Git Configuration
- **User Name:** `dreamhouseweb55-web`
- **User Email:** `dreamhouseweb55@gmail.com`

## Deployment Instructions for Agent
1. **Configure User:**
   ```bash
   git config user.name "dreamhouseweb55-web"
   git config user.email "dreamhouseweb55@gmail.com"
   ```

2. **Set Remote URL:**
   ```bash
   git remote set-url origin https://dreamhouseweb55-web@github.com/dreamhouseweb55-web/dreamhouse-website.git
   ```

3. **Push Changes:**
   ```bash
   git push origin main
   ```
   *Note: If prompted for authentication, the user must handle the browser login or password entry.*
