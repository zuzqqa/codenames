import React from "react";

import "./SettingsFooter.css";

/**
 * SettingsFooter Component
 *
 * A footer component displayed at the bottom of the settings page.
 *
 * @component
 * @returns {JSX.Element} - Rendered footer component
 */
const SettingsFooter: React.FC = () => {
  return (
    <div className="settings-footer">
      <div className="settings-footer-golden-bar"></div>
      <div className="settings-footer-title">
        <p>Codenames</p>
      </div>
    </div>
  );
};

export default SettingsFooter;
