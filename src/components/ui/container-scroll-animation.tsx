"use client";
import React, { useRef } from "react";
import { useScroll, useTransform, motion, MotionValue, useSpring } from "framer-motion";

export const ContainerScroll = ({
  titleComponent,
  children,
}: {
  titleComponent: string | React.ReactNode;
  children: React.ReactNode;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 24,
    mass: 0.2,
    restDelta: 0.001,
  });

  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const scaleDimensions = () => {
    return isMobile ? [0.75, 0.92] : [0.98, 1];
  };

  const rotate = useTransform(smoothProgress, [0, 1], [18, 0]);
  const scale = useTransform(smoothProgress, [0, 1], scaleDimensions());
  const translate = useTransform(smoothProgress, [0, 1], [0, -60]);

  return (
    <div
      className="h-[48rem] md:h-[68rem] flex items-center justify-center relative p-2 md:p-6"
      ref={containerRef}
    >
      <div
        className="py-6 md:py-24 w-full relative"
        style={{
          perspective: "1000px",
        }}
      >
        <Header translate={translate} titleComponent={titleComponent} />
        <Card rotate={rotate} translate={translate} scale={scale}>
          {children}
        </Card>
      </div>
    </div>
  );
};

export const Header = ({ translate, titleComponent }: any) => {
  return (
    <motion.div
      style={{
        translateY: translate,
        willChange: "transform",
      }}
      className="div max-w-5xl mx-auto text-center"
    >
      {titleComponent}
    </motion.div>
  );
};

export const Card = ({
  rotate,
  scale,
  children,
}: {
  rotate: MotionValue<number>;
  scale: MotionValue<number>;
  translate: MotionValue<number>;
  children: React.ReactNode;
}) => {
  return (
    <motion.div
      style={{
        rotateX: rotate,
        scale,
        willChange: "transform",
        transformStyle: "preserve-3d",
        backfaceVisibility: "hidden",
        boxShadow:
          "0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px rgba(59, 130, 246, 0.08)",
      }}
      className="max-w-5xl -mt-8 mx-auto h-[28rem] md:h-[38rem] w-full border-2 border-white/10 p-2 md:p-5 bg-[#141417] rounded-[28px]"
    >
      <div className="h-full w-full overflow-hidden rounded-2xl bg-zinc-900 md:rounded-2xl">
        {children}
      </div>
    </motion.div>
  );
};
