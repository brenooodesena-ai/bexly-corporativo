import type { ReactNode } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import logotipo from '../logotipo-5.png';
import {
    LayoutDashboard,
    Layout as LayoutIcon,
    GitMerge,
    Users,
    Target,
    MessageSquare,
    Megaphone,
    ShoppingCart,
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
            color: isActive ? '#ffffff' : '#94a3b8',
            backgroundColor: isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
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
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)' }}>
            {/* Sidebar — Sempre escuro */}
            <aside style={{
                width: 'var(--sidebar-width)',
                backgroundColor: '#020617',
                color: '#f8fafc',
                padding: '0 0 24px 0',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                height: '100vh',
                zIndex: 50,
                borderRight: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
                {/* Logo — centralizada exatamente no meio do espaço (horizontal e verticalmente) */}
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    height: '80px',
                    minHeight: '80px',
                    width: '100%',
                    flexShrink: 0,
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
                }}>
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
                        <img
                            src={logotipo}
                            alt="Bexly Logo"
                            style={{ height: '38px', width: 'auto', objectFit: 'contain', display: 'block' }}
                        />
                    </Link>
                </div>

                <nav style={{ flex: 1, paddingTop: '36px', paddingLeft: '16px', paddingRight: '16px' }}>
                    <SidebarItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />

                    <div style={{ height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.08)', margin: '12px 8px', display: 'flex', alignItems: 'center', position: 'relative' }}>
                        <span style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', padding: '0 8px', backgroundColor: '#020617', position: 'absolute', left: '8px' }}>CONSTRUTOR</span>
                    </div>
                    <div style={{ marginTop: '24px' }}>
                        <SidebarItem to="/pages" icon={LayoutIcon} label="Minhas Páginas" />
                        <SidebarItem to="/funnels" icon={GitMerge} label="Funis de Venda" />
                    </div>

                    <div style={{ height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.08)', margin: '12px 8px', display: 'flex', alignItems: 'center', position: 'relative' }}>
                        <span style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', padding: '0 8px', backgroundColor: '#020617', position: 'absolute', left: '8px' }}>CRM & VENDAS</span>
                    </div>
                    <div style={{ marginTop: '24px' }}>
                        <SidebarItem to="/leads" icon={Target} label="Leads" />
                        <SidebarItem to="/clients" icon={Users} label="Clientes" />
                        <SidebarItem to="/marketing" icon={Megaphone} label="Automação" />
                        <SidebarItem to="/products" icon={ShoppingCart} label="Produtos" />
                    </div>

                    <div style={{ height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.08)', margin: '12px 8px', display: 'flex', alignItems: 'center', position: 'relative' }}>
                        <span style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', padding: '0 8px', backgroundColor: '#020617', position: 'absolute', left: '8px' }}>Inteligência</span>
                    </div>
                    <div style={{ marginTop: '24px' }}>
                        <SidebarItem to="/ai-mentor" icon={MessageSquare} label="Mentor IA" />
                    </div>

                    <div style={{ height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.08)', margin: '20px 0' }} />

                    <SidebarItem to="/settings" icon={Settings} label="Configurações" />
                </nav>

                <button
                    onClick={() => navigate('/')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        color: '#94a3b8',
                        background: 'none',
                        border: 'none',
                        fontSize: '1rem',
                        marginTop: 'auto',
                        cursor: 'pointer',
                        transition: 'color 0.2s ease'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; }}
                >
                    <LogOut size={20} />
                    <span>Sair</span>
                </button>
            </aside>

            {/* Main Content Area */}
            <main style={{
                flex: 1,
                marginLeft: 'var(--sidebar-width)',
                background: 'var(--background)',
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Header */}
                <header style={{
                    height: 'var(--header-height)',
                    background: 'var(--background)',
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)', backgroundColor: 'var(--nav-hover)', padding: '10px 20px', borderRadius: '40px', width: '350px', border: '1px solid var(--border-color)' }}>
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Pesquisar..."
                            style={{ background: 'none', border: 'none', outline: 'none', width: '100%', fontSize: '0.9rem', color: 'var(--text-primary)' }}
                        />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        <button style={{ background: 'none', color: 'var(--text-secondary)', position: 'relative', border: 'none', cursor: 'pointer' }}>
                            <Bell size={20} />
                            <div style={{ position: 'absolute', top: '0px', right: '0px', width: '6px', height: '6px', backgroundColor: 'var(--primary-blue)', borderRadius: '50%' }} />
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '20px', borderLeft: '1px solid var(--border-color)' }}>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Breno Silva</p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Administrador</p>
                            </div>
                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600, boxShadow: '0 0 15px rgba(59, 130, 246, 0.3)' }}>
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
