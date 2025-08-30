# Vercel Deployment Guide

## Option 1: Direct Upload (Easiest)
1. Go to vercel.com
2. Login with your GitHub account (using edu email)
3. Click "Add New Project"
4. Select "Upload a folder"
5. Upload your "dist" folder from the project
6. Deploy!

## Option 2: GitHub Integration (Recommended)
1. After pushing to GitHub, go to vercel.com
2. Login with GitHub
3. Click "Add New Project"
4. Import your GitHub repository
5. Vercel will auto-detect it's a Vite project
6. Click "Deploy"

## Your Project Settings:
- Framework Preset: Vite
- Build Command: npm run build
- Output Directory: dist
- Install Command: npm install

## Expected Live URL:
https://ai-website-builder-vibehack2025.vercel.app
