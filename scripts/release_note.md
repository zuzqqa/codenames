🎮 Alpha Release – Early version of the game
**🔧 What's included in this release?**
This update focuses on improving core gameplay mechanics and addressing key logic issues reported by testers.

Key additions: 
- Fixed issue with user ID persistence – user IDs are now properly removed from localStorage.
- Added "Pass" button to allow players to skip their turn.
- Updated hint selection logic:
    - Players can now select hint number + 1 cards.
    - Hints with value 0 are now blocked, and "End Round" is disabled in such cases.
- Improved card interaction rules:
    - Clicking already revealed cards is now disabled.
    - Selecting a neutral card correctly ends the turn immediately.
- Resolved turn switching bug – fixed duplicate toggleTurn trigger on final opposing card selection.

**🚧 What's still under development?**
- User profile enhancements.

⚠️Important! This version is intended for testers and developers. Please note that the game is not fully functional yet, and some elements may not behave as expected.

PRE-RELEASE
