import { useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { NavLink, useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import bexlyMark from '../assets/bexly-mark.png';
import bexlyWordmark from '../assets/bexly-wordmark.png';
import { useAuth } from '../context/AuthContext';
import { AvatarPickerModal } from '../components/AvatarPickerModal';
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
    Search,
    ShieldCheck,
    ChevronDown,
    ChevronsUpDown,
    Layers,
    Camera,
    Bell,
    Calendar,
    Plus,
    Clock
} from 'lucide-react';

const EXPANDED_W = 272;
const COLLAPSED_W = 84;
const GAP = 14;

const spring = { type: 'spring' as const, stiffness: 520, damping: 40, mass: 0.8 };

interface ItemProps {
    id: string;
    to?: string;
    icon: any;
    label: string;
    collapsed: boolean;
    hovered: string | null;
    setHovered: (id: string | null) => void;
    active: boolean;
    badge?: ReactNode;
    trailing?: ReactNode;
    onClick?: () => void;
}

const SidebarItem = ({ id, to, icon: Icon, label, collapsed, hovered, setHovered, active, badge, trailing, onClick }: ItemProps) => {
    const isHovered = hovered === id;

    const iconColor = active
        ? '#ffffff'
        : (isHovered ? '#ffffff' : 'rgba(255, 255, 255, 0.68)');
    const textColor = active
        ? '#ffffff'
        : (isHovered ? '#ffffff' : 'rgba(255, 255, 255, 0.68)');

    const content = (
        <span
            style={{
                position: 'relative',
                zIndex: 2,
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                height: '100%',
                overflow: 'hidden'
            }}
        >
            {/* Slot fixo do ícone — sempre perfeitamente alinhado */}
            <div
                style={{
                    width: '56px',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                }}
            >
                <motion.div
                    animate={{
                        scale: isHovered ? 1.15 : 1,
                    }}
                    transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <Icon
                        size={19}
                        strokeWidth={active ? 2.2 : (isHovered ? 2.0 : 1.8)}
                        style={{
                            color: iconColor,
                            filter: active ? 'drop-shadow(0 0 8px rgba(0, 102, 255, 0.7))' : (isHovered ? 'drop-shadow(0 0 8px rgba(255,255,255,0.45))' : 'none'),
                            transition: 'color 0.2s ease, filter 0.2s ease'
                        }}
                    />
                </motion.div>
            </div>
            <AnimatePresence initial={false}>
                {!collapsed && (
                    <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.18, ease: 'easeInOut' }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flex: 1,
                            minWidth: 0,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            paddingRight: '14px'
                        }}
                    >
                        <span style={{
                            fontWeight: active ? 600 : 500,
                            fontSize: '0.88rem',
                            color: textColor,
                            transition: 'color 0.2s ease'
                        }}>
                            {label}
                        </span>
                        {badge && <span style={{ marginLeft: '8px' }}>{badge}</span>}
                        {trailing && <span style={{ marginLeft: 'auto', display: 'flex' }}>{trailing}</span>}
                    </motion.span>
                )}
            </AnimatePresence>
        </span>
    );

    const style = {
        position: 'relative' as const,
        display: 'flex',
        alignItems: 'center',
        height: '46px',
        margin: '2px 0',
        borderRadius: '14px',
        background: active ? 'rgba(255, 255, 255, 0.1)' : (isHovered ? 'rgba(255, 255, 255, 0.05)' : 'transparent'),
        transition: 'background 0.2s ease, color 0.2s ease',
        textDecoration: 'none',
        color: 'inherit',
        cursor: 'pointer',
        userSelect: 'none' as const
    };

    if (to) {
        return (
            <NavLink
                to={to}
                onClick={onClick}
                onMouseEnter={() => setHovered(id)}
                style={style}
            >
                {content}
            </NavLink>
        );
    }

    return (
        <div
            onClick={onClick}
            onMouseEnter={() => setHovered(id)}
            style={style}
        >
            {content}
        </div>
    );
};

