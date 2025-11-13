import React from "react";
import { Link } from "react-router-dom";
import "./Assignment.css";
import { Sidebar } from "./Sidbar";

export function Quiz() {
  return (
    <>

      <div className="assignmentmain">
        <h3>CS505 - Virtual Systems and Services</h3>
        <div className="assignmentcolor">
          <h3> Quiz </h3>

          <div className="assignmentdiv">
            <table border="1" cellPadding="8" cellSpacing="0">
              <thead>
                <tr>
                  <th>Quiz</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Total Marks</th>
                  <th>Submit</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Quiz # 01</td>
                  <td>12 aug 2025</td>
                  <td>15 aug 2025</td>
                  <td>10 Marks</td>
                  <td>Submitted</td>
                  <td>8</td>
                </tr>
                <tr>
                  <td>Quiz # 02</td>
                  <td> 18 aug 2025</td>
                  <td>21 aug 2025</td>
                  <td>10 Marks</td>
                  <td>Submitted</td>
                  <td>9</td>
                </tr>
                <tr>
                  <td>Quiz # 03</td>
                  <td>4 sept 2025</td>
                  <td>5 sept 2025</td>
                  <td>10 Marks</td>
                  <td>Pending</td>
                  <td></td>
                </tr>
                <tr>
                  <td>Quiz # 04</td>
                  <td>10 sept 2025</td>
                  <td>12 sept 2025</td>
                  <td>20 Marks</td>
                  <td>Pending</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Sidebar />
    </>
  );
};