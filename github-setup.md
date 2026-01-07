# GitHub Repository Setup Commands

After creating the repository on GitHub, run these commands in order:

## 1. Add the remote repository
Replace `YOUR_USERNAME` with your GitHub username:
```bash
git remote add origin https://github.com/YOUR_USERNAME/outlook-ui-clone.git
```

Or if you prefer SSH:
```bash
git remote add origin git@github.com:YOUR_USERNAME/outlook-ui-clone.git
```

## 2. Rename branch to main (if needed)
```bash
git branch -M main
```

## 3. Push your code to GitHub
```bash
git push -u origin main
```

That's it! Your code will be on GitHub.

