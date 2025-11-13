import React from "react";
import { Link } from "react-router-dom";
import "./Student.css";
import { Sidebar } from "./Sidbar";


export function Student() {
  return (
    <>
      <div className="studentLayout">

        <div className="studentmain">
          <h1>My Course</h1>
          <div className="two-cols">

            <div className="col-box">
              <div className="stud-Header">
                <h2>Cs505 - Virtual System and Services</h2><br />
                <p>Computer Science/Information Technology</p><br />
                <p>3 Credits Hours</p>
              </div>

              <div className="stud-profile two-cols">
                <img src="/images/man.png" alt="Error found" width={60} height={60} />
                <h2>Dr Mustaq Hussain</h2>
                <p>Phd, Ms, Ms, Ms</p>
                <p>Shanghai University, Riphah International, , Tech. University of Berlin</p>
                <Link to="./watched">
                  <button type="button" className="watched-btn">
                    <img src="/images/video.png" alt="Error found" />
                  </button>
                </Link>

              </div>
              <hr />

              <div className="stud-image">
                <a href="/assignment">
                  <img src="/images/assignment.png" alt="Assignment" width={60} height={60} />
                </a>
                <a href="/gdb">
                  <img src="/images/gdb.png" alt="GDB" width={60} height={60} />
                </a>
                <a href="/quiz">
                  <img src="/images/quiz.png" alt="Quiz" width={60} height={60} />
                </a>
                <a href="/announce">
                  <img src="/images/announce.png" alt="Announcement" width={60} height={60} />
                </a>
              </div>

            </div>

            <div className="col-box">
              <div className="stud-Header">
                <h2>Cs505p - Virtual System and Services</h2><br />
                <p>Computer Science/Information Technology</p><br />
                <p>3 Credits Hours</p>
              </div>

              <div className="stud-profile two-cols">
                <img src="/images/man.png" alt="Error found" width={60} height={60} />
                <h2>Dr Mustaq Hussain</h2>
                <p>Phd, Ms, Ms, Ms</p>
                <p>Shanghai University, Riphah International, , Tech. University of Berlin</p>
                <Link to="./watched">
                  <button type="button" className="watched-btn">
                    <img src="/images/video.png" alt="Error found" />
                  </button>
                </Link>

              </div>
              <hr />

              <div className="stud-image">
                <a href="/assignment">
                  <img src="/images/assignment.png" alt="Assignment" width={60} height={60} />
                </a>
                <a href="/gdb">
                  <img src="/images/gdb.png" alt="GDB" width={60} height={60} />
                </a>
                <a href="/quiz">
                  <img src="/images/quiz.png" alt="Quiz" width={60} height={60} />
                </a>
                <a href="/announce">
                  <img src="/images/announce.png" alt="Announcement" width={60} height={60} />
                </a>
              </div>
            </div>
          </div>

          <div className="two-cols">

            <div className="col-box">
              <div className="stud-Header">
                <h2>IT601 - System and Network Administration</h2><br />
                <p>Computer Science/Information Technology</p><br />
                <p>1 Credits Hours</p>
              </div>

              <div className="stud-profile two-cols">
                <img src="/images/man.png" alt="Error found" width={60} height={60} />
                <h2>Dr Arif Husen Rashid</h2>
                <p>Phd</p>
                <p>COMSATS University Islamabad, Lahore, Pakistan</p>
                <Link to="./watched">
                  <button type="button" className="watched-btn">
                    <img src="/images/video.png" alt="Error found" />
                  </button>
                </Link>

              </div>
              <hr />

              <div className="stud-image">
                <a href="/assignment">
                  <img src="/images/assignment.png" alt="Assignment" width={60} height={60} />
                </a>
                <a href="/gdb">
                  <img src="/images/gdb.png" alt="GDB" width={60} height={60} />
                </a>
                <a href="/quiz">
                  <img src="/images/quiz.png" alt="Quiz" width={60} height={60} />
                </a>
                <a href="/announce">
                  <img src="/images/announce.png" alt="Announcement" width={60} height={60} />
                </a>
              </div>

            </div>

            <div className="col-box">
              <div className="stud-Header">
                <h2>IT601p - System and Network Administration</h2><br />
                <p>Computer Science/Information Technology</p><br />
                <p>1 Credits Hours</p>
              </div>

              <div className="stud-profile two-cols">
                <img src="/images/man.png" alt="Error found" width={60} height={60} />
                <h2>Dr Arif Husen Rashid</h2>
                <p>Phd</p>
                <p>COMSATS University Islamabad, Lahore, Pakistan</p>
                <Link to="./watched">
                  <button type="button" className="watched-btn">
                    <img src="/images/video.png" alt="Error found" />
                  </button>
                </Link>

              </div>
              <hr />

              <div className="stud-image">
                <a href="/assignment">
                  <img src="/images/assignment.png" alt="Assignment" width={60} height={60} />
                </a>
                <a href="/gdb">
                  <img src="/images/gdb.png" alt="GDB" width={60} height={60} />
                </a>
                <a href="/quiz">
                  <img src="/images/quiz.png" alt="Quiz" width={60} height={60} />
                </a>
                <a href="/announce">
                  <img src="/images/announce.png" alt="Announcement" width={60} height={60} />
                </a>
              </div>
            </div>

          </div>

          <div className="two-cols">

            <div className="col-box">
              <div className="stud-Header">
                <h2>Cs521 - Web System and Technologies</h2><br />
                <p>Computer Science/Information Technology</p><br />
                <p>3 Credits Hours</p>
              </div>

              <div className="stud-profile two-cols">
                <img src="/images/man.png" alt="Error found" width={60} height={60} />
                <h2>Dr Safi ullah</h2>
                <p>Phd</p>
                <Link to="./watched">
                  <button type="button" className="watched-btn">
                    <img src="/images/video.png" alt="Error found" />
                  </button>
                </Link>

              </div>
              <hr />

              <div className="stud-image">
                <a href="/assignment">
                  <img src="/images/assignment.png" alt="Assignment" width={60} height={60} />
                </a>
                <a href="/gdb">
                  <img src="/images/gdb.png" alt="GDB" width={60} height={60} />
                </a>
                <a href="/quiz">
                  <img src="/images/quiz.png" alt="Quiz" width={60} height={60} />
                </a>
                <a href="/announce">
                  <img src="/images/announce.png" alt="Announcement" width={60} height={60} />
                </a>
              </div>

            </div>

            <div className="col-box">
              <div className="stud-Header">
                <h2>Cs619 - Final Project</h2><br />
                <p>Project/Thesis/Internship</p><br />
                <p>6 Credits Hours</p>
              </div>

              <div className="stud-profile two-cols">
                <img src="/images/woman.png" alt="Error found" width={60} height={60} />
                <h2>Dr Saima</h2>
                <p>Phd, Ms, Ms, Ms</p>
                <p>Shanghai University, Riphah International, , Tech. University of Berlin</p>
                <Link to="./watched">
                  <button type="button" className="watched-btn">
                    <img src="/images/video.png" alt="Error found" />
                  </button>
                </Link>

              </div>
              <hr />

              <div className="stud-image">
                <a href="/assignment">
                  <img src="/images/assignment.png" alt="Assignment" width={60} height={60} />
                </a>
                <a href="/gdb">
                  <img src="/images/gdb.png" alt="GDB" width={60} height={60} />
                </a>
                <a href="/quiz">
                  <img src="/images/quiz.png" alt="Quiz" width={60} height={60} />
                </a>
                <a href="/announce">
                  <img src="/images/announce.png" alt="Announcement" width={60} height={60} />
                </a>
              </div>

            </div>

          </div>

        </div>
      </div>
      <Sidebar />;
    </>
  );
}
