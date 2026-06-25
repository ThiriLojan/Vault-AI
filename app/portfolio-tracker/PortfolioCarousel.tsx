"use client";
import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import PortfolioCard from "./PortfolioCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PortfolioCarouselProps {
    stocks: {
        symbol: string;
        buyPrice: number;
        quantity: number;
        currentPrice?: number;
    }[];
}

export default function PortfolioCarousel({ stocks }: PortfolioCarouselProps) {
    const [emblaRef, emblaApi] = useEmblaCarousel({ 
        loop: true, 
        align: "start",
        slidesToScroll: 1,
    });
    
    const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
    const [nextBtnEnabled, setNextBtnEnabled] = useState(false);

    const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setPrevBtnEnabled(emblaApi.canScrollPrev());
        setNextBtnEnabled(emblaApi.canScrollNext());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        onSelect();
        emblaApi.on("select", onSelect);
        emblaApi.on("reInit", onSelect);
    }, [emblaApi, onSelect]);

    return (
        <div className="relative group w-full px-12">
            {/* Left Scroll Button */}
            <button 
                onClick={(e) => { e.preventDefault(); scrollPrev(); }}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-[#080b16] border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-teal-500/20 hover:text-teal-400 hover:border-teal-500/50 shadow-lg"
            >
                <ChevronLeft size={20} />
            </button>

            {/* Embla Viewport */}
            <div className="overflow-hidden w-full py-2 px-1" ref={emblaRef}>
                <div className="flex" style={{ marginLeft: '-24px' }}>
                    {stocks.map((stock, index) => (
                        <div key={index} className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.333333%] min-w-0 pl-[24px] h-full">
                            <PortfolioCard stock={stock} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Scroll Button */}
            <button 
                onClick={(e) => { e.preventDefault(); scrollNext(); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-[#080b16] border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-teal-500/20 hover:text-teal-400 hover:border-teal-500/50 shadow-lg"
            >
                <ChevronRight size={20} />
            </button>
        </div>
    );
}
