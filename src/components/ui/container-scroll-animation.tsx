"use client";
import React, { useRef } from "react";
import { useScroll, useTransform, motion, MotionValue } from "framer-motion";

export const ContainerScroll = ({
  titleComponent,
  children,
}: {
  titleComponent?: string | React.ReactNode;
  children: React.ReactNode;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
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
    return isMobile ? [0.70, 0.82] : [0.80, 0.90];
  };

  const rotate = useTransform(scrollYProgress, [0, 0.7], [16, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.7], scaleDimensions());

  return (
    <div
      className="w-full flex flex-col items-center justify-start relative px-2 sm:px-4"
      ref={containerRef}
    >
      <div
        className="w-full relative flex flex-col items-center justify-start"
        style={{
          perspective: "1000px",
        }}
      >
        {titleComponent && <Header titleComponent={titleComponent} />}
        <div style={{ height: '42px' }} className="w-full shrink-0 pointer-events-none" aria-hidden="true" />
        <Card rotate={rotate} scale={scale}>
          {children}
        </Card>
      </div>
    </div>
  );
};

export const Header = ({ titleComponent }: any) => {
  if (!titleComponent) return null;
  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center text-center px-4">
      {titleComponent}
    </div>
  );
};

export const Card = ({
  rotate,
  scale,
  children,
}: {
  rotate: MotionValue<number>;
  scale: MotionValue<number>;
  children: React.ReactNode;
}) => {
  return (
    <motion.div
      style={{
        rotateX: rotate,
        scale,
        transformOrigin: "top center",
        willChange: "transform",
        transformStyle: "preserve-3d",
        backfaceVisibility: "hidden",
        boxShadow:
          "0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px rgba(59, 130, 246, 0.08)",
      }}
      className="max-w-4xl mx-auto h-[24rem] sm:h-[28rem] md:h-[35rem] w-full border-2 border-white/10 p-2 md:p-4 bg-[#141417] rounded-[24px]"
    >
      <div className="h-full w-full overflow-hidden rounded-xl bg-zinc-900">
        {children}
      </div>
    </motion.div>
  );
};
