@echo off
echo Deploying to Vercel...

echo Stage 1: Committing changes
git add .
git commit -m "Fixed loading error and updated to red theme"

echo Stage 2: Pushing to repository
git push

echo Stage 3: Deploying to Vercel
vercel --prod

echo Deployment complete! Check the Vercel dashboard for details.
