import React from "react";
import "./profile.css";
import { Camera } from "lucide-react";

const Profile = () => {
  return (
    <div className="profile_wrapper">
      <div className="profile_header_section">
        <div className="avatar_upload_container">
          <div className="avatar_placeholder">
            <span className="avatar_initials">JD</span>
            <div className="camera_icon_overlay">
              <Camera size={16} />
            </div>
          </div>
          <div className="avatar_text">
            <h3>Profile Picture</h3>
            <p>PNG, JPG up to 5MB</p>
          </div>
          <button className="upload_btn">Upload New</button>
          <button className="delete_btn">Delete</button>
        </div>
      </div>

      <div className="profile_form_container">
        <div className="form_group">
          <label>Full Name</label>
          <input type="text" placeholder="John Doe" />
        </div>

        <div className="form_group">
          <label>Email Address</label>
          <input type="email" placeholder="john.doe@example.com" />
        </div>

        <div className="form_group">
          <label>Role / Job Title</label>
          <input type="text" placeholder="Senior Developer" />
        </div>

        <div className="form_group">
          <label>Phone Number</label>
          <input type="tel" placeholder="+1 (555) 000-0000" />
        </div>

        <div className="form_group full_width">
          <label>Bio</label>
          <textarea
            placeholder="Tell us a little about yourself..."
            rows="4"
          ></textarea>
        </div>

        <div className="form_section_header full_width">
          <h3>Address Information</h3>
        </div>

        <div className="form_group full_width">
          <label>Street Address</label>
          <input type="text" placeholder="123 Main St" />
        </div>

        <div className="form_group">
          <label>City</label>
          <input type="text" placeholder="New York" />
        </div>

        <div className="form_group">
          <label>State / Province</label>
          <input type="text" placeholder="NY" />
        </div>

        <div className="form_group">
          <label>Zip / Postal Code</label>
          <input type="text" placeholder="10001" />
        </div>

        <div className="form_group">
          <label>Country</label>
          <input type="text" placeholder="United States" />
        </div>

        <div className="form_actions full_width">
          <button className="save_changes_btn">Save Changes</button>
          <button className="cancel_btn">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
