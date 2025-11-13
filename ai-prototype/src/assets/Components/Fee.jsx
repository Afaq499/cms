import React, { useState, useEffect } from "react";
import "./Fee.css";
import { Sidebar } from "./Sidbar";
import { API_URL } from "./constants";

export function Fee() {
  const [fees, setFees] = useState([]);
  const [filteredFees, setFilteredFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'paid', 'pending'

  useEffect(() => {
    fetchFees();
  }, []);

  useEffect(() => {
    filterFees();
  }, [fees, filter]);

  const fetchFees = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/fees`);
      if (!response.ok) {
        throw new Error('Failed to fetch fees');
      }
      const data = await response.json();
      setFees(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching fees:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatAmount = (amount) => {
    return `Rs. ${amount.toLocaleString()}`;
  };

  const getStatusClass = (status) => {
    return status.toLowerCase() === 'paid' ? 'status-paid' : 'status-pending';
  };

  const filterFees = () => {
    if (filter === 'all') {
      setFilteredFees(fees);
    } else {
      setFilteredFees(fees.filter(fee => fee.status.toLowerCase() === filter));
    }
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  const getTotalAmount = (status) => {
    const filtered = status === 'all' ? fees : fees.filter(fee => fee.status.toLowerCase() === status);
    return filtered.reduce((total, fee) => total + fee.amount, 0);
  };

  if (loading) {
    return (
      <div className="feeLayout">
        <Sidebar />
        <div className="feeMain">
          <div className="feeHeader">
            <h3>My Account Book</h3>
            <div className="loading">Loading fees...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="feeLayout">
        <Sidebar />
        <div className="feeMain">
          <div className="feeHeader">
            <h3>My Account Book</h3>
            <div className="error">Error: {error}</div>
            <button onClick={fetchFees} className="retry-btn">Retry</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="feeLayout">
      <Sidebar />

      <div className="feeMain">
        <div className="feeHeader">
          <h3>My Account Book</h3>
          
          {/* Summary Cards */}
          <div className="feeSummary">
            <div className="summaryCard">
              <h4>Total Fees</h4>
              <p>{formatAmount(getTotalAmount('all'))}</p>
            </div>
            <div className="summaryCard paid">
              <h4>Paid</h4>
              <p>{formatAmount(getTotalAmount('paid'))}</p>
            </div>
            <div className="summaryCard pending">
              <h4>Pending</h4>
              <p>{formatAmount(getTotalAmount('pending'))}</p>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="feeFilters">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => handleFilterChange('all')}
            >
              All Fees ({fees.length})
            </button>
            <button 
              className={`filter-btn ${filter === 'paid' ? 'active' : ''}`}
              onClick={() => handleFilterChange('paid')}
            >
              Paid ({fees.filter(fee => fee.status.toLowerCase() === 'paid').length})
            </button>
            <button 
              className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
              onClick={() => handleFilterChange('pending')}
            >
              Pending ({fees.filter(fee => fee.status.toLowerCase() === 'pending').length})
            </button>
          </div>

          <div className="feeTableWrapper">
            <table>
              <thead>
                <tr>
                  <th>Fee Type</th>
                  <th>Amount</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Paid Date</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {filteredFees.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="no-data">No fees found</td>
                  </tr>
                ) : (
                  filteredFees.map((fee, index) => (
                    <tr key={fee._id || index}>
                      <td>{fee.feeType}</td>
                      <td>{formatAmount(fee.amount)}</td>
                      <td>{formatDate(fee.dueDate)}</td>
                      <td>
                        <span className={`status ${getStatusClass(fee.status)}`}>
                          {fee.status}
                        </span>
                      </td>
                      <td>{formatDate(fee.paidDate)}</td>
                      <td>{fee.remarks}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
