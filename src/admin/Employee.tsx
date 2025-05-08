import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Pencil, Trash2, Check, X, Eye } from "lucide-react";

interface Employee {
  id: string;
  name: string;
  department: string;
  status?: string;
}

const Employee: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<Employee>({
    id: "",
    name: "",
    department: "",
    status: "",
  });

  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await axios.post("http://13.233.68.233:8000/get_all_employees");
      setEmployees(res.data.employees);
    } catch (err) {
      console.error("Failed to fetch employees", err);
      alert("Failed to fetch employee data");
    }
  };

  const handleEdit = (emp: Employee) => {
    setEditingId(emp.id);
    setEditedData({ ...emp });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditedData({ id: "", name: "", department: "", status: "" });
  };

  const handleSave = async () => {
    try {
      const { id, name, department, status } = editedData;
      const url = `http://13.233.68.233:8000/update_employee_status?emp_id=${id}&name=${encodeURIComponent(
        name
      )}&department=${encodeURIComponent(department)}&status=${encodeURIComponent(status || "")}`;

      await axios.post(url);
      alert("Details updated successfully");
      setEditingId(null);
      setEditedData({ id: "", name: "", department: "", status: "" });
      fetchEmployees();
    } catch (error: any) {
      console.error("Failed to update employee", error);
      alert("Error updating: " + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;

    try {
      await axios.post(`http://13.233.68.233:8000/delete_employee?emp_id=${id}`);
      alert("Employee deleted successfully");
      fetchEmployees();
    } catch (error: any) {
      console.error("Failed to delete employee", error);
      alert("Error deleting: " + error.message);
    }
  };

  const handleViewDetails = (id: string) => {
    navigate(`/get_employee_hours_worked_by_date/${id}`);
  };

  // Pagination logic
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentEmployees = employees.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(employees.length / itemsPerPage);

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ fontSize: "24px", marginBottom: "20px" }}>All Employees</h1>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#f0f0f0" }}>
            <th style={thStyle}>ID</th>
            <th style={thStyle}>Name</th>
            <th style={thStyle}>Department</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentEmployees.map((emp) => (
            <tr key={emp.id}>
              <td style={tdStyle}>{emp.id}</td>
              <td style={tdStyle}>
                {editingId === emp.id ? (
                  <input
                    value={editedData.name}
                    onChange={(e) =>
                      setEditedData((prev) => ({ ...prev, name: e.target.value }))
                    }
                  />
                ) : (
                  emp.name
                )}
              </td>
              <td style={tdStyle}>
                {editingId === emp.id ? (
                  <input
                    value={editedData.department}
                    onChange={(e) =>
                      setEditedData((prev) => ({ ...prev, department: e.target.value }))
                    }
                  />
                ) : (
                  emp.department
                )}
              </td>
              <td style={tdStyle}>
                {editingId === emp.id ? (
                  <input
                    value={editedData.status || ""}
                    onChange={(e) =>
                      setEditedData((prev) => ({ ...prev, status: e.target.value }))
                    }
                  />
                ) : (
                  emp.status || "Not Assigned"
                )}
              </td>
              <td style={tdStyle1}>
                {editingId === emp.id ? (
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
                    <button onClick={() => handleEdit(emp)} style={editButtonStyle}>
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => handleDelete(emp.id)} style={deleteButtonStyle}>
                      <Trash2 size={16} />
                    </button>
                    <button onClick={() => handleViewDetails(emp.id)} style={viewButtonStyle}>
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
      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          style={paginationButtonStyle}
        >
          ⬅ Prev
        </button>
        <span style={{ margin: "0 10px" }}>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          style={paginationButtonStyle}
        >
          Next ➡
        </button>
      </div>
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

const tdStyle1: React.CSSProperties = {
  padding: "8px",
  display: "flex",
  gap: "5px",
  border: "1px solid #ddd",
};

const editButtonStyle: React.CSSProperties = {
  padding: "6px",
  backgroundColor: "#e0e0ff",
  border: "1px solid #999",
  borderRadius: "4px",
  cursor: "pointer",
};

const deleteButtonStyle: React.CSSProperties = {
  padding: "6px",
  backgroundColor: "#ffe0e0",
  border: "1px solid #999",
  borderRadius: "4px",
  cursor: "pointer",
};

const viewButtonStyle: React.CSSProperties = {
  padding: "6px",
  backgroundColor: "#e0ffe0",
  border: "1px solid #999",
  borderRadius: "4px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
};

const paginationButtonStyle: React.CSSProperties = {
  padding: "6px 12px",
  margin: "0 5px",
  backgroundColor: "#f0f0f0",
  border: "1px solid #ccc",
  borderRadius: "4px",
  cursor: "pointer",
};

export default Employee;
