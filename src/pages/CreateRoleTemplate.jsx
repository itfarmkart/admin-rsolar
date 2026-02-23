import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Users, Rocket, Settings, Info, Lock, ChevronDown, Save, ArrowLeft, Shield } from 'lucide-react';

const CreateRoleTemplate = () => {
    console.log('Rendering CreateRoleTemplate');
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;
    const [roleName, setRoleName] = useState('');
    const [department, setDepartment] = useState('');
    const [departments, setDepartments] = useState([]);

    // Permission State
    const [permissions, setPermissions] = useState({
        crm: {
            enabled: false,
            modules: [
                { id: 'customers', name: 'Customers', view: false, edit: false },
                { id: 'operations', name: 'O & M', view: false, edit: false },
                { id: 'tickets', name: 'Tickets', view: false, edit: false },
            ]
        },
        missionControl: {
            enabled: false,
            stages: [
                { id: '00-chc', name: 'CHC Marketing', enabled: false },
                { id: '01-sales', name: 'S Sales', enabled: false },
                { id: '01-dd-agree', name: 'DD Agreement', enabled: false },
                { id: '02-dd-nt', name: 'DD NT Doc', enabled: false },
                { id: '02-mpeb', name: 'MPEB NT', enabled: false },
                { id: '02-dd-sub', name: 'DD Subsidy & Loan', enabled: false },
                { id: 'payment', name: 'Payment Collection', enabled: false },
                { id: '03-design', name: 'Design & Eng', enabled: false },
                { id: '04-delivery', name: 'Delivery & Install', enabled: false },
                { id: '05-mpeb-li', name: 'MPEB LI/Meter', enabled: false },
                { id: '06-post', name: 'Post-Insp', enabled: false },
            ]
        },
        adminPanel: {
            enabled: false,
            configs: [
                {
                    id: 'user-mgmt',
                    name: 'Employee Management',
                    enabled: false,
                    icon: Users
                },
                {
                    id: 'role-config',
                    name: 'Role Configuration',
                    enabled: false,
                    icon: Settings
                },
            ]
        }
    });

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // Fetch Departments
                const deptRes = await fetch('/api/department');
                if (deptRes.ok) {
                    const data = await deptRes.json();
                    setDepartments(data);
                }

                // If Edit Mode, Fetch Role Data
                if (isEditMode) {
                    console.log('Fetching role data for ID:', id);
                    const roleRes = await fetch(`/api/roles/${id}`);
                    if (roleRes.ok) {
                        const roleData = await roleRes.json();
                        setRoleName(roleData.name);
                        setDepartment(roleData.departmentName || '');

                        // Populate Permissions
                        if (roleData.permissions) {
                            console.time('setPermissions');
                            setPermissions(prev => {
                                const newPermissions = { ...prev };

                                // Merge fetched permissions
                                if (roleData.permissions.crm) {
                                    newPermissions.crm = { ...newPermissions.crm, ...roleData.permissions.crm };
                                }
                                if (roleData.permissions.missionControl) {
                                    newPermissions.missionControl = { ...newPermissions.missionControl, ...roleData.permissions.missionControl };
                                }
                                if (roleData.permissions.adminPanel) {
                                    newPermissions.adminPanel = { ...newPermissions.adminPanel, ...roleData.permissions.adminPanel };
                                }

                                return newPermissions;
                            });
                            console.timeEnd('setPermissions');
                        }
                    } else {
                        console.error('Failed to fetch role details');
                    }
                }
            } catch (error) {
                console.error('Error fetching initial data:', error);
            }
        };

        fetchInitialData();
    }, [id, isEditMode]);

    const toggleSection = (section) => {
        setPermissions(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                enabled: !prev[section].enabled
            }
        }));
    };

    const toggleCrmModule = (moduleId, field) => {
        setPermissions(prev => ({
            ...prev,
            crm: {
                ...prev.crm,
                modules: prev.crm.modules.map(m =>
                    m.id === moduleId ? { ...m, [field]: !m[field] } : m
                )
            }
        }));
    };

    const toggleStage = (stageId) => {
        setPermissions(prev => ({
            ...prev,
            missionControl: {
                ...prev.missionControl,
                stages: prev.missionControl.stages.map(s =>
                    s.id === stageId ? { ...s, enabled: !s.enabled } : s
                )
            }
        }));
    };

    const toggleAdminConfig = (configId) => {
        setPermissions(prev => ({
            ...prev,
            adminPanel: {
                ...prev.adminPanel,
                configs: prev.adminPanel.configs.map(c =>
                    c.id === configId ? { ...c, enabled: !c.enabled } : c
                )
            }
        }));
    };

    const handleCreateRole = async () => {
        if (!roleName || !department) {
            alert('Please fill in Role Name and Department');
            return;
        }

        const selectedDept = departments.find(d => d.name === department);
        if (!selectedDept) {
            alert('Invalid Department');
            return;
        }

        const payload = {
            name: roleName,
            departmentId: selectedDept.id,
            permissions
        };

        const url = isEditMode
            ? `/api/roles/${id}`
            : '/api/roles';

        const method = isEditMode ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert(`Role template ${isEditMode ? 'updated' : 'created'} successfully!`);
                navigate('/roles');
            } else {
                const data = await response.json();
                alert(data.error || 'Failed to save role');
            }
        } catch (error) {
            console.error('Failed to save role:', error);
            alert('Failed to connect to server');
        }
    };

    return (
        <div style={{ padding: '24px', color: '#fff', minHeight: '100vh', backgroundColor: '#000' }}>
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
                <button
                    onClick={() => navigate('/roles')}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        fontSize: '0.9rem'
                    }}
                >
                    <ArrowLeft size={16} /> Back to Roles
                </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{isEditMode ? 'Edit Role' : 'Add New Role'}</h1>
                </div>
            </div>

            {/* Inputs */}
            <div style={{
                backgroundColor: '#111',
                border: '1px solid #333',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '24px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '24px'
            }}>
                <div>
                    <label style={{ display: 'block', color: '#888', fontSize: '0.8rem', fontWeight: '700', letterSpacing: '0.05em', marginBottom: '8px' }}>ROLE NAME</label>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="e.g. Regional Manager"
                            value={roleName}
                            onChange={e => setRoleName(e.target.value)}
                            style={{
                                width: '100%',
                                backgroundColor: '#0a0a0a',
                                border: '1px solid #333',
                                borderRadius: '8px',
                                padding: '12px 16px',
                                color: '#fff',
                                outline: 'none'
                            }}
                        />
                        <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#444' }}>
                            <Settings size={18} />
                        </div>
                    </div>
                </div>
                <div>
                    <label style={{ display: 'block', color: '#888', fontSize: '0.8rem', fontWeight: '700', letterSpacing: '0.05em', marginBottom: '8px' }}>DEPARTMENT</label>
                    <div style={{ position: 'relative' }}>
                        <select
                            value={department}
                            onChange={e => setDepartment(e.target.value)}
                            style={{
                                width: '100%',
                                backgroundColor: '#0a0a0a',
                                border: '1px solid #333',
                                borderRadius: '8px',
                                padding: '12px 16px',
                                color: roleName ? '#fff' : '#888',
                                outline: 'none',
                                appearance: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="">Select Department</option>
                            {departments.map(dept => (
                                <option key={dept.id} value={dept.name}>{dept.name}</option>
                            ))}
                        </select>
                        <ChevronDown size={16} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#666', pointerEvents: 'none' }} />
                    </div>
                </div>
            </div>

            {/* Permissions Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: '24px', marginBottom: '80px' }}>

                {/* Column 1: CRM Access */}
                <div style={{ backgroundColor: '#080c0f', border: '1px solid #1a2233', borderRadius: '12px', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '20px', borderBottom: '1px solid #1a2233', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Users size={20} color="var(--accent-green)" />
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', margin: 0 }}>CRM Access</h3>
                        </div>
                        {/* Toggle Switch */}
                        <div
                            onClick={() => toggleSection('crm')}
                            style={{
                                width: '48px',
                                height: '26px',
                                backgroundColor: permissions.crm.enabled ? 'var(--accent-green)' : '#333',
                                borderRadius: '13px',
                                position: 'relative',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s'
                            }}
                        >
                            <div style={{
                                width: '22px',
                                height: '22px',
                                backgroundColor: '#fff',
                                borderRadius: '50%',
                                position: 'absolute',
                                top: '2px',
                                left: permissions.crm.enabled ? '24px' : '2px',
                                transition: 'left 0.2s',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                            }} />
                        </div>
                    </div>
                    <div style={{ padding: '20px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', marginBottom: '16px', fontSize: '0.75rem', fontWeight: '700', color: '#666' }}>
                            <div>MODULE</div>
                            <div style={{ textAlign: 'center' }}>VIEW</div>
                            <div style={{ textAlign: 'center' }}>EDIT</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {permissions.crm.modules.map(module => (
                                <div key={module.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', alignItems: 'center' }}>
                                    <div style={{ fontWeight: '500' }}>{module.name}</div>
                                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                                        <div
                                            onClick={() => permissions.crm.enabled && toggleCrmModule(module.id, 'view')}
                                            style={{
                                                width: '36px', height: '20px',
                                                backgroundColor: module.view ? 'var(--accent-green)' : '#333',
                                                borderRadius: '10px', position: 'relative', cursor: permissions.crm.enabled ? 'pointer' : 'not-allowed', opacity: permissions.crm.enabled ? 1 : 0.5
                                            }}
                                        >
                                            <div style={{ width: '16px', height: '16px', backgroundColor: '#fff', borderRadius: '50%', position: 'absolute', top: '2px', left: module.view ? '18px' : '2px', transition: 'left 0.2s' }} />
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                                        <div
                                            onClick={() => permissions.crm.enabled && toggleCrmModule(module.id, 'edit')}
                                            style={{
                                                width: '36px', height: '20px',
                                                backgroundColor: module.edit ? 'var(--accent-green)' : '#333',
                                                borderRadius: '10px', position: 'relative', cursor: permissions.crm.enabled ? 'pointer' : 'not-allowed', opacity: permissions.crm.enabled ? 1 : 0.5
                                            }}
                                        >
                                            <div style={{ width: '16px', height: '16px', backgroundColor: '#fff', borderRadius: '50%', position: 'absolute', top: '2px', left: module.edit ? '18px' : '2px', transition: 'left 0.2s' }} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Column 2: Mission Control */}
                <div style={{ backgroundColor: '#080c0f', border: '1px solid #1a2233', borderRadius: '12px', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '20px', borderBottom: '1px solid #1a2233', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Rocket size={20} color="var(--accent-green)" />
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', margin: 0 }}>Mission Control</h3>
                        </div>
                        <div
                            onClick={() => toggleSection('missionControl')}
                            style={{
                                width: '48px', height: '26px',
                                backgroundColor: permissions.missionControl.enabled ? 'var(--accent-green)' : '#333',
                                borderRadius: '13px', position: 'relative', cursor: 'pointer', transition: 'background-color 0.2s'
                            }}
                        >
                            <div style={{ width: '22px', height: '22px', backgroundColor: '#fff', borderRadius: '50%', position: 'absolute', top: '2px', left: permissions.missionControl.enabled ? '24px' : '2px', transition: 'left 0.2s' }} />
                        </div>
                    </div>
                    <div style={{ padding: '20px' }}>
                        <div style={{ marginBottom: '16px', fontSize: '0.75rem', fontWeight: '700', color: '#666' }}>AUTHORIZED PIPELINE STAGE ACCESS</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {permissions.missionControl.stages.map(stage => (
                                <div key={stage.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ fontSize: '0.9rem' }}>{stage.name}</div>
                                    <div
                                        onClick={() => permissions.missionControl.enabled && toggleStage(stage.id)}
                                        style={{
                                            width: '36px', height: '20px',
                                            backgroundColor: stage.enabled ? 'var(--accent-green)' : '#333',
                                            borderRadius: '10px', position: 'relative', cursor: permissions.missionControl.enabled ? 'pointer' : 'not-allowed', opacity: permissions.missionControl.enabled ? 1 : 0.5
                                        }}
                                    >
                                        <div style={{ width: '16px', height: '16px', backgroundColor: '#fff', borderRadius: '50%', position: 'absolute', top: '2px', left: stage.enabled ? '18px' : '2px', transition: 'left 0.2s' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Column 3: Admin Panel */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: '100%' }}>
                    <div style={{ backgroundColor: '#080c0f', border: '1px solid #1a2233', borderRadius: '12px', overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '20px', borderBottom: '1px solid #1a2233', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Shield size={20} color="var(--accent-green)" />
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', margin: 0 }}>Admin Panel</h3>
                            </div>
                            <div
                                onClick={() => toggleSection('adminPanel')}
                                style={{
                                    width: '48px', height: '26px',
                                    backgroundColor: permissions.adminPanel.enabled ? 'var(--accent-green)' : '#333',
                                    borderRadius: '13px', position: 'relative', cursor: 'pointer', transition: 'background-color 0.2s'
                                }}
                            >
                                <div style={{ width: '22px', height: '22px', backgroundColor: '#fff', borderRadius: '50%', position: 'absolute', top: '2px', left: permissions.adminPanel.enabled ? '24px' : '2px', transition: 'left 0.2s' }} />
                            </div>
                        </div>
                        <div style={{ padding: '20px' }}>
                            <div style={{ marginBottom: '16px', fontSize: '0.75rem', fontWeight: '700', color: '#666' }}>SYSTEM CONFIGURATION</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {permissions.adminPanel.configs.map(config => (
                                    <div key={config.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontSize: '0.9rem', fontWeight: '500' }}>{config.name}</div>
                                        </div>
                                        <div
                                            onClick={() => permissions.adminPanel.enabled && toggleAdminConfig(config.id)}
                                            style={{
                                                width: '36px', height: '20px',
                                                backgroundColor: config.enabled ? 'var(--accent-green)' : '#333',
                                                borderRadius: '10px', position: 'relative', cursor: permissions.adminPanel.enabled ? 'pointer' : 'not-allowed', opacity: permissions.adminPanel.enabled ? 1 : 0.5,
                                                flexShrink: 0
                                            }}
                                        >
                                            <div style={{ width: '16px', height: '16px', backgroundColor: '#fff', borderRadius: '50%', position: 'absolute', top: '2px', left: config.enabled ? '18px' : '2px', transition: 'left 0.2s' }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>


                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', alignItems: 'center' }}>
                        <button
                            onClick={() => navigate('/roles')}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#ccc',
                                fontWeight: '600',
                                cursor: 'pointer',
                                fontSize: '0.9rem'
                            }}
                        >
                            Discard Changes
                        </button>
                        <button
                            onClick={handleCreateRole}
                            style={{
                                backgroundColor: 'var(--accent-green)',
                                color: '#000',
                                border: 'none',
                                padding: '12px 24px',
                                borderRadius: '8px',
                                fontWeight: '700',
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                            {isEditMode ? 'Update Role Template' : 'Create Role Template'}
                            <Lock size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateRoleTemplate;
