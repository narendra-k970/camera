import React, { useEffect, useState } from "react";
import axios from "axios";
import { Pencil, Trash2, Check, X } from "lucide-react";

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

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = () => {
    axios
      .post("http://52.66.236.1:8000/get_all_employees")
      .then((res) => {
        setEmployees(res.data.employees);
      })
      .catch((err) => {
        console.error("Failed to fetch employees", err);
      });
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

      const url = `http://52.66.236.1:8000/update_employee_status?emp_id=${id}&name=${encodeURIComponent(
        name
      )}&department=${encodeURIComponent(
        department
      )}&status=${encodeURIComponent(status || "")}`;

      await axios.post(url);

      alert("Details updated successfully");
      setEditingId(null);
      setEditedData({ id: "", name: "", department: "", status: "" });
      fetchEmployees();
    } catch (error: any) {
      console.error("Failed to update employee", error);
      alert("Something went wrong while updating: " + error.message);
    }
  };

  const handleChange = (field: keyof Employee, value: string) => {
    setEditedData((prev) => ({ ...prev, [field]: value }));
  };
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this employee?"))
      return;

    try {
      await axios.post(`http://52.66.236.1:8000/delete_employee?emp_id=${id}`);
      alert("Employee deleted successfully");
      fetchEmployees();
    } catch (error: any) {
      console.error("Failed to delete employee", error);
      alert("Something went wrong while deleting: " + error.message);
    }
  };

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
          {employees.map((emp) => (
            <tr key={emp.id}>
              <td style={tdStyle}>{emp.id}</td>
              <td style={tdStyle}>
                {editingId === emp.id ? (
                  <input
                    value={editedData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                  />
                ) : (
                  emp.name
                )}
              </td>
              <td style={tdStyle}>
                {editingId === emp.id ? (
                  <input
                    value={editedData.department}
                    onChange={(e) => handleChange("department", e.target.value)}
                  />
                ) : (
                  emp.department
                )}
              </td>
              <td style={tdStyle}>
                {editingId === emp.id ? (
                  <input
                    value={editedData.status || ""}
                    onChange={(e) => handleChange("status", e.target.value)}
                  />
                ) : (
                  emp.status || "Not Assigned"
                )}
              </td>
              <td style={tdStyle}>
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
                    <button
                      onClick={() => handleEdit(emp)}
                      style={editButtonStyle}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(emp.id)}
                      style={deleteButtonStyle}
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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

const editButtonStyle: React.CSSProperties = {
  marginRight: "8px",
  padding: "6px 10px",
  backgroundColor: "#e0e0ff",
  border: "1px solid #999",
  borderRadius: "4px",
  cursor: "pointer",
};

const deleteButtonStyle: React.CSSProperties = {
  padding: "6px 10px",
  backgroundColor: "#ffe0e0",
  border: "1px solid #999",
  borderRadius: "4px",
  cursor: "pointer",
};

export default Employee;
