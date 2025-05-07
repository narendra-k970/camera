import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

interface VisitorLog {
  id: number;
  vid: number;
  vname: string;
  time: string;
}

const VisitorDetails: React.FC = () => {
  const { VisitorId } = useParams<{ VisitorId: string }>();
  const [logs, setLogs] = useState<VisitorLog[]>([]);
  const [name, setName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchVisitorLogs();
  }, []);

  const fetchVisitorLogs = async () => {
    try {
      const response = await axios.post(
        `http://13.233.68.233:8000/get_visitor_data?VisitorId=${VisitorId}`
      );
      if (response.data.status === "ok") {
        const data: VisitorLog[] = response.data.data;
        setLogs(data);
        if (data.length > 0) setName(data[0].vname);
      } else {
        alert("Failed to load visitor data.");
      }
    } catch (error) {
      console.error("Error fetching visitor data:", error);
      alert("An error occurred while fetching visitor logs.");
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    const csvHeaders = [
      "#",
      "Visitor ID",
      "Name",
      "Timestamp",
      "Formatted Time",
    ];
    const csvRows = logs.map((log, index) => [
      index + 1,
      log.vid,
      log.vname,
      log.time,
      new Date(log.time).toLocaleString(),
    ]);

    const csvContent = [csvHeaders, ...csvRows]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `visitor_${VisitorId}_logs.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div style={{ padding: "20px" }}>Loading...</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Visitor Details</h1>
      <h2 style={{ marginBottom: "20px" }}>Visitor: {name || "Unknown"}</h2>

      <Link
        to="/visitors"
        style={{ marginBottom: "20px", display: "inline-block" }}
      >
        ⬅️ Back to Visitors
      </Link>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "10px",
        }}
      >
        <button
          onClick={downloadCSV}
          style={{
            padding: "8px 12px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          ⬇️ Download CSV
        </button>
      </div>

      <table
        style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}
      >
        <thead>
          <tr style={{ backgroundColor: "#f0f0f0" }}>
            <th style={thStyle}>#</th>
            <th style={thStyle}>Timestamp</th>
            <th style={thStyle}>Formatted Time</th>
          </tr>
        </thead>
        <tbody>
          {logs.length > 0 ? (
            logs.map((log, index) => (
              <tr key={log.id}>
                <td style={tdStyle}>{index + 1}</td>
                <td style={tdStyle}>{log.time}</td>
                <td style={tdStyle}>{new Date(log.time).toLocaleString()}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td style={tdStyle} colSpan={3}>
                No logs found for this visitor.
              </td>
            </tr>
          )}
        </tbody>
      </table>
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

export default VisitorDetails;
