import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();

  // Company State
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [companyDomain, setCompanyDomain] = useState("");
  const [country, setCountry] = useState("");
  const [timezone, setTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  );

  // Admin State
  const [fullName, setFullName] = useState("");
  const [workEmail, setWorkEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = {
      company: {
        name: companyName,
        industry,
        size: companySize,
        domain: companyDomain,
        country,
        timezone,
      },
      admin: {
        fullName,
        email: workEmail,
        password,
        role: "Owner", // Auto-assigned
        phone: phoneNumber,
      },
    };
    console.log("Registration attempt:", formData);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Registration Successful!");
        navigate("/login");
      } else {
        alert(data.message || "Registration Failed");
      }
    } catch (error) {
      console.error("Error submitting registration:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <StyledWrapper>
      <form className="form" onSubmit={handleSubmit}>
        <div className="header">
          <h2>Create Workspace</h2>
          <p>Setup your company and admin account</p>
        </div>

        <div className="section">
          <h3>🏢 Company Details</h3>
          <div className="grid-start">
            <div className="input-group">
              <label>Company Name</label>
              <input
                type="text"
                className="input"
                placeholder="Acme Inc."
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label>Industry</label>
              <select
                className="input"
                required
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              >
                <option value="">Select Industry</option>
                <option value="IT">Information Technology</option>
                <option value="Finance">Finance</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Education">Education</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid-row">
            <div className="input-group">
              <label>Size</label>
              <select
                className="input"
                required
                value={companySize}
                onChange={(e) => setCompanySize(e.target.value)}
              >
                <option value="">Select Size</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="200+">200+ employees</option>
              </select>
            </div>
            <div className="input-group">
              <label>Domain</label>
              <input
                type="text"
                className="input"
                placeholder="acme.com"
                value={companyDomain}
                onChange={(e) => setCompanyDomain(e.target.value)}
              />
            </div>
          </div>

          <div className="grid-row">
            <div className="input-group">
              <label>Country</label>
              <input
                type="text"
                className="input"
                placeholder="United States"
                required
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label>Timezone</label>
              <input
                type="text"
                className="input"
                placeholder="UTC"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="divider"></div>

        <div className="section">
          <h3>👤 Admin Details</h3>
          <div className="input-group">
            <label>Full Name</label>
            <input
              type="text"
              className="input"
              placeholder="John Doe"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label>Work Email</label>
            <input
              type="email"
              className="input"
              placeholder="john@acme.com"
              required
              value={workEmail}
              onChange={(e) => setWorkEmail(e.target.value)}
            />
          </div>
          <div className="grid-row">
            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                className="input"
                placeholder="********"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label>Phone (Optional)</label>
              <input
                type="tel"
                className="input"
                placeholder="+1 234 567 8900"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
          </div>
        </div>

        <button type="submit" className="button-submit">
          Create Account
        </button>
        <p className="p">
          Already have an account?{" "}
          <span className="span" onClick={() => navigate("/login")}>
            Sign In
          </span>
        </p>
      </form>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  padding: 40px 0;
  background-color: #141415; /* Match app background if needed, or keeping generic helper */

  .form {
    display: flex;
    flex-direction: column;
    gap: 15px;
    background-color: #1f1f1f;
    padding: 40px;
    width: 90%;
    max-width: 600px;
    border-radius: 20px;
    font-family:
      -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu,
      Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  }

  @media (max-width: 768px) {
    .form {
      padding: 20px;
    }

    .grid-row,
    .grid-start {
      flex-direction: column;
      gap: 10px;
    }
  }

  .header {
    text-align: center;
    margin-bottom: 10px;
  }

  .header h2 {
    color: #f1f1f1;
    margin-bottom: 5px;
  }

  .header p {
    color: #aaa;
    font-size: 14px;
    margin: 0;
  }

  .section h3 {
    color: #2d79f3;
    font-size: 16px;
    margin-bottom: 15px;
    border-bottom: 1px solid #333;
    padding-bottom: 5px;
  }

  .input-group {
    display: flex;
    flex-direction: column;
    gap: 5px;
    flex: 1;
  }

  .input-group label {
    color: #f1f1f1;
    font-size: 13px;
    font-weight: 500;
  }

  .grid-row {
    display: flex;
    gap: 15px;
  }

  .grid-start {
    display: flex;
    gap: 15px;
    margin-bottom: 10px;
  }

  .input {
    border-radius: 10px;
    border: 1.5px solid #333;
    padding: 0 15px;
    width: 100%;
    height: 45px;
    background-color: #2b2b2b;
    color: #f1f1f1;
    font-size: 14px;
    transition: 0.2s ease-in-out;
  }

  .input:focus {
    outline: none;
    border-color: #2d79f3;
  }

  select.input {
    appearance: none;
    cursor: pointer;
  }

  .divider {
    height: 1px;
    background-color: #333;
    margin: 10px 0;
  }

  .button-submit {
    margin-top: 20px;
    background-color: #2d79f3;
    border: none;
    color: white;
    font-size: 16px;
    font-weight: 600;
    border-radius: 10px;
    height: 50px;
    width: 100%;
    cursor: pointer;
    transition: 0.2s;
  }

  .button-submit:hover {
    background-color: #1b64da;
  }

  .p {
    text-align: center;
    color: #f1f1f1;
    font-size: 14px;
    margin-top: 10px;
  }

  .span {
    color: #2d79f3;
    font-weight: 500;
    cursor: pointer;
  }

  .span:hover {
    text-decoration: underline;
  }
`;

export default Register;
