"use client";
import Slider from "react-slick";
import PortfolioCard from "./PortfolioCard";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PortfolioSliderProps {
    stocks: {
        symbol: string;
        buyPrice: number;
        quantity: number;
        currentPrice?: number;
    }[];
}

const PrevArrow = (props: any) => {
    const { onClick } = props;
    return (
        <button
            onClick={onClick}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[#080b16] border border-white/10 flex items-center justify-center text-white transition-all hover:bg-teal-500/20 hover:text-teal-400 hover:border-teal-500/50 shadow-lg"
        >
            <ChevronLeft size={20} />
        </button>
    );
};

const NextArrow = (props: any) => {
    const { onClick } = props;
    return (
        <button
            onClick={onClick}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[#080b16] border border-white/10 flex items-center justify-center text-white transition-all hover:bg-teal-500/20 hover:text-teal-400 hover:border-teal-500/50 shadow-lg"
        >
            <ChevronRight size={20} />
        </button>
    );
};

export default function PortfolioSlider({ stocks }: PortfolioSliderProps) {
    const settings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 1,
        centerMode: true,
        centerPadding: "120px",
        prevArrow: <PrevArrow />,
        nextArrow: <NextArrow />,
        responsive: [
            { breakpoint: 1280, settings: { slidesToShow: 3, centerPadding: "60px" } },
            { breakpoint: 1024, settings: { slidesToShow: 2, centerPadding: "40px" } },
            { breakpoint: 768, settings: { slidesToShow: 1, centerPadding: "20px" } },
        ],
    };

    return (
        <div className="max-w-[100%] mx-auto py-2 px-12 relative block overflow-hidden portfolio-slider-container">
            <style dangerouslySetInnerHTML={{__html: `
                .portfolio-slider-container .slick-slide:not(.slick-active) {
                    opacity: 0.3;
                    filter: blur(4px);
                    transition: all 0.4s ease;
                    pointer-events: none;
                }
                .portfolio-slider-container .slick-slide.slick-active {
                    opacity: 1;
                    filter: blur(0px);
                    transition: all 0.4s ease;
                }
                .portfolio-slider-container .slick-slide {
                    padding: 0 16px;
                }
            `}} />
            <Slider {...settings}>
                {stocks.map((stock, index) => (
                    <div key={index} className="py-2">
                        <PortfolioCard stock={stock} />
                    </div>
                ))}
            </Slider>
        </div>
    );
}
