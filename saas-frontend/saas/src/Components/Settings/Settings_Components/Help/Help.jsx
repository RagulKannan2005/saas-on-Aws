import React, { useState } from "react";
import "./Help.css";
import {
  MessageCircle,
  FileText,
  ChevronDown,
  ChevronUp,
  Send,
} from "lucide-react";

/**
 * Reusable FAQ Item Component
 */
const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={`faq_item ${isOpen ? "open" : ""}`}
      onClick={() => setIsOpen(!isOpen)}
    >
      <div className="faq_question">
        <span>{question}</span>
        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </div>
      {isOpen && <div className="faq_answer">{answer}</div>}
    </div>
  );
};

const Help = () => {
  return (
    <div className="help_wrapper">
      {/* FAQ Section */}
      <div className="account_section">
        <div className="section_header">
          <div className="header_with_icon">
            <FileText size={20} className="section_icon" />
            <h3>Frequently Asked Questions</h3>
          </div>
          <p>Find answers to common questions.</p>
        </div>

        <div className="faq_list">
          <FAQItem
            question="How do I change my workspace URL?"
            answer="You can change your workspace URL in the Workspace Settings tab. Note that this will change the link for all your team members."
          />
          <FAQItem
            question="How does billing work?"
            answer="We bill monthly or annually depending on your preference. You can update your payment method in the Billing tab."
          />
          <FAQItem
            question="Can I invite external clients?"
            answer="Yes! You can invite guests to specific projects. They will only see what you allow them to see."
          />
          <FAQItem
            question="Where can I find the API documentation?"
            answer="Our API documentation is available at docs.saas.com/api. You'll need an API key from the Integrations tab."
          />
        </div>
      </div>

      {/* Contact Support */}
      <div className="account_section">
        <div className="section_header">
          <div className="header_with_icon">
            <MessageCircle size={20} className="section_icon" />
            <h3>Contact Support</h3>
          </div>
          <p>Can't find what you're looking for? Send us a message.</p>
        </div>

        <div className="contact_form">
          <div className="form_group full_width">
            <label>Subject</label>
            <select>
              <option>General Inquiry</option>
              <option>Technical Issue</option>
              <option>Billing Question</option>
              <option>Feature Request</option>
            </select>
          </div>

          <div className="form_group full_width">
            <label>Message</label>
            <textarea
              rows="5"
              placeholder="How can we help you today?"
            ></textarea>
          </div>

          <div className="form_actions">
            <button className="primary_btn">
              <Send size={16} />
              <span>Send Message</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
