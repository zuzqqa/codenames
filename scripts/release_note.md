Add separate Docker configurations for frontend: optimized production build and local development setup
**🔧 What's included in this release?**
Implemented separate Dockerfile.prod and Dockerfile.dev for the frontend, introducing a multi-stage production build with Alpine for optimization while maintaining hot-reload in development, along with corresponding updates to docker-compose.yml.

Key additions: 
- Added Dockerfile.prod with multi-stage build (Node + Alpine) for Cloud Run deployments.
- Maintained Dockerfile.dev with hot-reload support for local development.
- Updated docker-compose.yml to explicitly use dockerfile: Dockerfile.dev.

**🚧 What's still under development?**
- UI/UX fixes.
- Implementing Hazelcast for in-memory data access.
- Set up CI/CD pipeline for automatic deployment.

⚠️Important! This version is intended for testers and developers. Please note that the game is not fully functional yet, and some elements may not behave as expected.

PRE-RELEASE
