🎮 Alpha Release – Early version of the game
**🔧 What's included in this release?**
This update lays the groundwork for a more secure and user-friendly password reset flow, while also introducing a refreshed UI for handling forgotten passwords.

Key additions: 
- Implemented a secure password reset token system: each token is uniquely generated, associated with the user's email (if it exists), and includes the IP address of the requester.
- Upon successful reset, the system records the email of the user who used the token.
- Password reset tokens are stored as separate documents in the database and expire after 15 minutes.
- Designed and implemented ResetPasswordRequestPage and ResetPasswordPage for a better user experience.
- IP address is now collected with each password reset request – not used yet, but opens the door for enhanced security features in future updates.

**🚧 What's still under development?**
- Voice chat integration.
- User profile enhancements.

⚠️Important! This version is intended for testers and developers. Please note that the game is not fully functional yet, and some elements may not behave as expected.

PRE-RELEASE
