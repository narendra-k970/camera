import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { saveAs } from 'file-saver';

interface AttendanceDetail {
  date: string;
  entry: string[];
  exit: string[];
  hours: string; // string like "00:45"
}

const EmployeeDetails: React.FC = () => {
  const { emp_id } = useParams<{ emp_id: string }>();
  const [details, setDetails] = useState<AttendanceDetail[]>([]);
  const [filteredDetails, setFilteredDetails] = useState<AttendanceDetail[]>([]);
  const [name, setName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [totalMinutes, setTotalMinutes] = useState<number>(0);
  const [hourlyRate, setHourlyRate] = useState<number | null>(null);
  const [salary, setSalary] = useState<number | null>(null);
  const [showSalaryForm, setShowSalaryForm] = useState<boolean>(false);
  const [rateInput, setRateInput] = useState<string>("");

  useEffect(() => {
    fetchEmployeeDetails();
  }, []);

  useEffect(() => {
    calculateTotalMinutes(filteredDetails);
  }, [filteredDetails]);

  const fetchEmployeeDetails = async () => {
    try {
      const res = await axios.post(`http://13.233.68.233:8000/get_employee_hours_worked_by_date?EmpId=${emp_id}`);
      if (res.data) {
        setName(res.data.name);
        setDetails(res.data.details || []);
        setFilteredDetails(res.data.details || []);
      }
    } catch (error) {
      console.error("Failed to fetch employee details", error);
      alert("Error fetching employee attendance details.");
    } finally {
      setLoading(false);
    }
  };

  const filterByDate = () => {
    if (!fromDate || !toDate) {
      alert("Please select both From and To dates!");
      return;
    }

    const from = new Date(fromDate);
    const to = new Date(toDate);

    const filtered = details.filter((item) => {
      const itemDate = new Date(item.date);
      return itemDate >= from && itemDate <= to;
    });

    setFilteredDetails(filtered);
  };

  const calculateTotalMinutes = (records: AttendanceDetail[]) => {
    let total = 0;
    records.forEach((item) => {
      const parts = item.hours.split(":");
      const hr = parseInt(parts[0], 10);
      const min = parseInt(parts[1], 10);
      total += hr * 60 + min;
    });
    setTotalMinutes(total);
  };

  const handleSalarySubmit = () => {
    const rate = parseFloat(rateInput);
    if (isNaN(rate) || rate <= 0) {
      alert("Please enter a valid hourly salary.");
      return;
    }
    setHourlyRate(rate);
    const amount = (totalMinutes / 60) * rate;
    setSalary(Number(amount.toFixed(2)));
    setShowSalaryForm(false);
  };

  const downloadCSV = () => {
    let csv = "Date,Entry Times,Exit Times,Hours Worked\n";
    filteredDetails.forEach((item) => {
      csv += `="${item.date}","${item.entry.join(", ")}","${item.exit.join(", ")}","${item.hours}"\n`;
    });

    csv += `\nTotal Time (Minutes),${totalMinutes}`;
    if (salary !== null && hourlyRate !== null) {
      csv += `\nHourly Rate (₹),${hourlyRate}`;
      csv += `\nCalculated Salary (₹),${salary}`;
    }

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `${name.replace(/\s/g, "_")}_attendance.csv`);
  };

  if (loading) return <div style={{ padding: "20px" }}>Loading...</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Attendance Details</h1>
      <h2 style={{ marginBottom: "20px", color: "#333" }}>Employee: {name || "Name not available"}</h2>

      <Link to="/employee" style={{ marginBottom: "20px", display: "inline-block" }}>
        ⬅️ Back to Employees
      </Link>

      <div style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <label>
            From:
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              style={inputStyle}
            />
          </label>
          <label style={{ marginLeft: "10px" }}>
            To:
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              style={inputStyle}
            />
          </label>
          <button onClick={filterByDate} style={filterButtonStyle}>
            Apply Filter
          </button>
        </div>
        <div>
          <button onClick={downloadCSV} style={downloadButtonStyle}>
            Download CSV
          </button>
        </div>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
        <thead>
          <tr style={{ backgroundColor: "#f0f0f0" }}>
            <th style={thStyle}>Date</th>
            <th style={thStyle}>Entry Times</th>
            <th style={thStyle}>Exit Times</th>
            <th style={thStyle}>Hours Worked</th>
          </tr>
        </thead>
        <tbody>
          {filteredDetails.length > 0 ? (
            filteredDetails.map((item, index) => (
              <tr key={index}>
                <td style={tdStyle}>{item.date}</td>
                <td style={tdStyle}>{item.entry.join(", ")}</td>
                <td style={tdStyle}>{item.exit.join(", ")}</td>
                <td style={tdStyle}>{item.hours}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td style={tdStyle} colSpan={4}>No attendance records found.</td>
            </tr>
          )}
        </tbody>
      </table>

      <div style={{ marginTop: "20px", fontWeight: "bold" }}>
        Total Time Worked: {totalMinutes} minutes
      </div>

      {!showSalaryForm ? (
        <button onClick={() => setShowSalaryForm(true)} style={salaryButtonStyle}>
          💰 Calculate Salary
        </button>
      ) : (
        <div style={{ marginTop: "10px" }}>
          <input
            type="number"
            placeholder="Enter hourly salary"
            value={rateInput}
            onChange={(e) => setRateInput(e.target.value)}
            style={inputStyle}
          />
          <button onClick={handleSalarySubmit} style={filterButtonStyle}>Submit</button>
        </div>
      )}

      {salary !== null && (
        <div style={{ marginTop: "10px", fontWeight: "bold" }}>
          Estimated Salary: ₹{salary}
        </div>
      )}
    </div>
  );
};

const thStyle: React.CSSProperties = {
  padding: "8px",
  border: "1px solid #ccc",
  textAlign: "left",
};

const tdStyle: React.CSSProperties = {
  padding: "8px",
  border: "1px solid #ddd",
};

const inputStyle: React.CSSProperties = {
  padding: "5px",
  marginLeft: "5px",
};

const filterButtonStyle: React.CSSProperties = {
  padding: "6px 12px",
  marginLeft: "10px",
  backgroundColor: "#cce5ff",
  border: "1px solid #99c2ff",
  cursor: "pointer",
  borderRadius: "4px",
};

const downloadButtonStyle: React.CSSProperties = {
  padding: "8px 16px",
  backgroundColor: "#28a745",
  border: "none",
  color: "white",
  borderRadius: "4px",
  cursor: "pointer",
};

const salaryButtonStyle: React.CSSProperties = {
  marginTop: "10px",
  padding: "8px 16px",
  backgroundColor: "#ffc107",
  border: "none",
  color: "#000",
  borderRadius: "4px",
  cursor: "pointer",
};

export default EmployeeDetails;
