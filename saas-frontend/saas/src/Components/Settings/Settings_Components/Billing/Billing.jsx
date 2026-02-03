import React from "react";
import "./Billing.css";
import { CreditCard, Download, Plus } from "lucide-react";

const Billing = () => {
  return (
    <div className="billing_wrapper">
      {/* Payment Method */}
      <div className="account_section">
        <div className="section_header">
          <div className="header_with_icon">
            <CreditCard size={20} className="section_icon" />
            <h3>Payment Method</h3>
          </div>
          <p>Manage your billing details and payment methods.</p>
        </div>

        <div className="payment_methods_list">
          <div className="payment_method_item">
            <div className="card_icon_wrapper">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png"
                alt="Mastercard"
                className="card_logo"
              />
            </div>
            <div className="card_details">
              <h4>Mastercard ending in 4242</h4>
              <p>Expiry 12/28 • Default</p>
            </div>
            <button className="text_btn">Edit</button>
          </div>

          <div className="payment_method_item">
            <div className="card_icon_wrapper">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png"
                alt="Visa"
                className="card_logo"
              />
            </div>
            <div className="card_details">
              <h4>Visa ending in 1234</h4>
              <p>Expiry 09/26</p>
            </div>
            <button className="text_btn">Edit</button>
          </div>

          <button className="add_payment_btn">
            <Plus size={18} />
            <span>Add Payment Method</span>
          </button>
        </div>
      </div>

      {/* Invoice History */}
      <div className="account_section">
        <div className="section_header">
          <div className="header_with_icon">
            <Download size={20} className="section_icon" />
            <h3>Invoice History</h3>
          </div>
          <p>Download your past invoices.</p>
        </div>

        <div className="invoice_table_container">
          <table className="invoice_table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Invoice</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Oct 1, 2024</td>
                <td>$29.00</td>
                <td>
                  <span className="status_badge paid">Paid</span>
                </td>
                <td>
                  <button className="download_btn">
                    <Download size={14} /> PDF
                  </button>
                </td>
              </tr>
              <tr>
                <td>Sep 1, 2024</td>
                <td>$29.00</td>
                <td>
                  <span className="status_badge paid">Paid</span>
                </td>
                <td>
                  <button className="download_btn">
                    <Download size={14} /> PDF
                  </button>
                </td>
              </tr>
              <tr>
                <td>Aug 1, 2024</td>
                <td>$29.00</td>
                <td>
                  <span className="status_badge paid">Paid</span>
                </td>
                <td>
                  <button className="download_btn">
                    <Download size={14} /> PDF
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Billing;
