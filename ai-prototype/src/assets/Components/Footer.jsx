import React from "react";
import "./Footer.css"

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-item">
          <img
            src="/images/dashboard.png"
            alt="Image not found"
            width={50}
            height={50}
          />
        </div>

        <div className="footer-item">
          <a href="http://">
            <img src="/images/call.png" alt="Contact" width={30} height={30} />
          </a>
          <span>Contact</span>
        </div>

        <div className="footer-item">
          <a href="http://">
            <img src="/images/help.png" alt="Help" width={40} height={40} />
          </a>
          <span>Help</span>
        </div>

        <div className="footer-item">
          <a href="https://www.facebook.com/">
            <img src="/images/facebook.png" alt="Facebook" width={40} height={40} />
          </a>
        </div>

        <div className="footer-item">
          <a href="http://">
            <img src="/images/gmail.png" alt="Gmail" width={40} height={40} />
          </a>
        </div>
      </div>
    </footer>
  );
}