const SectionLabel = ({ children, collapsed }: { children: ReactNode; collapsed: boolean }) => (
    <div style={{
        fontSize: '0.66rem',
        fontWeight: 600,
        letterSpacing: '1.2px',
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.4)',
        padding: collapsed ? '16px 0 8px 0' : '16px 14px 8px 14px',
        textAlign: collapsed ? 'center' : 'left',
        height: '14px',
        boxSizing: 'content-box'
    }}>
        {collapsed ? '•' : children}
    </div>
);

const DashboardLayout = ({ children }: { children: ReactNode }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, dbUser, isAdmin, signOut } = useAuth();

    const [isSidebarHovered, setIsSidebarHovered] = useState<boolean>(false);
    const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
    const [hovered, setHovered] = useState<string | null>(null);
    const [builderOpen, setBuilderOpen] = useState<boolean>(true);
    const [search, setSearch] = useState('');
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState<boolean>(false);
    const searchRef = useRef<HTMLInputElement>(null);

    const isExpanded = isSidebarHovered || isSearchFocused || search.length > 0;
    const collapsed = !isExpanded;

    // Atalho ⌘K / Ctrl+K para focar a busca
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setIsSearchFocused(true);
                setTimeout(() => searchRef.current?.focus(), 50);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    const [timeStr, setTimeStr] = useState('');
    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setTimeStr(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));
        };
        updateTime();
        const interval = setInterval(updateTime, 10000);
        return () => clearInterval(interval);
    }, []);

    const displayName = user?.user_metadata?.full_name || dbUser?.name || (isAdmin ? 'Breno Silva' : user?.email?.split('@')[0] || 'Usuário');
    const displayEmail = user?.email || '';
    const displayRole = isAdmin ? 'Administrador' : 'Workspace Individual';
    const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
    const initials = displayName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((p: string) => p[0]?.toUpperCase())
        .join('') || (isAdmin ? 'BS' : 'US');

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

    const path = location.pathname;
    const isActive = (to: string) => path === to || path.startsWith(to + '/') || (to === '/dashboard' && (path === '/' || path === ''));
    const builderActive = isActive('/pages') || isActive('/funnels');

    const sectionNames: Record<string, string> = {
        '/dashboard': 'Visão Geral',
        '/leads': 'Leads & CRM',
        '/clients': 'Clientes',
        '/marketing': 'Marketing & Automações',
        '/products': 'Produtos',
        '/pages': 'Minhas Páginas',
        '/funnels': 'Funis de Venda',
        '/ai-mentor': 'Mentor IA',
        '/settings': 'Configurações'
    };
    const currentSection = sectionNames[path] || 'Visão Geral';

    const allItems = [
        { to: '/dashboard', label: 'Dashboard' },
        { to: '/leads', label: 'Leads' },
        { to: '/clients', label: 'Clientes' },
        { to: '/marketing', label: 'Automação' },
        { to: '/products', label: 'Produtos' },
        { to: '/pages', label: 'Minhas Páginas' },
        { to: '/funnels', label: 'Funis de Venda' },
        { to: '/ai-mentor', label: 'Mentor IA' },
        { to: '/settings', label: 'Configurações' }
    ];
    const results = search.trim()
        ? allItems.filter(i => i.label.toLowerCase().includes(search.trim().toLowerCase()))
        : [];

    const sidebarW = collapsed ? COLLAPSED_W : EXPANDED_W;
    const common = { collapsed, hovered, setHovered };

    return (
        <div style={{
            position: 'relative',
            display: 'flex',
            minHeight: '100vh',
            background: 'var(--background)',
            color: 'var(--text-primary)',
            overflowX: 'hidden'
        }}>
            {/* ── Sidebar flutuante em vidro fosco Apple VisionOS ── */}
            <motion.aside
                initial={false}
                animate={{ width: sidebarW }}
                transition={spring}
                onMouseEnter={() => setIsSidebarHovered(true)}
                onMouseLeave={() => {
                    setIsSidebarHovered(false);
                    setHovered(null);
                }}
                style={{
                    position: 'fixed',
                    top: GAP,
                    left: GAP,
                    bottom: GAP,
                    zIndex: 50,
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: '28px',
                    background: 'rgba(20, 22, 32, 0.62)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    boxShadow: 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.22), 0 30px 60px -20px rgba(0, 0, 0, 0.75)',
                    backdropFilter: 'blur(36px) saturate(190%) contrast(105%)',
                    WebkitBackdropFilter: 'blur(36px) saturate(190%) contrast(105%)',
                    color: '#ffffff',
                    overflow: 'visible'
                }}
            >
                {/* Cabeçalho: logo transparente + workspace */}
                <Link to="/dashboard" style={{
                    display: 'flex',
                    alignItems: 'center',
                    height: '64px',
                    padding: '0 14px',
                    textDecoration: 'none',
                    color: '#fff',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        width: '56px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        <motion.div
                            whileHover={{ scale: 1.1, rotate: 2 }}
                            transition={{ type: 'spring', stiffness: 450, damping: 20 }}
                            style={{
                                width: '38px',
                                height: '38px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <img
                                src={bexlyMark}
                                alt="Bexly"
                                style={{
                                    height: '36px',
                                    width: 'auto',
                                    objectFit: 'contain',
                                    display: 'block',
                                    filter: 'drop-shadow(0 4px 12px rgba(0, 102, 255, 0.45))'
                                }}
                            />
                        </motion.div>
                    </div>
                    <AnimatePresence initial={false}>
                        {!collapsed && (
                            <motion.div
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: 'auto' }}
                                exit={{ opacity: 0, width: 0 }}
                                transition={{ duration: 0.18, ease: 'easeInOut' }}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                    justifyContent: 'center',
                                    lineHeight: 1.2,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    marginLeft: '6px'
                                }}
                            >
                                <img
                                    src={bexlyWordmark}
                                    alt="Bexly"
                                    style={{
                                        height: '21px',
                                        width: 'auto',
                                        objectFit: 'contain',
                                        display: 'block',
                                        transform: 'translateY(4px)'
                                    }}
                                />
                                <span style={{
                                    fontSize: '0.76rem',
                                    color: 'rgba(255, 255, 255, 0.55)',
                                    marginTop: '2px',
                                    textAlign: 'left'
                                }}>
                                    {displayRole}
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Link>

                {/* Busca */}
                <div style={{ padding: '4px 14px 6px 14px', position: 'relative' }}>
                    <div
                        onClick={() => { searchRef.current?.focus(); }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            height: '42px',
                            borderRadius: '14px',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            cursor: collapsed ? 'pointer' : 'text',
                            overflow: 'hidden'
                        }}
                    >
                        <div style={{
                            width: '56px',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            <Search size={16} strokeWidth={1.9} style={{ color: 'rgba(255,255,255,0.6)' }} />
                        </div>
                        <AnimatePresence initial={false}>
                            {!collapsed && (
                                <motion.div
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: 'auto' }}
                                    exit={{ opacity: 0, width: 0 }}
                                    transition={{ duration: 0.18, ease: 'easeInOut' }}
                                    style={{
                                        flex: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        overflow: 'hidden',
                                        paddingRight: '12px'
                                    }}
                                >
                                    <input
                                        ref={searchRef}
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onFocus={() => setIsSearchFocused(true)}
                                        onBlur={() => setIsSearchFocused(false)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && results[0]) { navigate(results[0].to); setSearch(''); }
                                            if (e.key === 'Escape') setSearch('');
                                        }}
                                        placeholder="Buscar páginas"
                                        style={{ flex: 1, minWidth: 0, background: 'none', border: 'none', outline: 'none', color: '#fff', fontSize: '0.86rem' }}
                                    />
                                    <span style={{
                                        fontSize: '0.68rem',
                                        color: 'rgba(255,255,255,0.55)',
                                        padding: '2px 7px',
                                        borderRadius: '7px',
                                        border: '1px solid rgba(255,255,255,0.12)',
                                        background: 'rgba(255,255,255,0.04)',
                                        whiteSpace: 'nowrap'
                                    }}>⌘K</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <AnimatePresence>
                        {results.length > 0 && !collapsed && (
                            <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                transition={{ duration: 0.15 }}
                                style={{
                                    position: 'absolute',
                                    left: '14px',
                                    right: '14px',
                                    top: '52px',
                                    background: 'rgba(20, 24, 34, 0.98)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '14px',
                                    padding: '6px',
                                    zIndex: 10,
                                    boxShadow: '0 20px 40px -10px rgba(0,0,0,0.7)'
                                }}
                            >
                                {results.map(r => (
                                    <div
                                        key={r.to}
                                        onMouseDown={() => { navigate(r.to); setSearch(''); }}
                                        style={{ padding: '9px 10px', borderRadius: '10px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.85)', cursor: 'pointer' }}
                                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                                    >
                                        {r.label}
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Navegação */}
                <LayoutGroup>
                    <nav
                        onMouseLeave={() => setHovered(null)}
                        style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '0 14px' }}
                        className="bexly-sidebar-nav"
                    >
                        <SectionLabel collapsed={collapsed}>Principal</SectionLabel>
                        <SidebarItem id="dashboard" to="/dashboard" icon={LayoutDashboard} label="Dashboard" active={isActive('/dashboard')} {...common} />
                        <SidebarItem id="leads" to="/leads" icon={Target} label="Leads" active={isActive('/leads')} {...common} />
                        <SidebarItem id="clients" to="/clients" icon={Users} label="Clientes" active={isActive('/clients')} {...common} />
                        <SidebarItem id="products" to="/products" icon={ShoppingCart} label="Produtos" active={isActive('/products')} {...common} />

                        <SectionLabel collapsed={collapsed}>Workspace</SectionLabel>
                        <SidebarItem
                            id="marketing"
                            to="/marketing"
                            icon={Megaphone}
                            label="Automação"
                            active={isActive('/marketing')}
                            {...common}
                        />
                        <SidebarItem
                            id="ai"
                            to="/ai-mentor"
                            icon={MessageSquare}
                            label="Mentor IA"
                            active={isActive('/ai-mentor')}
                            {...common}
                        />

                        {/* Construtor com submenu em árvore */}
                        <SidebarItem
                            id="builder"
                            icon={Layers}
                            label="Construtor"
                            active={collapsed && builderActive}
                            onClick={() => setBuilderOpen(o => !o)}
                            trailing={
                                <motion.span animate={{ rotate: builderOpen ? 180 : 0 }} transition={spring} style={{ display: 'flex', color: 'rgba(255,255,255,0.55)' }}>
                                    <ChevronDown size={15} />
                                </motion.span>
                            }
                            {...common}
                        />
                        <AnimatePresence initial={false}>
                            {builderOpen && !collapsed && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                                    style={{ overflow: 'hidden', position: 'relative', marginLeft: '22px' }}
                                >
                                    {/* Linha vertical da árvore */}
                                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: '21px', width: '1px', background: 'rgba(255,255,255,0.14)' }} />
                                    {[
                                        { id: 'pages', to: '/pages', label: 'Minhas Páginas', color: '#22c55e', icon: LayoutIcon },
                                        { id: 'funnels', to: '/funnels', label: 'Funis de Venda', color: '#f97316', icon: GitMerge }
                                    ].map(sub => {
                                        const subActive = isActive(sub.to);
                                        const subHovered = hovered === sub.id;
                                        return (
                                            <div key={sub.id} style={{ position: 'relative', paddingLeft: '14px' }}>
                                                <div style={{ position: 'absolute', left: 0, top: '20px', width: '12px', height: '1px', background: 'rgba(255,255,255,0.14)' }} />
                                                <NavLink
                                                    to={sub.to}
                                                    onMouseEnter={() => setHovered(sub.id)}
                                                    style={{
                                                        position: 'relative',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '10px',
                                                        height: '40px',
                                                        padding: '0 12px',
                                                        marginBottom: '2px',
                                                        borderRadius: '12px',
                                                        textDecoration: 'none',
                                                        fontSize: '0.86rem',
                                                        fontWeight: subActive ? 600 : 500,
                                                        color: subActive ? '#fff' : 'rgba(255,255,255,0.75)'
                                                    }}
                                                >
                                                    <motion.div
                                                        animate={{ scale: subHovered ? 1.3 : 1 }}
                                                        transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                                                        style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center' }}
                                                    >
                                                        <span style={{
                                                            width: '8px',
                                                            height: '8px',
                                                            borderRadius: '3px',
                                                            background: sub.color,
                                                            flexShrink: 0,
                                                            boxShadow: subHovered ? `0 0 10px ${sub.color}` : 'none',
                                                            transition: 'box-shadow 0.2s ease'
                                                        }} />
                                                    </motion.div>
                                                    <motion.span
                                                        animate={{
                                                            scale: subHovered ? 1.04 : 1,
                                                            x: subHovered ? 2 : 0
                                                        }}
                                                        transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                                                        style={{
                                                            position: 'relative',
                                                            zIndex: 2,
                                                            whiteSpace: 'nowrap',
                                                            color: subActive || subHovered ? '#ffffff' : 'rgba(255,255,255,0.75)'
                                                        }}
                                                    >
                                                        {sub.label}
                                                    </motion.span>
                                                </NavLink>
                                            </div>
                                        );
                                    })}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div style={{ height: '10px' }} />
                        <SidebarItem id="settings" to="/settings" icon={Settings} label="Configurações" active={isActive('/settings')} {...common} />
                    </nav>
                </LayoutGroup>

                {/* Rodapé: usuário */}
                <div style={{ padding: '8px 14px 14px 14px', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', height: '44px', overflow: 'hidden' }}>
                        <div style={{
                            width: '56px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            <motion.div
                                whileHover={{ scale: 1.08 }}
                                whileTap={{ scale: 0.94 }}
                                onClick={() => setIsAvatarModalOpen(true)}
                                title="Clique para alterar sua foto de perfil"
                                style={{ position: 'relative', flexShrink: 0, cursor: 'pointer' }}
                                className="sidebar-avatar-trigger"
                            >
                                {avatarUrl ? (
                                    <img
                                        src={avatarUrl}
                                        alt={displayName}
                                        referrerPolicy="no-referrer"
                                        style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255, 255, 255, 0.15)' }}
                                    />
                                ) : (
                                    <div style={{
                                        width: '38px', height: '38px', borderRadius: '50%',
                                        background: isAdmin ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontWeight: 700, fontSize: '0.8rem', color: '#fff'
                                    }}>{initials}</div>
                                )}
                                <div style={{
                                    position: 'absolute',
                                    inset: 0,
                                    borderRadius: '50%',
                                    background: 'rgba(0,0,0,0.45)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    opacity: 0,
                                    transition: 'opacity 0.2s ease',
                                    color: '#fff'
                                }}
                                className="sidebar-avatar-overlay"
                                >
                                    <Camera size={14} />
                                </div>
                                <span style={{ position: 'absolute', right: '-1px', bottom: '-1px', width: '11px', height: '11px', borderRadius: '50%', background: '#22c55e', border: '2px solid #12151e' }} />
                            </motion.div>
                        </div>
                        <AnimatePresence initial={false}>
                            {!collapsed && (
                                <motion.div
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: 'auto' }}
                                    exit={{ opacity: 0, width: 0 }}
                                    transition={{ duration: 0.18, ease: 'easeInOut' }}
                                    style={{
                                        flex: 1,
                                        minWidth: 0,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        overflow: 'hidden',
                                        whiteSpace: 'nowrap',
                                        paddingLeft: '4px'
                                    }}
                                >
                                    <div
                                        onClick={() => navigate('/settings')}
                                        title="Ver configurações do perfil"
                                        style={{ flex: 1, minWidth: 0, lineHeight: 1.25, cursor: 'pointer', overflow: 'hidden' }}
                                    >
                                        <div style={{ fontSize: '0.86rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            {displayName}
                                            {isAdmin && <ShieldCheck size={12} color="#3b82f6" />}
                                        </div>
                                        <div style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayEmail}</div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0, marginLeft: '6px' }}>
                                        <button
                                            type="button"
                                            onClick={handleLogout}
                                            title="Sair"
                                            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', padding: '6px', borderRadius: '8px', transition: 'color 0.2s, background 0.2s' }}
                                            onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.background = 'none'; }}
                                        >
                                            <LogOut size={16} />
                                        </button>
                                        <ChevronsUpDown size={14} style={{ color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }} onClick={() => navigate('/settings')} />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.aside>

            {/* Modal de Troca de Avatar */}
            <AvatarPickerModal isOpen={isAvatarModalOpen} onClose={() => setIsAvatarModalOpen(false)} />

            {/* Main Content Area — Full Screen with Apple VisionOS Glass & Floating Header */}
            <motion.main
                initial={false}
                animate={{ marginLeft: sidebarW + GAP * 2 }}
                transition={spring}
                style={{
                    flex: 1,
                    position: 'relative',
                    zIndex: 1,
                    background: 'transparent',
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: 0
                }}
            >
                {/* ── Floating Apple Liquid Glass Top Bar (VisionOS Style) ── */}
                <header style={{
                    padding: '16px 32px 0 32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    flexWrap: 'wrap'
                }}>
                    {/* Left: Section Indicator Pill */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="apple-glass-pill" style={{ padding: '8px 16px', fontSize: '0.84rem' }}>
                            <span style={{ color: 'rgba(255,255,255,0.5)' }}>Bexly CRM</span>
                            <span style={{ color: 'rgba(255,255,255,0.3)' }}>/</span>
                            <span style={{ fontWeight: 600, color: '#ffffff' }}>{currentSection}</span>
                        </div>
                    </div>

                    {/* Center: Long Frosted Glass Search Pill */}
                    <div
                        onClick={() => {
                            setIsSearchFocused(true);
                            setTimeout(() => searchRef.current?.focus(), 50);
                        }}
                        className="apple-glass-card"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            height: '42px',
                            padding: '0 16px',
                            borderRadius: '9999px',
                            minWidth: '260px',
                            maxWidth: '440px',
                            flex: 1,
                            cursor: 'text'
                        }}
                    >
                        <Search size={15} style={{ color: 'rgba(255,255,255,0.5)', marginRight: '10px', flexShrink: 0 }} />
                        <span style={{ fontSize: '0.84rem', color: 'rgba(255,255,255,0.45)', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            Buscar métricas, clientes, automações...
                        </span>
                        <span style={{
                            fontSize: '0.68rem',
                            color: 'rgba(255,255,255,0.55)',
                            padding: '2px 7px',
                            borderRadius: '9999px',
                            border: '1px solid rgba(255,255,255,0.14)',
                            background: 'rgba(255,255,255,0.06)'
                        }}>⌘K</span>
                    </div>

                    {/* Right: Apple Glass Action Pills */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {/* Live Clock Pill */}
                        <div className="apple-glass-pill" style={{ height: '40px', padding: '0 14px', gap: '7px' }}>
                            <Clock size={13} style={{ color: 'rgba(255,255,255,0.6)' }} />
                            <span style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.02em' }}>{timeStr || '01:04 PM'}</span>
                        </div>

                        {/* Date Pill */}
                        <div className="apple-glass-pill" style={{ height: '40px', padding: '0 14px', cursor: 'pointer' }}>
                            <Calendar size={13} style={{ color: 'rgba(255,255,255,0.6)' }} />
                            <span style={{ fontSize: '0.8rem' }}>Este mês</span>
                        </div>

                        {/* Primary Radiant Amber Glass Button (like + New in video) */}
                        <button
                            type="button"
                            onClick={() => navigate('/leads')}
                            className="apple-glass-button apple-glass-primary"
                            style={{ height: '40px', padding: '0 18px', fontSize: '0.84rem', fontWeight: 600 }}
                        >
                            <Plus size={15} strokeWidth={2.4} />
                            <span>Novo</span>
                        </button>

                        {/* Notifications Pill */}
                        <div
                            className="apple-glass-button"
                            style={{ width: '40px', height: '40px', padding: 0 }}
                            title="Notificações"
                        >
                            <Bell size={16} />
                        </div>
                    </div>
                </header>

                {/* Staggered Animated Tab Entrance (Exactly like the video) */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 22, filter: 'blur(16px)', scale: 0.985 }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 }}
                        exit={{ opacity: 0, y: -16, filter: 'blur(12px)', scale: 0.985 }}
                        transition={{ type: 'spring', stiffness: 280, damping: 26, mass: 0.8 }}
                        style={{ padding: '20px 32px 48px 32px' }}
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </motion.main>

            <style>{`
                .bexly-sidebar-nav::-webkit-scrollbar { width: 0; height: 0; }
                .bexly-sidebar-nav { scrollbar-width: none; }
                .sidebar-avatar-trigger:hover .sidebar-avatar-overlay { opacity: 1 !important; }
            `}</style>
        </div>
    );
};

export default DashboardLayout;
