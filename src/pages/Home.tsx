import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Spotlight } from '../components/ui/spotlight';
import { ArrowRight, Check, Bot, CreditCard, LayoutGrid, MapPin, RotateCcw, FileText, Plus, Minus } from 'lucide-react';
import { ContainerScroll } from '../components/ui/container-scroll-animation';

import logoIcon from '../assets/logo-bexly-one.png';

import platformPreview from '../platform-preview.png';
import heroBg from '../assets/hero-gradiente-celeste.png';
import ondasBg from '../assets/padrao-luz-azul.png';
import faqHorizonBg from '../assets/faq-horizon-bg.png';

const Home = () => {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');
    const [activeNav, setActiveNav] = useState<string>('recursos');
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const navItems = [
        { id: 'recursos', label: 'Recursos', targetId: 'recursos' },
        { id: 'vitrines', label: 'Vitrines', targetId: 'vitrines' },
        { id: 'precos', label: 'Preços', targetId: 'precos' },
        { id: 'faq', label: 'Perguntas', targetId: 'faq' },
    ];

    const handleNavClick = (id: string) => {
        setActiveNav(id);
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const plans = [
        // ... (plans logic remains same)
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

    const faqs = [
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

    return (
        <div className="home-container min-h-screen relative bg-black selection:bg-blue-500/30 overflow-x-hidden">
            {/* Professional Blue Ray Background */}
            <div className="hero-beams-container">
                <div className="hero-beam-glow" />
                {/* Diagonal Rays */}
                <div className="hero-beam" style={{ opacity: 0.5, transform: 'rotate(-15deg) scale(1.2)' }} />
                <div className="hero-beam" style={{ opacity: 0.3, transform: 'rotate(15deg) scale(1.2)' }} />
                <div className="hero-beam" style={{ opacity: 0.2, transform: 'rotate(-45deg) scale(1.5)' }} />
                
                {/* Legacy Spotlights for depth */}
                <Spotlight
                    className="-top-40 left-0 md:left-60 md:-top-20"
                    fill="rgba(59, 130, 246, 0.2)"
                />
                <Spotlight
                    className="top-10 left-full md:left-[80%] -translate-x-1/2"
                    fill="rgba(37, 99, 235, 0.1)"
                />
            </div>

            {/* Navigation */}
            <nav className="glass-nav fixed top-0 left-0 right-0 z-[100] h-[80px] flex items-center justify-between px-6 md:px-10 backdrop-blur-xl bg-black/40 border-b border-white/5">
                <div style={{ width: 'var(--sidebar-width, 260px)', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
                        <img
                            src={logoIcon}
                            alt="Bexly Logo"
                            style={{ height: '38px', width: 'auto', objectFit: 'contain', display: 'block' }}
                        />
                    </Link>
                </div>

                {/* Center: Navigation Pills (Reference style with generous padding and margins) */}
                <div className="hidden md:flex items-center absolute left-1/2 -translate-x-1/2">
                    <div className="nav-pill-container">
                        {navItems.map((item) => {
                            const isActive = activeNav === item.id;
                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => handleNavClick(item.id)}
                                    className={`nav-pill-btn ${isActive ? 'active' : ''}`}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeNavPill"
                                            className="nav-pill-btn-active-bg"
                                            transition={{ type: "spring", stiffness: 400, damping: 32 }}
                                        />
                                    )}
                                    <span className="nav-pill-label">{item.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Right: Auth Links (shifted to the left) */}
                <div 
                    className="flex-1 flex items-center justify-end gap-7"
                    style={{ marginRight: '80px' }}
                >
                    <Link to="/login" className="text-[0.9rem] font-medium text-white/70 hover:text-white transition-all">Login</Link>
                    <Link to="/signup">
                        <button className="glow-pill-button">
                            Criar conta
                        </button>
                    </Link>
                </div>
            </nav>

            {/* ─── HERO BLOCK ─── bg + título + scroll dentro de um único container ─── */}
            <div className="relative w-full" style={{ marginTop: '-80px' }}>
                {/* Imagem de fundo com mask-image e overlay gradual puro */}
                <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                    <img
                        src={heroBg}
                        alt=""
                        aria-hidden="true"
                        className="w-full h-full object-cover object-top"
                        style={{
                            WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 50%, rgba(0,0,0,0.6) 70%, rgba(0,0,0,0.2) 85%, transparent 100%)',
                            maskImage: 'linear-gradient(to bottom, black 0%, black 50%, rgba(0,0,0,0.6) 70%, rgba(0,0,0,0.2) 85%, transparent 100%)',
                        }}
                    />
                    {/* Camada complementar de sombra suave para transição perfeitamente contínua */}
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            background: 'linear-gradient(to bottom, transparent 0%, transparent 40%, rgba(0,0,0,0.3) 65%, rgba(0,0,0,0.85) 85%, #000000 100%)',
                        }}
                    />
                </div>

                {/* Conteúdo: pt-[80px] para compensar a navbar, depois título + scroll */}
                <main className="relative z-10 w-full overflow-x-hidden pt-[80px]">
                    <div className="flex flex-col items-center overflow-visible pb-16 md:pb-24 pt-0">
                        <ContainerScroll
                            titleComponent={
                                <div className="flex flex-col items-center mb-2">
                                    <h1 className="text-4xl md:text-[5.5rem] lg:text-[6.2rem] font-extrabold leading-none tracking-tight text-center w-full bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                                        Bexly Inteligência
                                    </h1>
                                </div>
                            }
                        >
                            <img
                                src={platformPreview}
                                alt="hero"
                                className="mx-auto rounded-2xl object-cover h-full object-left-top w-full"
                                draggable={false}
                            />
                        </ContainerScroll>
                    </div>
                </main>
            </div>
            {/* ─── FIM DO HERO BLOCK ─── */}

            {/* Features Showcase Section (Transição limpa sobre fundo preto profundo) */}
            <section id="recursos" className="w-full relative z-20 pt-8 md:pt-12 pb-24 md:pb-32 overflow-hidden flex justify-center bg-black scroll-mt-24">
                {/* Ambient Soft Glow Behind Section */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-blue-600/10 blur-[160px] pointer-events-none rounded-full" />

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
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="relative bg-gradient-to-br from-[#0b1324] via-[#0d162a] to-[#101b33] border border-slate-800/90 rounded-[22px] p-7 sm:p-8 transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.35)] flex flex-col justify-start min-h-[250px]"
                        >
                            <div className="w-11 h-11 rounded-xl bg-[#142138] border border-sky-400/20 text-sky-400 flex items-center justify-center mb-6">
                                <Bot size={22} strokeWidth={2.2} />
                            </div>
                            <h3 className="text-xl sm:text-[22px] font-bold text-white mb-2.5 tracking-tight text-left">
                                Fala como uma pessoa
                            </h3>
                            <p className="text-slate-400 text-[13.5px] sm:text-[14px] leading-relaxed font-normal text-left">
                                Sua IA conversa de forma natural, com o nome e o tom que você escolher. Conhece seus produtos de cor e nunca perde a paciência. Seus clientes jamais notam a diferença.
                            </p>
                        </motion.div>

                        {/* Card 2: Cobra dentro do chat */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="relative bg-gradient-to-br from-[#0b1324] via-[#0d162a] to-[#101b33] border border-slate-800/90 rounded-[22px] p-7 sm:p-8 transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.35)] flex flex-col justify-start min-h-[250px]"
                        >
                            <div className="w-11 h-11 rounded-xl bg-[#142138] border border-sky-400/20 text-sky-400 flex items-center justify-center mb-6">
                                <CreditCard size={22} strokeWidth={2.2} />
                            </div>
                            <h3 className="text-xl sm:text-[22px] font-bold text-white mb-2.5 tracking-tight text-left">
                                Cobra dentro do chat
                            </h3>
                            <p className="text-slate-400 text-[13.5px] sm:text-[14px] leading-relaxed font-normal text-left">
                                Cartões, QR, Tigo Money, Personal Pay, MercadoPago e mais. O cliente paga sem sair da conversa e você recebe o aviso na hora.
                            </p>
                        </motion.div>
                    </div>

                    {/* Bento Grid: 4 Cards on Bottom (White Cards Matching Reference Photo) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full">
                        {/* Card 3: Tudo em um só lugar */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: 0.1 }}
                            className="relative bg-white rounded-[22px] p-6 sm:p-7 flex flex-col justify-start border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.06)] min-h-[220px]"
                        >
                            <div className="w-11 h-11 rounded-xl bg-[#edf5ff] border border-sky-100 text-sky-600 flex items-center justify-center mb-6">
                                <LayoutGrid size={22} strokeWidth={2.2} />
                            </div>
                            <h4 style={{ color: '#0f172a' }} className="text-[17px] font-bold mb-2 leading-snug tracking-tight text-left">
                                Tudo em um só lugar
                            </h4>
                            <p style={{ color: '#64748b' }} className="text-[13px] sm:text-[13.5px] leading-relaxed font-normal text-left">
                                Todas as conversas de todos os canais em uma única tela.
                            </p>
                        </motion.div>

                        {/* Card 4: Envia o vendedor mais próximo */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: 0.2 }}
                            className="relative bg-white rounded-[22px] p-6 sm:p-7 flex flex-col justify-start border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.06)] min-h-[220px]"
                        >
                            <div className="w-11 h-11 rounded-xl bg-[#edf5ff] border border-sky-100 text-sky-600 flex items-center justify-center mb-6">
                                <MapPin size={22} strokeWidth={2.2} />
                            </div>
                            <h4 style={{ color: '#0f172a' }} className="text-[17px] font-bold mb-2 leading-snug tracking-tight text-left">
                                Envia o vendedor mais próximo
                            </h4>
                            <p style={{ color: '#64748b' }} className="text-[13px] sm:text-[13.5px] leading-relaxed font-normal text-left">
                                Quando um cliente quer ver o produto, ela designa o vendedor da região dele.
                            </p>
                        </motion.div>

                        {/* Card 5: Insiste por você */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: 0.3 }}
                            className="relative bg-white rounded-[22px] p-6 sm:p-7 flex flex-col justify-start border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.06)] min-h-[220px]"
                        >
                            <div className="w-11 h-11 rounded-xl bg-[#edf5ff] border border-sky-100 text-sky-600 flex items-center justify-center mb-6">
                                <RotateCcw size={22} strokeWidth={2.2} />
                            </div>
                            <h4 style={{ color: '#0f172a' }} className="text-[17px] font-bold mb-2 leading-snug tracking-tight text-left">
                                Insiste por você
                            </h4>
                            <p style={{ color: '#64748b' }} className="text-[13px] sm:text-[13.5px] leading-relaxed font-normal text-left">
                                Se um cliente não responde, a IA escreve de novo no momento certo.
                            </p>
                        </motion.div>

                        {/* Card 6: Nota fiscal eletrônica */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: 0.4 }}
                            className="relative bg-white rounded-[22px] p-6 sm:p-7 flex flex-col justify-start border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.06)] min-h-[220px]"
                        >
                            <div className="w-11 h-11 rounded-xl bg-[#edf5ff] border border-sky-100 text-sky-600 flex items-center justify-center mb-6">
                                <FileText size={22} strokeWidth={2.2} />
                            </div>
                            <h4 style={{ color: '#0f172a' }} className="text-[17px] font-bold mb-2 leading-snug tracking-tight text-left">
                                Nota fiscal eletrônica
                            </h4>
                            <p style={{ color: '#64748b' }} className="text-[13px] sm:text-[13.5px] leading-relaxed font-normal text-left">
                                Emite faturas legais (SIFEN) automaticamente a cada venda.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="precos" className="pricing-section w-full scroll-mt-24">
                <div className="w-full max-w-7xl mx-auto px-6 flex flex-col items-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="mb-12 text-center w-full flex flex-col items-center"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">Planos que cabem no seu negócio</h2>
                        <p className="text-white/40 text-lg max-w-2xl mx-auto text-center">Escolha a melhor opção para impulsionar o seu atendimento com inteligência artificial.</p>
                    </motion.div>

                    {/* Toggle */}
                    <div className="flex items-center justify-center gap-4 mb-16">
                        <span className={`text-sm font-medium transition-colors ${billingCycle === 'monthly' ? 'text-white' : 'text-white/40'}`}>Mensal</span>
                        <button 
                            onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'annually' : 'monthly')}
                            className="w-14 h-7 rounded-full bg-white/5 border border-white/10 p-1 flex items-center transition-all"
                        >
                            <motion.div 
                                animate={{ x: billingCycle === 'monthly' ? 0 : 28 }}
                                className="w-5 h-5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                            />
                        </button>
                        <span className={`text-sm font-medium transition-colors ${billingCycle === 'annually' ? 'text-white' : 'text-white/40'}`}>
                            Trimestral <span className="ml-1 text-[0.6rem] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full uppercase tracking-wider">20% OFF</span>
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
                                    {/* Background Image: Padrão Abstrato de Luz Azul Vertical (Bem visível e nítido) */}
                                    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden rounded-[32px]">
                                        <img
                                            src={ondasBg}
                                            alt=""
                                            aria-hidden="true"
                                            className="w-full h-full object-cover object-center opacity-85 group-hover:opacity-100 transition-all duration-700 transform group-hover:scale-105"
                                        />
                                        {/* Overlay leve e translúcido para manter o fundo bem nítido enquanto garante leitura dos textos */}
                                        <div 
                                            className="absolute inset-0"
                                            style={{
                                                background: plan.popular
                                                    ? 'linear-gradient(180deg, rgba(3, 7, 18, 0.4) 0%, rgba(3, 7, 18, 0.65) 50%, rgba(3, 7, 18, 0.85) 100%)'
                                                    : 'linear-gradient(180deg, rgba(2, 6, 16, 0.45) 0%, rgba(2, 6, 16, 0.7) 50%, rgba(2, 6, 16, 0.88) 100%)'
                                            }}
                                        />
                                    </div>

                                    {plan.popular && (
                                        <div className="pricing-badge-popular z-10">{plan.badge}</div>
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

            {/* FAQ Section with Blue Glow Accent & Curved Horizon Image as Background */}
            <section 
                id="faq" 
                className="w-full relative z-20 pt-8 md:pt-14 pb-20 md:pb-24 overflow-hidden bg-black scroll-mt-24"
            >
                {/* Imagem do Horizonte Cósmico ancorada pelo topo */}
                <div 
                    className="absolute inset-x-0 top-0 h-[820px] md:h-[900px] overflow-hidden pointer-events-none z-0 flex items-center justify-center"
                    style={{ transform: 'translateZ(0)', willChange: 'transform' }}
                >
                    <img
                        src={faqHorizonBg}
                        alt=""
                        aria-hidden="true"
                        className="w-full max-w-[1700px] h-full object-cover object-top select-none opacity-90"
                    />
                    {/* Luz azul suave usando gradiente radial direto sem filtros pesados */}
                    <div 
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[1100px] h-[75%] pointer-events-none"
                        style={{
                            background: 'radial-gradient(ellipse at center, rgba(59, 130, 246, 0.22) 0%, rgba(37, 99, 235, 0.08) 50%, transparent 70%)',
                            transform: 'translateZ(0)'
                        }}
                    />
                </div>

                <div className="faq-wrapper">
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
                        {faqs.map((faq, idx) => {
                            const isOpen = openFaq === idx;
                            return (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.4, delay: idx * 0.06 }}
                                    className={`faq-card ${isOpen ? 'open' : ''}`}
                                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                                >
                                    <div className="faq-card-glow" />
                                    <div className="faq-card-glow-core" />

                                    <button type="button" className="faq-card-head">
                                        <span className="faq-card-question">
                                            <span className="faq-card-num">{String(idx + 1).padStart(2, '0')}</span>
                                            {faq.q}
                                        </span>
                                        <span className="faq-card-icon">
                                            {isOpen ? <Minus size={18} strokeWidth={2} /> : <Plus size={18} strokeWidth={2} />}
                                        </span>
                                    </button>

                                    <div className="faq-card-collapse">
                                        <div className="faq-card-collapse-inner">
                                            <p className="faq-card-answer">{faq.a}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Corporate Footer */}
            <footer 
                className="relative z-10 px-6 text-center border-t border-white/[0.04] bg-black"
                style={{ paddingTop: '56px', paddingBottom: '48px' }}
            >
                <p className="text-white/20 text-[0.72rem] max-w-2xl mx-auto leading-relaxed uppercase tracking-[0.3em] font-semibold">
                    © 2026 Bexly Enterprises. Todos os direitos reservados.
                    <span className="block mt-2 font-normal opacity-60 tracking-wider">Fornecendo infraestrutura tecnológica de ponta para empresas modernas.</span>
                </p>
            </footer>
        </div>
    );
};

export default Home;
