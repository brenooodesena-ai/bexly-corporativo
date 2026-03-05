import { useState } from 'react';
import { Card, Button } from '../components/UI';
import { Plus, Search, MoreVertical, Mail, Phone, ExternalLink } from 'lucide-react';

interface Client {
    id: string;
    name: string;
    company: string;
    email: string;
    phone: string;
    status: 'Active' | 'Inactive' | 'Pending';
}

const Clients = () => {
    const [clients] = useState<Client[]>([
        { id: '1', name: 'John Doe', company: 'Tech Global', email: 'john@techglobal.com', phone: '+1 (555) 123-4567', status: 'Active' },
        { id: '2', name: 'Sarah Smith', company: 'Creative Solutions', email: 'sarah@creative.io', phone: '+1 (555) 987-6543', status: 'Active' },
        { id: '3', name: 'Mike Miller', company: 'Fast Logistics', email: 'mike@fastlog.com', phone: '+1 (555) 456-7890', status: 'Pending' },
        { id: '4', name: 'Emma Wilson', company: 'Wilson & Co', email: 'emma@wilson.com', phone: '+1 (555) 234-5678', status: 'Inactive' },
    ]);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>Client Management</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Manage and track your business relationships.</p>
                </div>
                <Button>
                    <Plus size={20} /> Add New Client
                </Button>
            </div>

            <Card style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)', backgroundColor: '#F9FAFB', padding: '8px 16px', borderRadius: '40px', width: '300px' }}>
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Filter clients..."
                            style={{ background: 'none', border: 'none', outline: 'none', width: '100%', fontSize: '0.875rem' }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <Button variant="secondary" style={{ padding: '8px 16px' }}>Export CSV</Button>
                    </div>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid var(--border-color)' }}>
                        <tr>
                            <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Client</th>
                            <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Contact</th>
                            <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Status</th>
                            <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clients.map(client => (
                            <tr key={client.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--light-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-blue)', fontWeight: 700 }}>
                                            {client.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p style={{ fontWeight: 600, fontSize: '0.925rem' }}>{client.name}</p>
                                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{client.company}</p>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: 'var(--text-gray)' }}>
                                            <Mail size={14} /> {client.email}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: 'var(--text-gray)' }}>
                                            <Phone size={14} /> {client.phone}
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <span style={{
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        backgroundColor: client.status === 'Active' ? '#D1FAE5' : client.status === 'Pending' ? '#FEF3C7' : '#F3F4F6',
                                        color: client.status === 'Active' ? '#065F46' : client.status === 'Pending' ? '#92400E' : '#374151'
                                    }}>
                                        {client.status}
                                    </span>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{ display: 'flex', gap: '12px', color: 'var(--text-secondary)' }}>
                                        <button style={{ background: 'none' }}><ExternalLink size={18} /></button>
                                        <button style={{ background: 'none' }}><MoreVertical size={18} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    );
};

export default Clients;
