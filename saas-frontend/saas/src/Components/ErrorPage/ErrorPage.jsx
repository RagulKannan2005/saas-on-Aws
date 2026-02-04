import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

const ErrorPage = () => {
  const navigate = useNavigate();

  return (
    <StyledWrapper>
      <div className="container">
        <h1 className="glitch" data-text="404">
          404
        </h1>
        <p className="message">Oops! Page not found.</p>
        <p className="sub-message">
          The page you are looking for might have been removed or is temporarily
          unavailable.
        </p>
        <button className="home-btn" onClick={() => navigate("/")}>
          GO HOME
        </button>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100%;
  background-color: #141415;
  color: #f1f1f1;
  text-align: center;
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu,
    Cantarell, "Open Sans", "Helvetica Neue", sans-serif;

  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    padding: 20px;
  }

  .glitch {
    font-size: 100px;
    font-weight: 800;
    color: #f1f1f1;
    position: relative;
    margin: 0;
  }

  .glitch::before,
  .glitch::after {
    content: attr(data-text);
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .glitch::before {
    left: 2px;
    text-shadow: -2px 0 #ff00c1;
    clip: rect(44px, 450px, 56px, 0);
    animation: glitch-anim 5s infinite linear alternate-reverse;
  }

  .glitch::after {
    left: -2px;
    text-shadow: -2px 0 #00fff9;
    clip: rect(44px, 450px, 56px, 0);
    animation: glitch-anim2 5s infinite linear alternate-reverse;
  }

  .message {
    font-size: 24px;
    font-weight: 600;
    margin: 0;
  }

  .sub-message {
    font-size: 16px;
    color: #888;
    max-width: 400px;
    margin: 0;
  }

  .home-btn {
    margin-top: 20px;
    padding: 12px 30px;
    background-color: #2d79f3;
    border: none;
    color: white;
    font-size: 16px;
    font-weight: 600;
    border-radius: 5px;
    cursor: pointer;
    transition: 0.2s ease-in-out;
  }

  .home-btn:hover {
    background-color: #1b64da;
    box-shadow: 0 0 15px rgba(45, 121, 243, 0.5);
  }

  @keyframes glitch-anim {
    0% {
      clip: rect(31px, 9999px, 98px, 0);
    }
    5% {
      clip: rect(74px, 9999px, 20px, 0);
    }
    10% {
      clip: rect(10px, 9999px, 86px, 0);
    }
    15% {
      clip: rect(25px, 9999px, 15px, 0);
    }
    20% {
      clip: rect(69px, 9999px, 57px, 0);
    }
    25% {
      clip: rect(3px, 9999px, 2px, 0);
    }
    30% {
      clip: rect(92px, 9999px, 49px, 0);
    }
    35% {
      clip: rect(18px, 9999px, 36px, 0);
    }
    40% {
      clip: rect(51px, 9999px, 93px, 0);
    }
    45% {
      clip: rect(11px, 9999px, 7px, 0);
    }
    50% {
      clip: rect(66px, 9999px, 60px, 0);
    }
    55% {
      clip: rect(80px, 9999px, 4px, 0);
    }
    60% {
      clip: rect(39px, 9999px, 82px, 0);
    }
    65% {
      clip: rect(2px, 9999px, 96px, 0);
    }
    70% {
      clip: rect(100px, 9999px, 11px, 0);
    }
    75% {
      clip: rect(44px, 9999px, 53px, 0);
    }
    80% {
      clip: rect(76px, 9999px, 22px, 0);
    }
    85% {
      clip: rect(16px, 9999px, 88px, 0);
    }
    90% {
      clip: rect(58px, 9999px, 34px, 0);
    }
    95% {
      clip: rect(29px, 9999px, 65px, 0);
    }
    100% {
      clip: rect(91px, 9999px, 13px, 0);
    }
  }

  @keyframes glitch-anim2 {
    0% {
      clip: rect(65px, 9999px, 96px, 0);
    }
    5% {
      clip: rect(84px, 9999px, 3px, 0);
    }
    10% {
      clip: rect(15px, 9999px, 78px, 0);
    }
    15% {
      clip: rect(5px, 9999px, 19px, 0);
    }
    20% {
      clip: rect(98px, 9999px, 70px, 0);
    }
    25% {
      clip: rect(32px, 9999px, 45px, 0);
    }
    30% {
      clip: rect(12px, 9999px, 21px, 0);
    }
    35% {
      clip: rect(56px, 9999px, 83px, 0);
    }
    40% {
      clip: rect(89px, 9999px, 14px, 0);
    }
    45% {
      clip: rect(23px, 9999px, 59px, 0);
    }
    50% {
      clip: rect(47px, 9999px, 36px, 0);
    }
    55% {
      clip: rect(68px, 9999px, 92px, 0);
    }
    60% {
      clip: rect(1px, 9999px, 62px, 0);
    }
    65% {
      clip: rect(73px, 9999px, 48px, 0);
    }
    70% {
      clip: rect(26px, 9999px, 9px, 0);
    }
    75% {
      clip: rect(95px, 9999px, 75px, 0);
    }
    80% {
      clip: rect(38px, 9999px, 28px, 0);
    }
    85% {
      clip: rect(7px, 9999px, 50px, 0);
    }
    90% {
      clip: rect(54px, 9999px, 90px, 0);
    }
    95% {
      clip: rect(19px, 9999px, 63px, 0);
    }
    100% {
      clip: rect(81px, 9999px, 30px, 0);
    }
  }
`;

export default ErrorPage;
