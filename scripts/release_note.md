Add GitHub Actions workflow for deploying all services to Google Cloud Run
**🔧 What's included in this release?**
Implemented a GitHub Actions workflow to automate deployment of backend, frontend, socket.io server, and peer server to Google Cloud Run using production Dockerfiles and Workload Identity Federation.

Key additions: 
- Created deploy.yml workflow triggered on main branch push
- Used google-github-actions/auth@v2 for authentication via Workload Identity Federation
- Deployed frontend with Dockerfile.prod using --file flag in gcloud builds submit
- Injected backend environment variables via GitHub secret and temporary env.yaml
- Used --set-env-vars for frontend build-time environment configuration
- Removed env.yaml after deployment for security

**🚧 What's still under development?**
- UI/UX fixes.
- Implementing Hazelcast for in-memory data access.

⚠️Important! This version is intended for testers and developers. Please note that the game is not fully functional yet, and some elements may not behave as expected.

PRE-RELEASE
