import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Spotlight } from '../components/ui/spotlight';
import { ArrowRight, Check, Bot, CreditCard, LayoutGrid, MapPin, RotateCcw, FileText } from 'lucide-react';
import { ContainerScroll } from '../components/ui/container-scroll-animation';

import logoIcon from '../logotipo-5.png';

import platformPreview from '../platform-preview.png';

const Home = () => {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');

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
            <nav className="glass-nav fixed top-0 left-0 right-0 z-[100] h-[80px] flex items-center justify-between pr-8 md:pr-12 backdrop-blur-xl bg-black/40 border-b border-white/5">
                <div style={{ width: 'var(--sidebar-width, 260px)', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
                        <img
                            src={logoIcon}
                            alt="Bexly Logo"
                            style={{ height: '38px', width: 'auto', objectFit: 'contain', display: 'block' }}
                        />
                    </Link>
                </div>

                {/* Center: Navigation Links */}
                <div className="hidden md:flex items-center gap-12 flex-2 justify-center absolute left-1/2 -translate-x-1/2">
                    <span className="text-[0.7rem] font-bold text-white/50 hover:text-white transition-colors cursor-pointer tracking-[0.2em] uppercase">Preços</span>
                    <span className="text-[0.7rem] font-bold text-white/50 hover:text-white transition-colors cursor-pointer tracking-[0.2em] uppercase">Recursos</span>
                    <span className="text-[0.7rem] font-bold text-white/50 hover:text-white transition-colors cursor-pointer tracking-[0.2em] uppercase">Vitrines</span>
                </div>

                {/* Right: Auth Links */}
                <div className="flex-1 flex items-center justify-end gap-8">
                    <Link to="/login" className="text-[0.9rem] font-medium text-white/70 hover:text-white transition-all">Login</Link>
                    <Link to="/signup">
                        <button className="premium-button text-[0.75rem] px-6 py-2.5 min-w-[130px] font-bold">
                            Criar conta
                        </button>
                    </Link>
                </div>
            </nav>

            {/* Hero Section with Exact Demo Content */}
            <main className="relative z-10 w-full overflow-x-hidden">
                <div className="flex flex-col items-center overflow-visible pb-0 pt-[30px] md:pt-[50px]">
                    <ContainerScroll
                        titleComponent={
                            <div className="flex flex-col items-center mb-4">
                                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-semibold tracking-wider uppercase mb-5 shadow-sm">
                                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                                    Plataforma Tudo-em-Um de Vendas & IA
                                </div>
                                <h1 className="text-3xl md:text-5xl lg:text-6xl font-semibold text-white text-center w-full tracking-tight">
                                    Automatize seu Atendimento e Vendas <br />
                                    <span className="text-4xl md:text-[5.5rem] lg:text-[6.2rem] font-extrabold mt-3 leading-none bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent block">
                                        Bexly Inteligência
                                    </span>
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

            {/* Features Showcase Section (Exact Match to User Reference) */}
            <section className="w-full relative z-20 -mt-16 md:-mt-24 pt-4 md:pt-6 pb-24 md:pb-32 overflow-hidden flex justify-center">
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
            <section className="pricing-section w-full">
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
                                    className={`pricing-card ${plan.popular ? 'popular' : ''}`}
                                >
                                    {plan.popular && (
                                        <div className="pricing-badge-popular">{plan.badge}</div>
                                    )}
                                    <h3 className="pricing-tier-name">{plan.name}</h3>
                                    <p className="pricing-tier-desc">{plan.desc}</p>
                                    
                                    <div className="pricing-price-container">
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

                                    <ul className="pricing-feature-list">
                                        {plan.features.map((feature, fIdx) => (
                                            <li key={fIdx} className="pricing-feature-item">
                                                <Check size={18} strokeWidth={3} className="check" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>

                                    <Link to="/signup" className="w-full">
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

            {/* Ambient Background Glows */}
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full aspect-square max-w-[1200px] pointer-events-none z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.08)_0%,transparent_70%)]" />
            </div>

            {/* Corporate Footer */}
            <footer className="relative z-10 py-24 px-6 text-center border-t border-white/[0.03] bg-black/20">
                <p className="text-white/10 text-[0.7rem] max-w-2xl mx-auto leading-relaxed uppercase tracking-[0.3em] font-bold">
                    © 2026 Bexly Enterprises. Todos os direitos reservados.
                    <span className="block mt-2 font-medium opacity-50 tracking-wider">Fornecendo infraestrutura tecnológica de ponta para empresas modernas.</span>
                </p>
            </footer>
        </div>
    );
};

export default Home;
