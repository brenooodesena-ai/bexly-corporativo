import type { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    Shield,
    LayoutDashboard,
    Users,
    Target,
    TrendingUp,
    MessageSquare,
    Settings,
    LogOut,
    Bell,
    Search
} from 'lucide-react';

interface SidebarItemProps {
    to: string;
    icon: any;
    label: string;
}

const SidebarItem = ({ to, icon: Icon, label }: SidebarItemProps) => (
    <NavLink
        to={to}
        style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            borderRadius: 'var(--radius)',
            color: isActive ? 'var(--white)' : 'rgba(255, 255, 255, 0.6)',
            backgroundColor: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
            marginBottom: '4px',
            fontWeight: isActive ? 600 : 500,
            transition: 'all 0.2s ease'
        })}
    >
        <Icon size={20} />
        <span>{label}</span>
    </NavLink>
);

const DashboardLayout = ({ children }: { children: ReactNode }) => {
    const navigate = useNavigate();

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            {/* Sidebar */}
            <aside style={{
                width: 'var(--sidebar-width)',
                backgroundColor: 'var(--dark-blue)',
                color: 'var(--white)',
                padding: '24px 16px',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                height: '100vh',
                zIndex: 50
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px', padding: '0 8px' }}>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 15px rgba(37, 99, 235, 0.3)'
                    }}>
                        <Shield color="white" size={18} />
                    </div>
                    <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--white)', letterSpacing: '-1px' }}>Bexly</span>
                </div>

                <nav style={{ flex: 1 }}>
                    <SidebarItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
                    <SidebarItem to="/clients" icon={Users} label="Clients" />
                    <SidebarItem to="/leads" icon={Target} label="Leads" />
                    <SidebarItem to="/sales" icon={TrendingUp} label="Sales" />
                    <SidebarItem to="/mentor" icon={MessageSquare} label="AI Mentor" />

                    <div style={{ height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.1)', margin: '20px 0' }} />

                    <SidebarItem to="/settings" icon={Settings} label="Settings" />
                </nav>

                <button
                    onClick={() => navigate('/')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        color: 'rgba(255, 255, 255, 0.6)',
                        background: 'none',
                        fontSize: '1rem',
                        marginTop: 'auto'
                    }}
                >
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </aside>

            {/* Main Content Area */}
            <main style={{
                flex: 1,
                marginLeft: 'var(--sidebar-width)',
                backgroundColor: 'var(--background)'
            }}>
                {/* Header */}
                <header style={{
                    height: 'var(--header-height)',
                    backgroundColor: 'rgba(2, 6, 23, 0.5)',
                    backdropFilter: 'blur(10px)',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 32px',
                    position: 'sticky',
                    top: 0,
                    zIndex: 40
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'rgba(255, 255, 255, 0.5)', backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: '10px 20px', borderRadius: '40px', width: '350px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Pesquisar..."
                            style={{ background: 'none', border: 'none', outline: 'none', width: '100%', fontSize: '0.9rem', color: 'white' }}
                        />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        <button style={{ background: 'none', color: 'rgba(255, 255, 255, 0.5)', position: 'relative', border: 'none', cursor: 'pointer' }}>
                            <Bell size={20} />
                            <div style={{ position: 'absolute', top: '0px', right: '0px', width: '6px', height: '6px', backgroundColor: 'var(--primary-blue)', borderRadius: '50%' }} />
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '20px', borderLeft: '1px solid rgba(255, 255, 255, 0.05)' }}>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--white)' }}>Breno Silva</p>
                                <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.4)' }}>Administrator</p>
                            </div>
                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, boxShadow: '0 0 15px rgba(59, 130, 246, 0.3)' }}>
                                BS
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dynamic Content */}
                <div style={{ padding: '32px' }}>
                    {children}
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
