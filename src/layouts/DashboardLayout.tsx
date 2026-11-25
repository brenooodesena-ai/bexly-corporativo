import { useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { NavLink, useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import bexlyMark from '../assets/bexly-mark.png';
import { useAuth } from '../context/AuthContext';
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
    Search,
    ShieldCheck,
    ChevronLeft,
    ChevronDown,
    ChevronsUpDown,
    Layers,
    Sun
} from 'lucide-react';

const EXPANDED_W = 272;
const COLLAPSED_W = 84;
const GAP = 14;

const spring = { type: 'spring' as const, stiffness: 520, damping: 40, mass: 0.8 };

/* ── Pílula de hover que desliza entre os itens ── */
const HoverPill = () => (
    <motion.div
        layoutId="sidebar-hover-pill"
        transition={spring}
        style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '14px',
            background: 'rgba(255, 255, 255, 0.05)',
            zIndex: 0
        }}
    />
);

/* ── Pílula ativa com borda brilhante (efeito vidro) ── */
const ActivePill = () => (
    <motion.div
        layoutId="sidebar-active-pill"
        transition={spring}
        style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '14px',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.06) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.22)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), 0 6px 18px -6px rgba(0,0,0,0.6)',
            zIndex: 1
        }}
    />
);

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

    const content = (
        <>
            {isHovered && !active && <HoverPill />}
            {active && <ActivePill />}
            <motion.span
                animate={{
                    scale: isHovered ? 1.04 : 1,
                    x: isHovered && !collapsed ? 2 : 0
                }}
                transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                style={{
                    position: 'relative',
                    zIndex: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    width: '100%',
                    transformOrigin: collapsed ? 'center center' : 'left center'
                }}
            >
                <motion.div
                    animate={{
                        scale: isHovered ? 1.22 : 1,
                    }}
                    transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}
                >
                    <Icon
                        size={19}
                        strokeWidth={active || isHovered ? 2.1 : 1.8}
                        style={{
                            color: active ? '#ffffff' : (isHovered ? '#ffffff' : 'rgba(255,255,255,0.78)'),
                            filter: isHovered ? 'drop-shadow(0 0 8px rgba(255,255,255,0.45))' : 'none',
                            transition: 'color 0.2s ease, filter 0.2s ease'
                        }}
                    />
                </motion.div>
                <AnimatePresence initial={false}>
                    {!collapsed && (
                        <motion.span
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -6 }}
                            transition={{ duration: 0.18 }}
                            style={{ flex: 1, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}
                        >
                            <span style={{ color: active || isHovered ? '#ffffff' : 'rgba(255,255,255,0.85)' }}>{label}</span>
                            {badge}
                            {trailing}
                        </motion.span>
                    )}
                </AnimatePresence>
            </motion.span>
        </>
    );

    const style: React.CSSProperties = {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        height: '42px',
        padding: collapsed ? '0 15px' : '0 14px',
        marginBottom: '3px',
        borderRadius: '14px',
        color: active ? '#ffffff' : 'rgba(255,255,255,0.82)',
        fontSize: '0.9rem',
        fontWeight: active ? 600 : 500,
        letterSpacing: '-0.1px',
        textDecoration: 'none',
        cursor: 'pointer',
        background: 'none',
        border: 'none',
        width: '100%',
        textAlign: 'left',
        transition: 'color 0.2s ease'
    };

    const handlers = {
        onMouseEnter: () => setHovered(id),
        title: collapsed ? label : undefined
    };

    if (to) {
        return (
            <NavLink to={to} style={style} {...handlers}>
                {content}
            </NavLink>
        );
    }
    return (
        <button type="button" onClick={onClick} style={style} {...handlers}>
            {content}
        </button>
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

    const [collapsed, setCollapsed] = useState<boolean>(() => localStorage.getItem('bexly_sidebar_collapsed') === '1');
    const [hovered, setHovered] = useState<string | null>(null);
    const [builderOpen, setBuilderOpen] = useState<boolean>(true);
    const [nightMode, setNightMode] = useState<boolean>(true);
    const [search, setSearch] = useState('');
    const searchRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        localStorage.setItem('bexly_sidebar_collapsed', collapsed ? '1' : '0');
    }, [collapsed]);

    // Atalho ⌘K / Ctrl+K para focar a busca
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setCollapsed(false);
                setTimeout(() => searchRef.current?.focus(), 50);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
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
    const isActive = (to: string) => path === to || path.startsWith(to + '/');
    const builderActive = isActive('/pages') || isActive('/funnels');

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
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)' }}>
            {/* ── Sidebar flutuante em vidro ── */}
            <motion.aside
                initial={false}
                animate={{ width: sidebarW }}
                transition={spring}
                style={{
                    position: 'fixed',
                    top: GAP,
                    left: GAP,
                    bottom: GAP,
                    zIndex: 50,
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: '28px',
                    background: 'linear-gradient(180deg, rgba(28, 32, 44, 0.78) 0%, rgba(14, 17, 26, 0.82) 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 30px 60px -20px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(28px) saturate(160%)',
                    WebkitBackdropFilter: 'blur(28px) saturate(160%)',
                    color: '#ffffff',
                    overflow: 'visible'
                }}
            >
                {/* Botão recolher/expandir */}
                <motion.button
                    type="button"
                    onClick={() => setCollapsed(c => !c)}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    animate={{ rotate: collapsed ? 180 : 0 }}
                    transition={spring}
                    aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
                    style={{
                        position: 'absolute',
                        top: '26px',
                        right: '-14px',
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: '#ffffff',
                        color: '#0b0d12',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 6px 16px rgba(0,0,0,0.45)',
                        zIndex: 5
                    }}
                >
                    <ChevronLeft size={16} strokeWidth={2.4} />
                </motion.button>

                {/* Cabeçalho: logo transparente + workspace */}
                <Link to="/dashboard" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: collapsed ? '20px 0 14px 0' : '20px 18px 14px 18px',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    textDecoration: 'none',
                    color: '#fff'
                }}>
                    <motion.div
                        whileHover={{ scale: 1.1, rotate: 2 }}
                        transition={{ type: 'spring', stiffness: 450, damping: 20 }}
                        style={{
                            width: '38px',
                            height: '38px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
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
                    <AnimatePresence initial={false}>
                        {!collapsed && (
                            <motion.div
                                initial={{ opacity: 0, x: -6 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -6 }}
                                transition={{ duration: 0.18 }}
                                style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2, whiteSpace: 'nowrap' }}
                            >
                                <span style={{ fontWeight: 700, fontSize: '1.05rem', letterSpacing: '-0.3px', color: '#ffffff' }}>Bexly</span>
                                <span style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.55)' }}>{displayRole}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Link>

                {/* Busca */}
                <div style={{ padding: collapsed ? '4px 14px 6px 14px' : '4px 14px 6px 14px', position: 'relative' }}>
                    <div
                        onClick={() => { if (collapsed) { setCollapsed(false); setTimeout(() => searchRef.current?.focus(), 80); } }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            height: '42px',
                            padding: collapsed ? '0' : '0 12px',
                            justifyContent: collapsed ? 'center' : 'flex-start',
                            borderRadius: '14px',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            cursor: collapsed ? 'pointer' : 'text'
                        }}
                    >
                        <Search size={16} strokeWidth={1.9} style={{ color: 'rgba(255,255,255,0.6)', flexShrink: 0 }} />
                        {!collapsed && (
                            <>
                                <input
                                    ref={searchRef}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
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
                            </>
                        )}
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
                            badge={<span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px rgba(34,197,94,0.7)' }} />}
                            {...common}
                        />
                        <SidebarItem
                            id="ai"
                            to="/ai-mentor"
                            icon={MessageSquare}
                            label="Mentor IA"
                            active={isActive('/ai-mentor')}
                            badge={<span style={{ fontSize: '0.66rem', fontWeight: 700, padding: '2px 7px', borderRadius: '999px', background: '#0066FF', color: '#fff' }}>IA</span>}
                            {...common}
                        />

                        {/* Construtor com submenu em árvore */}
                        <SidebarItem
                            id="builder"
                            icon={Layers}
                            label="Construtor"
                            active={collapsed && builderActive}
                            onClick={() => { if (collapsed) { setCollapsed(false); setBuilderOpen(true); } else setBuilderOpen(o => !o); }}
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
                                                    {subHovered && !subActive && <HoverPill />}
                                                    {subActive && <ActivePill />}
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

                {/* Rodapé: modo noturno + usuário */}
                <div style={{ padding: '8px 14px 14px 14px' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: collapsed ? 'center' : 'space-between',
                        height: '42px',
                        padding: collapsed ? 0 : '0 14px',
                        color: 'rgba(255,255,255,0.82)',
                        fontSize: '0.9rem',
                        fontWeight: 500
                    }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Sun size={18} strokeWidth={1.8} />
                            {!collapsed && <span>Modo noturno</span>}
                        </span>
                        {!collapsed && (
                            <button
                                type="button"
                                onClick={() => setNightMode(n => !n)}
                                aria-label="Alternar modo noturno"
                                style={{
                                    width: '38px',
                                    height: '22px',
                                    borderRadius: '999px',
                                    border: '1px solid rgba(255,255,255,0.14)',
                                    background: nightMode ? '#0066FF' : 'rgba(255,255,255,0.12)',
                                    position: 'relative',
                                    cursor: 'pointer',
                                    padding: 0,
                                    transition: 'background 0.25s ease',
                                    display: 'flex',
                                    justifyContent: nightMode ? 'flex-end' : 'flex-start',
                                    alignItems: 'center'
                                }}
                            >
                                <motion.span
                                    layout
                                    transition={spring}
                                    style={{ width: '16px', height: '16px', margin: '0 2px', borderRadius: '50%', background: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,0.4)' }}
                                />
                            </button>
                        )}
                    </div>

                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '8px 4px 10px 4px' }} />

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: collapsed ? 'center' : 'flex-start', padding: collapsed ? 0 : '0 6px' }}>
                        <div style={{ position: 'relative', flexShrink: 0 }}>
                            {avatarUrl ? (
                                <img src={avatarUrl} alt={displayName} referrerPolicy="no-referrer" style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                                <div style={{
                                    width: '38px', height: '38px', borderRadius: '50%',
                                    background: isAdmin ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 700, fontSize: '0.8rem', color: '#fff'
                                }}>{initials}</div>
                            )}
                            <span style={{ position: 'absolute', right: '-1px', bottom: '-1px', width: '11px', height: '11px', borderRadius: '50%', background: '#22c55e', border: '2px solid #12151e' }} />
                        </div>
                        {!collapsed && (
                            <>
                                <div style={{ flex: 1, minWidth: 0, lineHeight: 1.25 }}>
                                    <div style={{ fontSize: '0.86rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        {displayName}
                                        {isAdmin && <ShieldCheck size={12} color="#3b82f6" />}
                                    </div>
                                    <div style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayEmail}</div>
                                </div>
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
                                <ChevronsUpDown size={14} style={{ color: 'rgba(255,255,255,0.4)' }} />
                            </>
                        )}
                    </div>
                </div>
            </motion.aside>

            {/* Main Content Area */}
            <motion.main
                initial={false}
                animate={{ marginLeft: sidebarW + GAP * 2 }}
                transition={spring}
                style={{
                    flex: 1,
                    background: 'var(--background)',
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: 0
                }}
            >
                {/* Header */}
                <header style={{
                    height: 'var(--header-height)',
                    background: 'var(--background)',
                    backdropFilter: 'blur(10px)',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    padding: '0 32px',
                    position: 'sticky',
                    top: 0,
                    zIndex: 40
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        <button style={{ background: 'none', color: 'var(--text-secondary)', position: 'relative', border: 'none', cursor: 'pointer' }}>
                            <Bell size={20} />
                            <div style={{ position: 'absolute', top: '0px', right: '0px', width: '6px', height: '6px', backgroundColor: 'var(--primary-blue)', borderRadius: '50%' }} />
                        </button>
                        <div style={{ textAlign: 'right', paddingLeft: '20px', borderLeft: '1px solid var(--border-color)' }}>
                            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{displayName}</p>
                            <p style={{ fontSize: '0.72rem', color: isAdmin ? '#3b82f6' : 'var(--text-secondary)', fontWeight: isAdmin ? 600 : 400, margin: '2px 0 0 0' }}>{displayRole}</p>
                        </div>
                    </div>
                </header>

                {/* Dynamic Content */}
                <div style={{ padding: '32px' }}>
                    {children}
                </div>
            </motion.main>

            <style>{`
                .bexly-sidebar-nav::-webkit-scrollbar { width: 0; height: 0; }
                .bexly-sidebar-nav { scrollbar-width: none; }
            `}</style>
        </div>
    );
};

export default DashboardLayout;
