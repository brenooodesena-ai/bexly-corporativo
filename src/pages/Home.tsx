import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, Bot, CreditCard, LayoutGrid, MapPin, RotateCcw, FileText, Plus, Instagram } from 'lucide-react';
import { ContainerScroll } from '../components/ui/container-scroll-animation';

import logoIcon from '../assets/logo-bexly-one.png';

import platformPreview from '../platform-preview.webp';
import heroBg from '../assets/moldura-futurista-neon-azul.png';

import cardCubes from '../assets/card-cubes.webp';
import cardPlates from '../assets/card-plates.webp';
import cardRings from '../assets/card-rings.webp';
import cardTorus from '../assets/card-torus.webp';
import cardPrism from '../assets/card-prism.webp';
import cardHelix from '../assets/card-helix.webp';

interface ShowcaseCard {
    title: string;
    description: string;
    image: string;
}

const SHOWCASE_CARDS: ShowcaseCard[] = [
    {
        title: "IA Conversacional Nativa",
        description: "Compreensão profunda de áudios, textos e gírias com respostas humanizadas e personalizadas.",
        image: cardCubes,
    },
    {
        title: "Omnichannel Unificado",
        description: "WhatsApp Oficial, Instagram Direct e Webchat sincronizados em uma esteira única de alta performance.",
        image: cardPlates,
    },
    {
        title: "Cobrança & Checkout no Chat",
        description: "Geração instantânea de PIX dinâmico e links de pagamento com confirmação e baixa em tempo real.",
        image: cardRings,
    },
    {
        title: "Roteamento Inteligente",
        description: "Distribuição estratégica de leads para os consultores mais próximos com base em regras e geolocalização.",
        image: cardTorus,
    },
    {
        title: "Recuperação Ativa de Vendas",
        description: "Follow-up automatizado e reengajamento inteligente de clientes no momento de maior taxa de conversão.",
        image: cardPrism,
    },
    {
        title: "Automação Fiscal Integrada",
        description: "Emissão automatizada de notas fiscais, faturas e relatórios operacionais integrados ao seu ERP.",
        image: cardHelix,
    },
];

interface NavItem {
    id: string;
    label: string;
    targetId: string;
}

const NAV_ITEMS: NavItem[] = [
    { id: 'recursos', label: 'Recursos', targetId: 'recursos' },
    { id: 'vitrines', label: 'Vitrines', targetId: 'vitrines' },
    { id: 'precos', label: 'Preços', targetId: 'precos' },
    { id: 'faq', label: 'Perguntas', targetId: 'faq' },
];

