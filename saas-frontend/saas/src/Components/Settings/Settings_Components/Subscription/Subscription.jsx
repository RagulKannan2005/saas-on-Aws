import React from "react";
import "./Subscription.css";
import { Check, Zap, Server, List, Clock } from "lucide-react";

const Subscription = () => {
  return (
    <div className="subscription_wrapper">
      {/* Current Plan */}
      <div className="current_plan_card">
        <div className="plan_header">
          <div className="plan_info">
            <h3>Free Plan</h3>
            <span className="billing_cycle warning">Trial Ends in 14 Days</span>
          </div>
          <div className="plan_price">
            <span className="currency">$</span>
            <span className="amount">0</span>
            <span className="period">/mo</span>
          </div>
        </div>

        <div className="plan_features">
          <div className="feature_item">
            <Check size={16} className="check_icon" />
            <span>1 Project Limit</span>
          </div>
          <div className="feature_item">
            <Check size={16} className="check_icon" />
            <span>20 Tasks Limit</span>
          </div>
          <div className="feature_item">
            <Clock size={16} className="check_icon warning" />
            <span>Basic Support</span>
          </div>
        </div>

        <div className="plan_actions">
          <button className="primary_btn full_width">Upgrade to Pro</button>
        </div>
      </div>

      {/* Usage Metrics */}
      <div className="account_section">
        <div className="section_header">
          <div className="header_with_icon">
            <Zap size={20} className="section_icon" />
            <h3>Usage</h3>
          </div>
          <p>You have used specific limits of your free plan.</p>
        </div>

        <div className="usage_grid">
          <div className="usage_card">
            <div className="usage_header">
              <Server size={18} />
              <h4>Projects</h4>
            </div>
            <div className="usage_bar_container">
              <div
                className="usage_bar warning"
                style={{ width: "100%" }}
              ></div>
            </div>
            <div className="usage_footer">
              <span>1 used</span>
              <span>1 limit</span>
            </div>
          </div>

          <div className="usage_card">
            <div className="usage_header">
              <List size={18} />
              <h4>Tasks</h4>
            </div>
            <div className="usage_bar_container">
              <div className="usage_bar" style={{ width: "40%" }}></div>
            </div>
            <div className="usage_footer">
              <span>8 used</span>
              <span>20 limit</span>
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade Options */}
      <div className="account_section">
        <div className="section_header">
          <h3>Upgrade Options</h3>
          <p>Unlock more power with our premium plans.</p>
        </div>

        <div className="plans_grid">
          {/* Monthly */}
          <div className="plan_option_card">
            <div className="option_header">
              <h4>Pro Monthly</h4>
              <div className="option_price">
                <span className="currency">$</span>
                <span className="amount">29</span>
                <span className="period">/mo</span>
              </div>
            </div>
            <ul className="option_features">
              <li>
                <Check size={14} /> Unlimited Projects
              </li>
              <li>
                <Check size={14} /> Unlimited Tasks
              </li>
              <li>
                <Check size={14} /> Priority Support
              </li>
            </ul>
            <button className="secondary_btn">Choose Monthly</button>
          </div>

          {/* Yearly */}
          <div className="plan_option_card popular">
            <div className="popular_tag">Save 20%</div>
            <div className="option_header">
              <h4>Pro Yearly</h4>
              <div className="option_price">
                <span className="currency">$</span>
                <span className="amount">279</span>
                <span className="period">/yr</span>
              </div>
            </div>
            <ul className="option_features">
              <li>
                <Check size={14} /> Unlimited Projects
              </li>
              <li>
                <Check size={14} /> Unlimited Tasks
              </li>
              <li>
                <Check size={14} /> Priority Support
              </li>
            </ul>
            <button className="primary_btn">Choose Yearly</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
