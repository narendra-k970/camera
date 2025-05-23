import React, { useEffect, useState } from "react";
import axios from "axios";
import { Pencil, Trash2, Check, X, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Visitor {
  id: string;
  name: string;
  type: string;
  status?: string;
}

const Visitors: React.FC = () => {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<Visitor>({
    id: "",
    name: "",
    type: "",
    status: "",
  });

  const [currentPage, setCurrentPage] = useState<number>(1);
  const entriesPerPage = 10;

  const navigate = useNavigate();

  useEffect(() => {
    fetchVisitors();
  }, []);

  const fetchVisitors = () => {
    axios
      .post("http://13.233.68.233:8000/get_all_visitors")
      .then((res) => {
        setVisitors(res.data.visitors);
      })
      .catch((err) => {
        console.error("Failed to fetch visitors", err);
        alert("Failed to fetch visitor data");
      });
  };

  const handleEdit = (visitor: Visitor) => {
    setEditingId(visitor.id);
    setEditedData({ ...visitor });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditedData({ id: "", name: "", type: "", status: "" });
  };

  const handleSave = async () => {
    try {
      const { id, name, type, status } = editedData;

      const url = `http://13.233.68.233:8000/update_visitor_status?visitor_id=${encodeURIComponent(
        id
      )}&name=${encodeURIComponent(name)}&visitor_type=${encodeURIComponent(
        type
      )}&status=${encodeURIComponent(status || "")}`;

      await axios.post(url);

      alert("Details updated successfully");
      setEditingId(null);
      setEditedData({ id: "", name: "", type: "", status: "" });
      fetchVisitors();
    } catch (error: any) {
      console.error("Failed to update visitor", error);
      alert("Something went wrong while updating: " + error.message);
    }
  };

  const handleChange = (field: keyof Visitor, value: string) => {
    setEditedData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this visitor?")) return;

    try {
      await axios.post(`http://13.233.68.233:8000/delete_visitor?visitor_id=${id}`);
      alert("Visitor deleted successfully");
      fetchVisitors();
    } catch (error: any) {
      console.error("Failed to delete visitor", error);
      alert("Something went wrong while deleting: " + error.message);
    }
  };

  const handleViewDetails = (id: string) => {
    navigate(`/getvisitordata/${id}`);
  };

  // Pagination logic
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = visitors.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(visitors.length / entriesPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ fontSize: "24px", marginBottom: "20px" }}>All Visitors</h1>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#f0f0f0" }}>
            <th style={thStyle}>ID</th>
            <th style={thStyle}>Name</th>
            <th style={thStyle}>Type</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentEntries.map((visitor) => (
            <tr key={visitor.id}>
              <td style={tdStyle}>{visitor.id}</td>
              <td style={tdStyle}>
                {editingId === visitor.id ? (
                  <input
                    value={editedData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                  />
                ) : (
                  visitor.name
                )}
              </td>
              <td style={tdStyle}>
                {editingId === visitor.id ? (
                  <input
                    value={editedData.type}
                    onChange={(e) => handleChange("type", e.target.value)}
                  />
                ) : (
                  visitor.type
                )}
              </td>
              <td style={tdStyle}>
                {editingId === visitor.id ? (
                  <input
                    value={editedData.status || ""}
                    onChange={(e) => handleChange("status", e.target.value)}
                  />
                ) : (
                  visitor.status || "Not Assigned"
                )}
              </td>
              <td style={tdStyle1}>
                {editingId === visitor.id ? (
                  <>
                    <button onClick={handleSave} style={editButtonStyle}>
                      <Check size={16} />
                    </button>
                    <button onClick={handleCancel} style={deleteButtonStyle}>
                      <X size={16} />
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleEdit(visitor)} style={editButtonStyle}>
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => handleDelete(visitor.id)} style={deleteButtonStyle}>
                      <Trash2 size={16} />
                    </button>
                    <button onClick={() => handleViewDetails(visitor.id)} style={viewButtonStyle}>
                      <Eye size={16} /> View
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div style={paginationContainerStyle}>
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index + 1}
            onClick={() => paginate(index + 1)}
            style={{
              ...paginationButtonStyle,
              backgroundColor: currentPage === index + 1 ? "#007bff" : "#fff",
              color: currentPage === index + 1 ? "#fff" : "#000",
            }}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

const thStyle: React.CSSProperties = {
  padding: "5px",
  border: "1px solid #ccc",
  textAlign: "left",
};

const tdStyle: React.CSSProperties = {
  padding: "5px",
  border: "1px solid #ddd",
};

const tdStyle1: React.CSSProperties = {
  padding: "5px",
  display: "flex",
  border: "1px solid #ddd",
};

const editButtonStyle: React.CSSProperties = {
  marginRight: "8px",
  padding: "6px 10px",
  backgroundColor: "#e0e0ff",
  border: "1px solid #999",
  borderRadius: "4px",
  cursor: "pointer",
};

const deleteButtonStyle: React.CSSProperties = {
  marginRight: "8px",
  padding: "6px 10px",
  backgroundColor: "#ffe0e0",
  border: "1px solid #999",
  borderRadius: "4px",
  cursor: "pointer",
};

const viewButtonStyle: React.CSSProperties = {
  padding: "6px 10px",
  backgroundColor: "#e0ffe0",
  border: "1px solid #999",
  borderRadius: "4px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
};

const paginationContainerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  marginTop: "20px",
};

const paginationButtonStyle: React.CSSProperties = {
  marginLeft: "5px",
  padding: "6px 12px",
  border: "1px solid #ccc",
  borderRadius: "4px",
  cursor: "pointer",
};

export default Visitors;
