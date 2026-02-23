
import React, { useState } from 'react';
import { X, UserPlus, CheckCircle2 } from 'lucide-react';

const AddEmployeeModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const [formData, setFormData] = useState({
        fullName: '',
        employeeId: '',
        email: '',
        mobile: '',
        departmentId: '', // Changed from department to departmentId
        roleId: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [roles, setRoles] = useState([]);

    // Fetch departments and roles on mount
    React.useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Departments
                const deptResponse = await fetch('/api/department');
                if (deptResponse.ok) {
                    const deptData = await deptResponse.json();
                    setDepartments(deptData);
                }

                // Fetch Roles
                const roleResponse = await fetch('/api/roles');
                if (roleResponse.ok) {
                    const roleData = await roleResponse.json();
                    setRoles(roleData);
                }
            } catch (err) {
                console.error('Failed to fetch data:', err);
            }
        };
        fetchData();
    }, []);

    const handleSubmit = async () => {
        // Validation
        if (!formData.fullName || !formData.employeeId || !formData.email || !formData.mobile || !formData.departmentId || !formData.roleId) {
            setError('All fields are required.');
            return;
        }

        if (!/^\d+$/.test(formData.employeeId)) {
            setError('Employee ID must be a number.');
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            setError('Please enter a valid email address.');
            return;
        }

        if (!/^\d{10}$/.test(formData.mobile)) {
            setError('Mobile number must be exactly 10 digits.');
            return;
        }



        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/employees', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create employee');
            }

            alert('Employee created successfully!');
            onClose();
        } catch (err) {
            setError(err.message);
            console.error('Error submitting form:', err);
        } finally {
            setLoading(false);
        }
    };



    const sectionLabelStyle = {
        color: 'var(--accent-green)',
        fontSize: '0.75rem',
        fontWeight: '700',
        letterSpacing: '0.05em',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    };

    const lineStyle = {
        flex: 1,
        height: '1px',
        backgroundColor: '#333',
        marginLeft: '12px'
    };

    const labelStyle = {
        display: 'block',
        fontSize: '0.85rem',
        color: 'var(--text-secondary)',
        marginBottom: '8px',
        fontWeight: '500'
    };

    const inputStyle = {
        width: '100%',
        backgroundColor: '#16191D', // Slightly darker than card
        border: '1px solid #333',
        borderRadius: '4px',
        padding: '10px 12px',
        color: '#fff',
        fontSize: '0.9rem',
        outline: 'none',
        fontFamily: 'inherit'
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: '#0E1115',
                border: '1px solid #333',
                borderRadius: '12px',
                width: '600px',
                maxWidth: '95vw',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(180, 244, 0, 0.1)'
            }}>
                {/* Header */}
                <div style={{ padding: '24px 24px 20px', borderBottom: '1px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#1A2E05', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <UserPlus size={20} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#fff', margin: '0 0 4px 0' }}>Add New Employee</h2>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Configure identity and system permissions for a new hire.</p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: '24px' }}>

                    {/* Basic Info */}
                    <div style={sectionLabelStyle}>BASIC INFORMATION <span style={lineStyle}></span></div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                        <div>
                            <label style={labelStyle}>Full Name</label>
                            <input
                                type="text"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Employee ID</label>
                            <input
                                type="text"
                                value={formData.employeeId}
                                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                                style={inputStyle}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <label style={labelStyle}>Email Address</label>
                        <input
                            type="text"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            style={inputStyle}
                        />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <label style={labelStyle}>Mobile Number</label>
                        <input
                            type="text"
                            value={formData.mobile}
                            maxLength={10}
                            placeholder="10-digit mobile number"
                            onChange={(e) => {
                                const val = e.target.value;
                                if (/^\d*$/.test(val)) {
                                    setFormData({ ...formData, mobile: val });
                                }
                            }}
                            style={inputStyle}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
                        <div>
                            <label style={labelStyle}>Department</label>
                            <div style={{ position: 'relative' }}>
                                <select
                                    style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
                                    value={formData.departmentId}
                                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value, roleId: '' })}
                                >
                                    <option value="" disabled>Select Department</option>
                                    {departments.map((dept) => (
                                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                                    ))}
                                </select>
                                <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#666', fontSize: '0.7rem' }}>▼</div>
                            </div>
                        </div>
                        <div>
                            <label style={labelStyle}>Role</label>
                            <div style={{ position: 'relative' }}>
                                <select
                                    style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
                                    value={formData.roleId}
                                    onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                                >
                                    <option value="" disabled>Select Role</option>
                                    {roles.filter(r => r.departmentId == formData.departmentId).map((r) => (
                                        <option key={r.id} value={r.id}>{r.name}</option>
                                    ))}
                                </select>
                                <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#666', fontSize: '0.7rem' }}>▼</div>
                            </div>
                        </div>
                    </div>



                </div>

                {/* Footer */}
                <div style={{ padding: '20px 24px', borderTop: '1px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0B0D10', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.9rem', padding: '8px 16px' }}>
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        style={{
                            backgroundColor: loading ? '#555' : 'var(--accent-green)',
                            color: '#000',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '10px 24px',
                            fontSize: '0.9rem',
                            fontWeight: '700',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}>
                        {loading ? 'Creating...' : 'Create Employee'} <CheckCircle2 size={16} fill="#000" color={loading ? '#555' : "var(--accent-green)"} />
                    </button>
                </div>
                {error && <div style={{ padding: '0 24px 20px', color: '#ff6b6b', fontSize: '0.9rem' }}>{error}</div>}
            </div>
        </div>
    );
};

export default AddEmployeeModal;
