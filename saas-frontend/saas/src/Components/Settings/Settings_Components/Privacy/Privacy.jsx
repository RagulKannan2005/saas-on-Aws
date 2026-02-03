import React, { useState } from "react";
import "./Privacy.css";
import { Eye, Globe, Lock, Activity } from "lucide-react";

const Privacy = () => {
  const [readReceipts, setReadReceipts] = useState(true);
  const [onlineStatus, setOnlineStatus] = useState(true);

  return (
    <div className="privacy_wrapper">
      {/* Profile Visibility */}
      <div className="account_section">
        <div className="section_header">
          <div className="header_with_icon">
            <Globe size={20} className="section_icon" />
            <h3>Profile Visibility</h3>
          </div>
          <p>Control who can see your profile and details.</p>
        </div>

        <div className="visibility_options">
          <label className="radio_option selected">
            <input type="radio" name="visibility" defaultChecked />
            <div className="radio_content">
              <div className="radio_header">
                <Globe size={18} />
                <h4>Public</h4>
              </div>
              <p>Anyone on the internet can see your profile.</p>
            </div>
            <div className="radio_indicator"></div>
          </label>

          <label className="radio_option">
            <input type="radio" name="visibility" />
            <div className="radio_content">
              <div className="radio_header">
                <Activity size={18} />
                <h4>Team Only</h4>
              </div>
              <p>Only members of your team can view your profile.</p>
            </div>
            <div className="radio_indicator"></div>
          </label>

          <label className="radio_option">
            <input type="radio" name="visibility" />
            <div className="radio_content">
              <div className="radio_header">
                <Lock size={18} />
                <h4>Private</h4>
              </div>
              <p>No one can see your profile except you.</p>
            </div>
            <div className="radio_indicator"></div>
          </label>
        </div>
      </div>

      {/* Activity Status */}
      <div className="account_section">
        <div className="section_header">
          <div className="header_with_icon">
            <Eye size={20} className="section_icon" />
            <h3>Activity Privacy</h3>
          </div>
          <p>Manage what others can see about your activity.</p>
        </div>

        <div className="notification_list">
          <div className="notification_item">
            <div className="item_info">
              <h4>Show Online Status</h4>
              <p>Let others see when you are currently active.</p>
            </div>
            <label className="toggle_switch">
              <input
                type="checkbox"
                checked={onlineStatus}
                onChange={() => setOnlineStatus(!onlineStatus)}
              />
              <span className="slider round"></span>
            </label>
          </div>

          <div className="notification_item">
            <div className="item_info">
              <h4>Read Receipts</h4>
              <p>Let others know when you've viewed their messages.</p>
            </div>
            <label className="toggle_switch">
              <input
                type="checkbox"
                checked={readReceipts}
                onChange={() => setReadReceipts(!readReceipts)}
              />
              <span className="slider round"></span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
