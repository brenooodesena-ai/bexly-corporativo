import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Spotlight } from '../components/ui/spotlight';
import { ArrowRight, Check } from 'lucide-react';
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
                <div className="flex flex-col items-center overflow-visible pb-[80px] md:pb-[140px] pt-[40px] md:pt-[70px]">
                    <ContainerScroll
                        titleComponent={
                            <>
                                <h1 className="text-4xl font-semibold text-black dark:text-white text-center w-full">
                                    Unleash the power of <br />
                                    <span className="text-4xl md:text-[6rem] font-bold mt-1 leading-none">
                                        Scroll Animations
                                    </span>
                                </h1>
                            </>
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