// HeaderNavigation 100% isolado: alterações no scroll NÃO re-renderizam a página Home
const HeaderNavigation = ({
    activeNav,
    onNavClick,
}: {
    activeNav: string;
    onNavClick: (id: string) => void;
}) => {
    const [showTopNav, setShowTopNav] = useState<boolean>(true);
    const [showFloatingNav, setShowFloatingNav] = useState<boolean>(false);
    const isNavigatingRef = useRef<boolean>(false);

    useEffect(() => {
        let lastScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
        let ticking = false;

        const updateNav = () => {
            if (isNavigatingRef.current) return;
            const currentY = window.pageYOffset || document.documentElement.scrollTop || 0;

            // No topo absoluto da página (<= 15px):
            if (currentY <= 15) {
                setShowFloatingNav(false);
                setShowTopNav(true);
                lastScrollY = currentY;
                return;
            }

            const diff = currentY - lastScrollY;

            // Rolando para baixo: recolhe flutuante imediatamente e esconde a do topo se passou de 140px
            if (diff > 8) {
                setShowFloatingNav(prev => prev ? false : prev);
                if (currentY > 140) {
                    setShowTopNav(prev => prev ? false : prev);
                }
                lastScrollY = currentY;
            } 
            // Rolando para cima: ativa flutuante se passou de 140px
            else if (diff < -8) {
                if (currentY > 140) {
                    setShowFloatingNav(prev => !prev ? true : prev);
                    setShowTopNav(prev => prev ? false : prev);
                } else {
                    setShowFloatingNav(prev => prev ? false : prev);
                    setShowTopNav(prev => !prev ? true : prev);
                }
                lastScrollY = currentY;
            }
        };

        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    updateNav();
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleItemClick = (id: string) => {
        isNavigatingRef.current = true;
        setShowFloatingNav(true);
        setShowTopNav(false);
        onNavClick(id);
        setTimeout(() => {
            isNavigatingRef.current = false;
        }, 850);
    };

    return (
        <>
            {/* 1. Barra do Topo: Fixada na página (absolute). Desvanece ao sair da visão */}
            <div 
                className="absolute top-4 md:top-6 inset-x-0 z-40 flex justify-center px-4 sm:px-6 transition-opacity duration-300 ease-out"
                style={{
                    opacity: showTopNav ? 1 : 0,
                    pointerEvents: showTopNav ? 'auto' : 'none',
                }}
            >
                <div className="w-full max-w-6xl">
                    <nav className="glass-nav relative h-[68px] md:h-[72px] flex items-center justify-between rounded-[20px]" style={{ paddingLeft: '36px', paddingRight: '36px' }}>
                        {/* Left: Logo Bexly */}
                        <div className="flex items-center flex-shrink-0" style={{ marginLeft: '12px' }}>
                            <Link to="/" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
                                <img
                                    src={logoIcon}
                                    alt="Bexly Logo"
                                    style={{ height: '36px', width: 'auto', objectFit: 'contain', display: 'block' }}
                                />
                            </Link>
                        </div>

                        {/* Center: Navigation Links */}
                        <div className="hidden md:flex items-center gap-7 lg:gap-9 absolute left-1/2 -translate-x-1/2">
                            {NAV_ITEMS.map((item) => {
                                const isActive = activeNav === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => handleItemClick(item.id)}
                                        className={`text-sm lg:text-[0.925rem] font-medium transition-colors ${
                                            isActive
                                                ? 'text-white font-semibold'
                                                : 'text-slate-300 hover:text-white'
                                        }`}
                                    >
                                        {item.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Right: Auth Links */}
                        <div className="flex items-center gap-5 sm:gap-6 flex-shrink-0" style={{ marginRight: '12px' }}>
                            <Link to="/login" className="text-[0.9rem] font-medium text-white/70 hover:text-white transition-all">Login</Link>
                            <Link to="/signup">
                                <button className="glow-pill-button">
                                    Criar conta
                                </button>
                            </Link>
                        </div>
                    </nav>
                </div>
            </div>

            {/* 2. Barra Flutuante Dinâmica: Desliza suavemente sem travar */}
            <div className="fixed top-4 md:top-6 inset-x-0 z-[100] flex justify-center pointer-events-none px-4 sm:px-6">
                <motion.header
                    initial={{ y: -70, opacity: 0 }}
                    animate={{
                        y: showFloatingNav ? 0 : -70,
                        opacity: showFloatingNav ? 1 : 0,
                    }}
                    transition={{
                        duration: 0.35,
                        ease: [0.22, 1, 0.36, 1],
                    }}
                    className={`w-full max-w-6xl ${showFloatingNav ? 'pointer-events-auto' : 'pointer-events-none'}`}
                >
                    <nav className="glass-nav relative h-[68px] md:h-[72px] flex items-center justify-between rounded-[20px]" style={{ paddingLeft: '36px', paddingRight: '36px' }}>
                        {/* Left: Logo Bexly */}
                        <div className="flex items-center flex-shrink-0" style={{ marginLeft: '12px' }}>
                            <Link to="/" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
                                <img
                                    src={logoIcon}
                                    alt="Bexly Logo"
                                    style={{ height: '36px', width: 'auto', objectFit: 'contain', display: 'block' }}
                                />
                            </Link>
                        </div>

                        {/* Center: Navigation Links */}
                        <div className="hidden md:flex items-center gap-7 lg:gap-9 absolute left-1/2 -translate-x-1/2">
                            {NAV_ITEMS.map((item) => {
                                const isActive = activeNav === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => handleItemClick(item.id)}
                                        className={`text-sm lg:text-[0.925rem] font-medium transition-colors ${
                                            isActive
                                                ? 'text-white font-semibold'
                                                : 'text-slate-300 hover:text-white'
                                        }`}
                                    >
                                        {item.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Right: Auth Links */}
                        <div className="flex items-center gap-5 sm:gap-6 flex-shrink-0" style={{ marginRight: '12px' }}>
                            <Link to="/login" className="text-[0.9rem] font-medium text-white/70 hover:text-white transition-all">Login</Link>
                            <Link to="/signup">
                                <button className="glow-pill-button">
                                    Criar conta
                                </button>
                            </Link>
                        </div>
                    </nav>
                </motion.header>
            </div>
        </>
    );
};

const Home = () => {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');
    const [activeNav, setActiveNav] = useState<string>('recursos');

    const handleNavClick = (id: string) => {
        setActiveNav(id);
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const plans = [
        {
            name: "Basic",
            desc: "Ideal para começar e testar o poder da IA.",
            price: billingCycle === 'monthly' ? "57" : "47",
            features: [
                "1.000 mensagens / mês",
                "1 dispositivo / número",
                "Bot completo",
                "Suporte Padrão"
            ],
            cta: "Começar Agora",
            popular: false
        },
        {
            name: "Pro",
            desc: "Ideal para demandas maiores e escala.",
            price: billingCycle === 'monthly' ? "97" : "77",
            features: [
                "Mensagens ilimitadas",
                "3 dispositivos / número",
                "Bot escuta áudios",
                "Suporte Prioritário",
                "Automações Avançadas"
            ],
            cta: "Começar Agora",
            popular: true,
            badge: "Mais Popular"
        },
        {
            name: "Premium",
            desc: "Para demandas muito grandes e exclusivas.",
            price: billingCycle === 'monthly' ? "197" : "157",
            features: [
                "Mensagens ilimitadas",
                "10 dispositivos / número",
                "Escuta e envia áudios",
                "Suporte Premium 24/7",
                "Gerente de conta dedicado"
            ],
            cta: "Começar Agora",
            popular: false
        }
    ];

    return (
        <div className="home-container min-h-screen relative bg-black selection:bg-blue-500/30 overflow-x-clip">
            {/* Header com navegação desacoplada (zero re-render da página no scroll) */}
            <HeaderNavigation activeNav={activeNav} onNavClick={handleNavClick} />

            {/* Fundo de luz suave do topo acelerado por GPU */}
            <div className="hero-beams-container">
                <div className="hero-beam-glow" />
            </div>

            {/* ─── HERO BLOCK ─── Fundo Moldura Futurista com o scroll centralizado no lugar do texto ─── */}
            <div id="vitrines" className="relative w-full overflow-hidden scroll-mt-24">
                {/* Imagem de fundo exibida por inteiro, com transição suave na base para o preto */}
                <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                    <img
                        src={heroBg}
                        alt=""
                        aria-hidden="true"
                        className="w-full h-full object-cover object-center select-none"
                    />
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            background: 'linear-gradient(to bottom, transparent 0%, transparent 72%, rgba(0,0,0,0.85) 90%, #000000 100%)',
                        }}
                    />
                </div>

                {/* Conteúdo Central: O scroll posicionado no lugar onde estava o texto */}
                <main 
                    className="relative z-10 w-full overflow-hidden pb-20 sm:pb-28 md:pb-36 flex flex-col items-center justify-start"
                    style={{ paddingTop: 'clamp(190px, 22vh, 230px)' }}
                >
                    <div className="w-full max-w-7xl mx-auto flex flex-col items-center justify-start px-4 relative">
                        <ContainerScroll
                            titleComponent={
                                <div className="w-full flex flex-col items-center justify-center text-center">
                                    <h1 
                                        className="w-full text-3xl sm:text-4xl md:text-5xl lg:text-[58px] tracking-[-0.03em] leading-[1.1] text-center select-none mb-2"
                                        style={{
                                            fontWeight: 500,
                                            fontFamily: "'Inter', sans-serif",
                                            background: 'linear-gradient(90deg, #5398f6 0%, #7db5fb 11%, #cae0fe 20%, #ffffff 28%, #ffffff 68%, #cae0fe 78%, #7db5fb 89%, #5398f6 100%)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            filter: 'drop-shadow(0 0 32px rgba(59, 130, 246, 0.35)) drop-shadow(0 0 10px rgba(147, 197, 253, 0.25))',
                                        }}
                                    >
                                        Sua operação digital
                                    </h1>
                                    <p 
                                        className="w-full text-lg sm:text-xl md:text-2xl lg:text-[30px] tracking-[-0.02em] font-normal text-center select-none"
                                        style={{
                                            fontFamily: "'Inter', sans-serif",
                                            background: 'linear-gradient(90deg, #7db5fb 0%, #ffffff 35%, #ffffff 65%, #7db5fb 100%)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            filter: 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.3))',
                                        }}
                                    >
                                        Em outro nível.
                                    </p>
                                </div>
                            }
                        >
                            <img
                                src={platformPreview}
                                alt="Dashboard Preview"
                                className="mx-auto rounded-2xl object-cover h-full object-left-top w-full"
                                draggable={false}
                            />
                        </ContainerScroll>
                    </div>
                </main>
            </div>
            {/* ─── FIM DO HERO BLOCK ─── */}

            {/* Features Showcase Section (Transição limpa sobre fundo preto profundo) */}
            <section id="recursos" className="w-full relative z-20 pt-6 md:pt-10 pb-20 md:pb-28 overflow-hidden flex justify-center bg-black scroll-mt-24">
                {/* Ambient Soft Glow Behind Section acelerado por GPU */}
                <div 
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] pointer-events-none rounded-full"
                    style={{ background: 'radial-gradient(ellipse at center, rgba(37, 99, 235, 0.12) 0%, transparent 70%)' }}
                />

                <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-start">
                    {/* Section Header (Left-Aligned, No Pill Badge, Matching Screenshot) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="w-full flex flex-col items-start text-left mb-8 md:mb-10"
                    >
                        <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-white tracking-tight leading-[1.18] mb-3 text-left">
                            Tudo o que seu negócio <br className="hidden sm:inline" />
                            precisa para vender mais
                        </h2>
                        <p className="text-sm sm:text-base text-slate-400 font-normal leading-relaxed max-w-2xl text-left">
                            Potente por dentro, simples por fora. Você não precisa entender nada técnico.
                        </p>
                    </motion.div>

                    {/* Bento Grid: 2 Large Cards on Top */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full mb-5">
                        {/* Card 1: Fala como uma pessoa */}
                        <div className="relative bg-gradient-to-br from-[#0b1324] via-[#0d162a] to-[#101b33] border border-slate-800/90 rounded-[22px] p-7 sm:p-8 transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.35)] flex flex-col justify-start min-h-[250px]">
                            <div className="w-11 h-11 rounded-xl bg-[#142138] border border-sky-400/20 text-sky-400 flex items-center justify-center mb-6">
                                <Bot size={22} strokeWidth={2.2} />
                            </div>
                            <h3 className="text-xl sm:text-[22px] font-bold text-white mb-2.5 tracking-tight text-left">
                                Fala como uma pessoa
                            </h3>
                            <p className="text-slate-400 text-[13.5px] sm:text-[14px] leading-relaxed font-normal text-left">
                                Sua IA conversa de forma natural, com o nome e o tom que você escolher. Conhece seus produtos de cor e nunca perde a paciência. Seus clientes jamais notam a diferença.
                            </p>
                        </div>

                        {/* Card 2: Cobra dentro do chat */}
                        <div className="relative bg-gradient-to-br from-[#0b1324] via-[#0d162a] to-[#101b33] border border-slate-800/90 rounded-[22px] p-7 sm:p-8 transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.35)] flex flex-col justify-start min-h-[250px]">
                            <div className="w-11 h-11 rounded-xl bg-[#142138] border border-sky-400/20 text-sky-400 flex items-center justify-center mb-6">
                                <CreditCard size={22} strokeWidth={2.2} />
                            </div>
                            <h3 className="text-xl sm:text-[22px] font-bold text-white mb-2.5 tracking-tight text-left">
                                Cobra dentro do chat
                            </h3>
                            <p className="text-slate-400 text-[13.5px] sm:text-[14px] leading-relaxed font-normal text-left">
                                Cartões, QR, Tigo Money, Personal Pay, MercadoPago e mais. O cliente paga sem sair da conversa e você recebe o aviso na hora.
                            </p>
                        </div>
                    </div>

                    {/* Bento Grid: 4 Cards on Bottom (White Cards Matching Reference Photo) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full">
                        {/* Card 3: Tudo em um só lugar */}
                        <div className="relative bg-white rounded-[22px] p-6 sm:p-7 flex flex-col justify-start border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.06)] min-h-[220px]">
                            <div className="w-11 h-11 rounded-xl bg-[#edf5ff] border border-sky-100 text-sky-600 flex items-center justify-center mb-6">
                                <LayoutGrid size={22} strokeWidth={2.2} />
                            </div>
                            <h4 style={{ color: '#0f172a' }} className="text-[17px] font-bold mb-2 leading-snug tracking-tight text-left">
                                Tudo em um só lugar
                            </h4>
                            <p style={{ color: '#64748b' }} className="text-[13px] sm:text-[13.5px] leading-relaxed font-normal text-left">
                                Todas as conversas de todos os canais em uma única tela.
                            </p>
                        </div>

                        {/* Card 4: Envia o vendedor mais próximo */}
                        <div className="relative bg-white rounded-[22px] p-6 sm:p-7 flex flex-col justify-start border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.06)] min-h-[220px]">
                            <div className="w-11 h-11 rounded-xl bg-[#edf5ff] border border-sky-100 text-sky-600 flex items-center justify-center mb-6">
                                <MapPin size={22} strokeWidth={2.2} />
                            </div>
                            <h4 style={{ color: '#0f172a' }} className="text-[17px] font-bold mb-2 leading-snug tracking-tight text-left">
                                Envia o vendedor mais próximo
                            </h4>
                            <p style={{ color: '#64748b' }} className="text-[13px] sm:text-[13.5px] leading-relaxed font-normal text-left">
                                Quando um cliente quer ver o produto, ela designa o vendedor da região dele.
                            </p>
                        </div>

                        {/* Card 5: Insiste por você */}
                        <div className="relative bg-white rounded-[22px] p-6 sm:p-7 flex flex-col justify-start border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.06)] min-h-[220px]">
                            <div className="w-11 h-11 rounded-xl bg-[#edf5ff] border border-sky-100 text-sky-600 flex items-center justify-center mb-6">
                                <RotateCcw size={22} strokeWidth={2.2} />
                            </div>
                            <h4 style={{ color: '#0f172a' }} className="text-[17px] font-bold mb-2 leading-snug tracking-tight text-left">
                                Insiste por você
                            </h4>
                            <p style={{ color: '#64748b' }} className="text-[13px] sm:text-[13.5px] leading-relaxed font-normal text-left">
                                Se um cliente não responde, a IA escreve de novo no momento certo.
                            </p>
                        </div>

                        {/* Card 6: Nota fiscal eletrônica */}
                        <div className="relative bg-white rounded-[22px] p-6 sm:p-7 flex flex-col justify-start border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.06)] min-h-[220px]">
                            <div className="w-11 h-11 rounded-xl bg-[#edf5ff] border border-sky-100 text-sky-600 flex items-center justify-center mb-6">
                                <FileText size={22} strokeWidth={2.2} />
                            </div>
                            <h4 style={{ color: '#0f172a' }} className="text-[17px] font-bold mb-2 leading-snug tracking-tight text-left">
                                Nota fiscal eletrônica
                            </h4>
                            <p style={{ color: '#64748b' }} className="text-[13px] sm:text-[13.5px] leading-relaxed font-normal text-left">
                                Emite faturas legais (SIFEN) automaticamente a cada venda.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── SEÇÃO: Carrossel de Cards 3D (Passando devagar automaticamente) ─── */}
            <section className="w-full relative z-20 pt-10 md:pt-16 pb-20 md:pb-28 overflow-hidden bg-black flex flex-col items-center">
                {/* Luz ambiente azul suave no fundo */}
                <div 
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] max-w-[1100px] h-[380px] pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse at center, rgba(37, 99, 235, 0.09) 0%, transparent 70%)' }}
                />

                {/* Marquee Track com Fade Gradiente nas Laterais Esquerda e Direita */}
                <div 
                    className="w-full relative overflow-hidden py-3"
                    style={{
                        maskImage: 'linear-gradient(to right, transparent 0%, black 7%, black 93%, transparent 100%)',
                        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 7%, black 93%, transparent 100%)',
                    }}
                >
                    <div className="marquee-glass-track">
                        {[...SHOWCASE_CARDS, ...SHOWCASE_CARDS].map((card, idx) => (
                            <div
                                key={idx}
                                className="w-[300px] sm:w-[330px] h-[450px] sm:h-[470px] bg-[#0c101d]/90 backdrop-blur-md rounded-[26px] border border-white/[0.08] hover:border-blue-500/40 transition-all duration-300 relative overflow-hidden group flex-shrink-0 flex flex-col justify-between p-7 sm:p-8 shadow-[0_12px_32px_rgba(0,0,0,0.45)] hover:shadow-[0_16px_40px_rgba(37,99,235,0.18)]"
                            >
                                {/* Brilho sutil no hover */}
                                <div className="absolute inset-0 bg-gradient-to-b from-blue-500/[0.06] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                                {/* Conteúdo Textual do Card (Topo) */}
                                <div className="relative z-10">
                                    <h3 className="text-xl sm:text-[22px] font-bold text-white tracking-tight leading-snug mb-2.5 text-left">
                                        {card.title}
                                    </h3>
                                    <p className="text-slate-400 text-[13px] sm:text-[13.5px] leading-relaxed font-normal text-left">
                                        {card.description}
                                    </p>
                                </div>

                                {/* Arte 3D Futurista em Vidro & Cromo (Base) */}
                                <div className="mt-auto w-full h-[220px] sm:h-[235px] flex items-end justify-center relative overflow-hidden -mb-2">
                                    <img
                                        src={card.image}
                                        alt={card.title}
                                        loading="lazy"
                                        className="w-full h-full object-contain object-bottom select-none pointer-events-none transform group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── SEÇÃO: Our Working Flow (3 Cards com gradientes e emblemas) ─── */}
            <section className="w-full relative z-20 py-20 md:py-32 overflow-hidden bg-black flex flex-col items-center justify-center">
                {/* Conteúdo: Título e os 3 cards com efeitos de gradiente */}
                <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 font-['Plus_Jakarta_Sans',sans-serif]">
                    <header className="mb-10 sm:mb-14 text-center">
                        <h2 className="text-3xl sm:text-4xl md:text-[46px] font-extrabold tracking-tight text-white leading-tight inline-flex items-center justify-center flex-wrap">
                            <span>Our Wor</span>
                            <span className="title-gradient-accent">king</span>
                            <span>&nbsp;Flow</span>
                        </h2>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7 items-stretch">
                        {/* StepCard1 */}
                        <article className="glow-card-1 card-border-glow rounded-[32px] p-7 sm:p-8 flex flex-col justify-between min-h-[380px] sm:min-h-[420px] relative overflow-hidden group transition-all duration-300 hover:scale-[1.02] shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
                            <div className="flex items-start justify-between">
                                <div className="emblem-wrapper w-12 h-12 rounded-full bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-2.5 shadow-lg border border-white/10">
                                    <svg className="w-full h-full text-slate-200" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 32 32">
                                        <circle className="stroke-white/80" cx="16" cy="16" r="13" />
                                        <path className="stroke-cyan-200" d="M16 3v26" />
                                        <path className="stroke-sky-300" d="M6 16c2.5 5.5 6.5 8 10 8s7.5-2.5 10-8" />
                                        <path className="stroke-white/70" d="M6 16c2.5-5.5 6.5-8 10-8s7.5 2.5 10 8" />
                                    </svg>
                                </div>
                            </div>
                            <div className="mt-auto pt-16 sm:pt-20 z-10">
                                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3 tracking-tight">Step 1</h3>
                                <p className="text-slate-300/80 text-[14px] sm:text-[15px] leading-relaxed font-normal">
                                    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ips...
                                </p>
                            </div>
                        </article>

                        {/* StepCard2 */}
                        <article className="glow-card-2 card-border-glow rounded-[32px] p-7 sm:p-8 flex flex-col justify-between min-h-[380px] sm:min-h-[420px] relative overflow-hidden group transition-all duration-300 hover:scale-[1.02] shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
                            <div className="flex items-start justify-between">
                                <div className="emblem-wrapper w-12 h-12 rounded-full bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-2.5 shadow-lg border border-white/10">
                                    <svg className="w-full h-full text-slate-200" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 32 32">
                                        <circle className="stroke-white/80" cx="16" cy="16" r="13" />
                                        <path className="stroke-cyan-200" d="M16 3v26" />
                                        <path className="stroke-sky-300" d="M6 16c2.5 5.5 6.5 8 10 8s7.5-2.5 10-8" />
                                        <path className="stroke-white/70" d="M6 16c2.5-5.5 6.5-8 10-8s7.5 2.5 10 8" />
                                    </svg>
                                </div>
                            </div>
                            <div className="mt-auto pt-16 sm:pt-20 z-10">
                                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3 tracking-tight">Step 2</h3>
                                <p className="text-slate-300/80 text-[14px] sm:text-[15px] leading-relaxed font-normal">
                                    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ips...
                                </p>
                            </div>
                        </article>

                        {/* StepCard3 */}
                        <article className="glow-card-3 card-border-glow rounded-[32px] p-7 sm:p-8 flex flex-col justify-between min-h-[380px] sm:min-h-[420px] relative overflow-hidden group transition-all duration-300 hover:scale-[1.02] shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
                            <div className="flex items-start justify-between">
                                <div className="emblem-wrapper w-12 h-12 rounded-full bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-2.5 shadow-lg border border-white/10">
                                    <svg className="w-full h-full text-slate-200" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 32 32">
                                        <circle className="stroke-white/80" cx="16" cy="16" r="13" />
                                        <path className="stroke-cyan-200" d="M16 3v26" />
                                        <path className="stroke-sky-300" d="M6 16c2.5 5.5 6.5 8 10 8s7.5-2.5 10-8" />
                                        <path className="stroke-white/70" d="M6 16c2.5-5.5 6.5-8 10-8s7.5 2.5 10 8" />
                                    </svg>
                                </div>
                            </div>
                            <div className="mt-auto pt-16 sm:pt-20 z-10">
                                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3 tracking-tight">Step 3</h3>
                                <p className="text-slate-300/80 text-[14px] sm:text-[15px] leading-relaxed font-normal">
                                    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ips...
                                </p>
                            </div>
                        </article>
                    </div>
                </div>
            </section>

            {/* Pricing Section (Limpo, sem fundo de vidro por trás dos cards) */}
            <section id="precos" className="pricing-section w-full scroll-mt-24 relative overflow-hidden bg-black">
                <div className="w-full max-w-7xl mx-auto px-6 flex flex-col items-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="mb-10 text-center w-full flex flex-col items-center"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]">
                            Planos que cabem no seu negócio
                        </h2>
                        <p className="text-slate-300 text-base md:text-lg max-w-2xl mx-auto text-center font-normal drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
                            Escolha a melhor opção para impulsionar o seu atendimento com inteligência artificial.
                        </p>
                    </motion.div>

                    {/* Toggle com pílula de vidro para máxima legibilidade */}
                    <div className="flex items-center justify-center gap-4 mb-14 px-5 py-2.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                        <span className={`text-sm font-medium transition-colors ${billingCycle === 'monthly' ? 'text-white' : 'text-white/50'}`}>Mensal</span>
                        <button 
                            onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'annually' : 'monthly')}
                            className="w-14 h-7 rounded-full bg-white/10 border border-white/15 p-1 flex items-center transition-all"
                        >
                            <motion.div 
                                animate={{ x: billingCycle === 'monthly' ? 0 : 28 }}
                                className="w-5 h-5 rounded-full bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.6)]"
                            />
                        </button>
                        <span className={`text-sm font-medium transition-colors ${billingCycle === 'annually' ? 'text-white' : 'text-white/50'}`}>
                            Trimestral <span className="ml-1 text-[0.6rem] bg-blue-500/25 text-blue-300 px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold border border-blue-400/30">20% OFF</span>
                        </span>
                    </div>

                    <div className="pricing-grid">
                        <AnimatePresence mode="wait">
                            {plans.map((plan, idx) => (
                                <motion.div
                                    key={plan.name}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                                    className={`pricing-card group ${plan.popular ? 'popular' : ''}`}
                                >
                                    {plan.popular && (
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-300/15 border border-blue-200/30 text-blue-100 text-[11px] font-bold tracking-wider uppercase mb-3 z-10 shadow-[0_2px_12px_rgba(37,99,235,0.25)]">
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-300 animate-pulse" />
                                            {plan.badge}
                                        </div>
                                    )}
                                    <h3 className="pricing-tier-name z-10">{plan.name}</h3>
                                    <p className="pricing-tier-desc z-10">{plan.desc}</p>
                                    
                                    <div className="pricing-price-container z-10">
                                        <span className="pricing-currency">R$</span>
                                        <motion.span 
                                            key={plan.price}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="pricing-value"
                                        >
                                            {plan.price}
                                        </motion.span>
                                        <span className="pricing-period">/mês</span>
                                    </div>

                                    <ul className="pricing-feature-list z-10">
                                        {plan.features.map((feature, fIdx) => (
                                            <li key={fIdx} className="pricing-feature-item">
                                                <Check size={18} strokeWidth={3} className="check" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>

                                    <Link to="/signup" className="w-full z-10">
                                        <button className={`pricing-btn ${plan.popular ? 'primary' : ''}`}>
                                            {plan.cta}
                                             <ArrowRight size={18} />
                                        </button>
                                    </Link>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </section>

            {/* FAQ Section isolada e acelerada por hardware */}
            <FaqSection />

            {/* Corporate Footer (Estilo Lasy Expandido, Mais Alto e Bem Afastado do FAQ) */}
            <footer 
                className="w-full relative z-20 pb-32 pt-36 sm:pt-44 md:pt-56 px-3 sm:px-6 lg:px-8 bg-transparent flex flex-col items-center justify-center"
                style={{ marginTop: 'clamp(80px, 12vh, 180px)' }}
            >
                {/* Wrapper relativo com efeito de luz azul radiante no quadrado final */}
                <div className="relative w-full max-w-[1380px] flex justify-center">
                    {/* Efeito de luz flare radiante acima do quadrado */}
                    <div 
                        className="absolute -top-16 left-1/2 -translate-x-1/2 w-[85%] max-w-[1000px] h-[160px] pointer-events-none -z-10"
                        style={{
                            background: 'radial-gradient(ellipse at center, rgba(59, 130, 246, 0.45) 0%, rgba(37, 99, 235, 0.22) 40%, rgba(37, 99, 235, 0.05) 65%, transparent 75%)',
                            filter: 'blur(45px)',
                        }}
                    />

                    {/* Efeito de luz azul neon vibrante e pulsante embaixo do quadrado */}
                    <div 
                        className="absolute -bottom-14 left-1/2 -translate-x-1/2 w-[92%] max-w-[1200px] h-[190px] pointer-events-none -z-10"
                        style={{
                            background: 'radial-gradient(ellipse at center, rgba(37, 99, 235, 0.58) 0%, rgba(59, 130, 246, 0.32) 36%, rgba(37, 99, 235, 0.12) 60%, transparent 75%)',
                            filter: 'blur(40px)',
                        }}
                    />

                    {/* O quadrado do rodapé com estilo futurista e efeitos luminosos */}
                    <div 
                        className="w-full rounded-[28px] sm:rounded-[36px] bg-[#07090e] border border-blue-500/25 relative overflow-hidden shadow-[0_0_60px_-15px_rgba(59,130,246,0.3)] flex flex-col"
                        style={{
                            paddingTop: '36px',
                            paddingBottom: '28px',
                            paddingLeft: 'clamp(24px, 4vw, 56px)',
                            paddingRight: 'clamp(24px, 4vw, 56px)',
                        }}
                    >
                        {/* Feixe laser luminoso neon no topo do quadrado */}
                        <div 
                            className="absolute top-0 inset-x-0 h-[2px] z-20 pointer-events-none"
                            style={{
                                background: 'linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.25) 15%, rgba(96, 165, 250, 0.95) 50%, rgba(59, 130, 246, 0.25) 85%, transparent 100%)',
                                boxShadow: '0 0 24px rgba(96, 165, 250, 0.8), 0 0 8px rgba(59, 130, 246, 0.9)'
                            }}
                        />

                        {/* Luz ambiente interna azul sutil no topo do quadrado */}
                        <div 
                            className="absolute top-0 inset-x-0 h-[140px] pointer-events-none"
                            style={{ 
                                background: 'radial-gradient(ellipse at top center, rgba(59, 130, 246, 0.22) 0%, rgba(37, 99, 235, 0.06) 50%, transparent 75%)' 
                            }}
                        />

                        {/* Luz ambiente interna azul sutil na base do quadrado */}
                        <div 
                            className="absolute bottom-0 inset-x-0 h-[100px] pointer-events-none"
                            style={{ 
                                background: 'radial-gradient(ellipse at bottom center, rgba(37, 99, 235, 0.22) 0%, rgba(59, 130, 246, 0.06) 50%, transparent 75%)' 
                            }}
                        />

                        {/* Conteúdo Principal do Footer (Estilo Lasy: 3 Colunas Limpas e Elegantes) */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-8 items-start relative z-10">
                            {/* Coluna 1: Logo Bexly (apenas imagem enviada) + Descrição */}
                            <div className="md:col-span-6 lg:col-span-6 flex flex-col items-start text-left pr-0 md:pr-12">
                                <Link to="/" className="inline-block mb-5 group">
                                    <img 
                                        src={logoIcon} 
                                        alt="Bexly Logo" 
                                        className="h-9 sm:h-10 w-auto object-contain transition-transform duration-200 group-hover:scale-105" 
                                    />
                                </Link>
                                <p 
                                    className="text-slate-400 text-sm sm:text-[0.925rem] leading-relaxed max-w-sm font-normal"
                                    style={{ marginTop: '10px' }}
                                >
                                    Democratizando o atendimento e vendas inteligentes. Transforme conversas no WhatsApp em resultados e escala em minutos.
                                </p>
                            </div>

                            {/* Coluna 2: Produto */}
                            <div className="md:col-span-3 lg:col-span-3 flex flex-col items-start text-left">
                                <h4 className="text-white font-semibold text-xs sm:text-sm tracking-wider uppercase mb-4 text-slate-200">Produto</h4>
                                <ul className="space-y-3 text-sm text-slate-400">
                                    <li><a href="#recursos" className="hover:text-white transition-colors">IA Conversacional</a></li>
                                    <li><a href="#recursos" className="hover:text-white transition-colors">Cobrança no Chat</a></li>
                                    <li><a href="#recursos" className="hover:text-white transition-colors">WhatsApp Oficial</a></li>
                                    <li><a href="#precos" className="hover:text-white transition-colors">Planos & Preços</a></li>
                                    <li><a href="#vitrines" className="hover:text-white transition-colors">Vitrines Digitais</a></li>
                                </ul>
                            </div>

                            {/* Coluna 3: Legal */}
                            <div className="md:col-span-3 lg:col-span-3 flex flex-col items-start text-left">
                                <h4 className="text-white font-semibold text-xs sm:text-sm tracking-wider uppercase mb-4 text-slate-200">Legal</h4>
                                <ul className="space-y-3 text-sm text-slate-400">
                                    <li><a href="#recursos" className="hover:text-white transition-colors">Política de Privacidade</a></li>
                                    <li><a href="#recursos" className="hover:text-white transition-colors">Termos de Uso</a></li>
                                    <li><a href="#recursos" className="hover:text-white transition-colors">Segurança da Informação</a></li>
                                    <li><a href="#recursos" className="hover:text-white transition-colors">Conformidade LGPD</a></li>
                                </ul>
                            </div>
                        </div>

                        {/* Linha Divisória de Lateral a Lateral do Quadrado com respiro garantido acima e abaixo */}
                        <div 
                            className="h-px bg-white/[0.08] relative z-10" 
                            style={{
                                marginLeft: 'calc(-1 * clamp(24px, 4vw, 56px))',
                                marginRight: 'calc(-1 * clamp(24px, 4vw, 56px))',
                                width: 'calc(100% + 2 * clamp(24px, 4vw, 56px))',
                                marginTop: '36px',
                                marginBottom: '28px',
                            }}
                        />

                        {/* Barra Inferior: Afastada da linha para o ícone do Instagram respirar livremente */}
                        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-5">
                            <div className="flex items-center">
                                <a 
                                    href="https://www.instagram.com/bexlybr?vrfl=MTEyaHA3cWExcDJ3cg%3D%3D&utm_source=qr" 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 hover:border-pink-500/40 hover:bg-pink-500/10 text-slate-400 hover:text-white flex items-center justify-center transition-all duration-200 shadow-sm hover:scale-105 active:scale-95 group"
                                    aria-label="Instagram"
                                >
                                    <Instagram size={18} className="transition-transform group-hover:scale-110" />
                                </a>
                            </div>

                            <div className="text-center sm:text-right">
                                <p className="text-slate-400 text-xs sm:text-[0.825rem] tracking-wide font-normal">
                                    © 2026 BEXLY ENTERPRISES. TODOS OS DIREITOS RESERVADOS.
                                </p>
                                <p className="text-slate-500 text-[0.68rem] sm:text-xs tracking-wider uppercase mt-1 font-medium">
                                    FORNECENDO INFRAESTRUTURA TECNOLÓGICA DE PONTA PARA EMPRESAS MODERNAS.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

// Dados estáticos de FAQ fora dos componentes para evitar recriação de referências
const FAQS = [
    {
        q: "Como a Bexly se integra com o meu WhatsApp e redes sociais?",
        a: "A integração é 100% oficial e rápida. Basta escanear o QR Code no painel ou conectar suas contas do Instagram e Facebook em poucos cliques, sem necessidade de conhecimentos técnicos."
    },
    {
        q: "O bot realmente entende áudios dos clientes?",
        a: "Sim! Nos planos Pro e Premium, a IA da Bexly transcreve e compreende áudios com precisão cirúrgica e responde naturalmente por texto ou com voz humanizada."
    },
    {
        q: "Como funcionam as cobranças automáticas dentro da conversa?",
        a: "A IA gera links de checkout, chaves PIX dinâmicas e QR Codes na própria conversa, identificando a confirmação do pagamento em tempo real para liberar o pedido ou acesso."
    },
    {
        q: "Preciso manter o celular ou computador ligado 24h?",
        a: "Não. A infraestrutura da Bexly opera inteiramente na nuvem em servidores de alta disponibilidade. O seu atendimento e vendas continuam funcionando mesmo com seu celular desligado."
    },
    {
        q: "Posso intervir e conversar manualmente com um cliente a qualquer momento?",
        a: "Com certeza! Você e sua equipe têm uma central única de atendimento onde podem pausar a IA, assumir a conversa em tempo real e transferir para qualquer departamento."
    }
];

// FaqSection com aceleração total de GPU, AnimatePresence e zero reflow travado
const FaqSection = React.memo(() => {
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const toggleFaq = (idx: number) => {
        setOpenFaq((prev) => (prev === idx ? null : idx));
    };

    return (
        <section 
            id="faq" 
            className="w-full relative z-20 pt-16 md:pt-24 pb-36 md:pb-48 overflow-hidden bg-black scroll-mt-24"
        >
            <div className="faq-wrapper relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="faq-header"
                >
                    <div className="faq-eyebrow">
                        <span className="faq-eyebrow-dot" />
                        <span>FAQ</span>
                    </div>
                    <h2 className="faq-title">Perguntas Frequentes</h2>
                </motion.div>

                <div className="faq-list">
                    {FAQS.map((faq, idx) => {
                        const isOpen = openFaq === idx;
                        return (
                            <div
                                key={idx}
                                className={`faq-card ${isOpen ? 'open' : ''}`}
                            >
                                <div className="faq-card-ambient-glow" />

                                <button 
                                    type="button" 
                                    className="faq-card-head"
                                    onClick={() => toggleFaq(idx)}
                                    aria-expanded={isOpen}
                                >
                                    <div className="faq-card-left">
                                        <span className="faq-card-question-text">
                                            {faq.q}
                                        </span>
                                    </div>
                                    <span className="faq-card-icon-circle">
                                        <Plus size={16} strokeWidth={2.4} className="faq-card-plus-icon" />
                                    </span>
                                </button>

                                <AnimatePresence initial={false}>
                                    {isOpen && (
                                        <motion.div
                                            key="answer"
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ 
                                                height: 'auto', 
                                                opacity: 1,
                                                transition: {
                                                    height: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
                                                    opacity: { duration: 0.15, ease: 'easeOut' }
                                                }
                                            }}
                                            exit={{ 
                                                height: 0, 
                                                opacity: 0,
                                                transition: {
                                                    height: { duration: 0.16, ease: [0.16, 1, 0.3, 1] },
                                                    opacity: { duration: 0.1, ease: 'easeIn' }
                                                }
                                            }}
                                            style={{ overflow: 'hidden' }}
                                        >
                                            <div className="faq-card-divider" />
                                            <p className="faq-card-answer-text">{faq.a}</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
});

export default Home;
