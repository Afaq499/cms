import React from "react";
import { Sidebar } from "./Sidbar";
import "./Gdb.css";

export function Gdb() {
  return (
    <>
      <Sidebar />
      <div className="gdbMain">
        <h3>CS505 - Virtual Systems and Services</h3>

        <div className="gdbColor">
          <h3>Graded Discussion Board (GDB)</h3>
        </div>

        <div className="gdbSection">
          <table>
            <thead>
              <tr>
                <th>GDB</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Total Marks</th>
                <th>Status</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>GDB # 01</td>
                <td>12 Aug 2025</td>
                <td>15 Aug 2025</td>
                <td>20</td>
                <td>Submitted</td>
                <td>16</td>
              </tr>
              <tr>
                <td>GDB # 02</td>
                <td>25 Aug 2025</td>
                <td>28 Aug 2025</td>
                <td>20</td>
                <td>Submitted</td>
                <td>18</td>
              </tr>
              <tr>
                <td>GDB # 03</td>
                <td>5 Sept 2025</td>
                <td>7 Sept 2025</td>
                <td>20</td>
                <td>Pending</td>
                <td>-</td>
              </tr>
              <tr>
                <td>GDB # 04</td>
                <td>15 Sept 2025</td>
                <td>17 Sept 2025</td>
                <td>25</td>
                <td>Pending</td>
                <td>-</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
