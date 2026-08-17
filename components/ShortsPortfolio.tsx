"use client";

import { useState, useEffect, useRef } from "react";
import {
  Code2,
  ExternalLink,
  Heart,
  ChevronDown,
  Play,
  Pause,
} from "lucide-react";

const DURATION_MS = 5000; // 게시물 1개당 자동 진행 시간 (5초)

/**
 * TODO(DB 연동 시 교체): 지금은 더미 데이터입니다.
 * 추후 Postgres에서 fetch한 프로젝트 목록으로 교체하세요.
 * 형태: { id, title, description, tags, hue, demo, likes }
 */
const PROJECTS = [
  {
    id: 1,
    title: "AI 뷰티 챗봇",
    description:
      "사용자 행동 로그를 분석해 실시간으로 콘텐츠를 추천하는 시스템",
    tags: ["#React", "#Zustand", "#Tailwind", "#3인"],
    hue: "teal",
    demo: "https://www.amoremall.com/kr/ko/aibc3/web/",
    likes: 128,
  },
  {
    id: 2,
    title: "영양정보 시스템",
    description: "여러 사용자가 동시에 문서를 편집할 수 있는 웹 에디터",
    tags: ["#React", "#SCSS", "#ContextAPI", "#2인"],
    hue: "plum",
    demo: "https://obalance.otoki.com/home",
    likes: 96,
  },
  {
    id: 3,
    title: "맛집 탐방 플랫폼",
    description: "이벤트 기반 아키텍처로 재구성한 이커머스 주문 시스템",
    tags: ["#Vue", "#Vuex", "#2인"],
    hue: "rust",
    demo: "#",
    likes: 74,
  },
  {
    id: 4,
    title: "고객 대기 시스템",
    description:
      "현장 대기 고객들이 웨이팅 등록하는 서비스와 어드민 페이지 구현",
    tags: ["#Vue", "#Vuetify", "#1인"],
    hue: "navy",
    demo: "https://cwmgy.ajuautorium.co.kr/customer",
    likes: 152,
  },
];

const HUE_GRADIENTS = {
  teal: "linear-gradient(160deg, #0d2b29 0%, #163f3c 45%, #0a0a0c 100%)",
  plum: "linear-gradient(160deg, #2a1530 0%, #3b1f3d 45%, #0a0a0c 100%)",
  rust: "linear-gradient(160deg, #2c160e 0%, #4a2418 45%, #0a0a0c 100%)",
  navy: "linear-gradient(160deg, #0f1626 0%, #1c2541 45%, #0a0a0c 100%)",
  olive: "linear-gradient(160deg, #1f230f 0%, #38421a 45%, #0a0a0c 100%)",
  wine: "linear-gradient(160deg, #270d18 0%, #3d1a2b 45%, #0a0a0c 100%)",
};

const ACCENT = "#7C5CFF";
const TEXT_PRIMARY = "#F5F3F0";
const TEXT_SECONDARY = "#B8B4C0";

const STYLE_BLOCK = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

  .spf-feed {
    width: 100%;
    height: 100vh;
    overflow-y: scroll;
    scroll-snap-type: y mandatory;
  }
  .spf-feed::-webkit-scrollbar { display: none; }
  .spf-feed { -ms-overflow-style: none; scrollbar-width: none; }

  .spf-slide {
    width: 100%;
    height: 100vh;
    scroll-snap-align: start;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: flex-end;
  }

  .spf-icon-btn {
    background: transparent;
    border: none;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 6px;
    border-radius: 999px;
    transition: transform 0.15s ease;
    color: inherit;
  }
  .spf-icon-btn:hover { transform: translateY(-2px); }
  .spf-icon-btn:focus-visible {
    outline: 2px solid ${ACCENT};
    outline-offset: 3px;
  }

  .spf-progress-track {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 3px;
    background: rgba(255, 255, 255, 0.15);
    z-index: 20;
    pointer-events: none;
  }
  .spf-progress-fill {
    height: 100%;
    background: ${ACCENT};
    transition: width 0.12s linear;
  }

  @keyframes spf-bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(8px); }
  }
  .spf-bounce { animation: spf-bounce 1.6s ease-in-out infinite; }

  @keyframes spf-flash {
    0% { opacity: 0; transform: scale(0.75); }
    25% { opacity: 1; transform: scale(1); }
    100% { opacity: 0; transform: scale(1); }
  }
  .spf-flash { animation: spf-flash 0.6s ease forwards; }

  @media (prefers-reduced-motion: reduce) {
    .spf-bounce { animation: none; }
    .spf-flash { animation: none; opacity: 0; }
  }
`;

function Slide({
  project,
  index,
  isActive,
  liked,
  isPlaying,
  onToggleLike,
  onTogglePlay,
  setRef,
}) {
  return (
    <section
      ref={setRef}
      data-index={index}
      className="spf-slide"
      style={{ background: HUE_GRADIENTS[project.hue] }}
    >
      {/* 배경 모티프 (실제 이미지/영상 들어갈 자리) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 140,
            lineHeight: 1,
            color: "rgba(255,255,255,0.04)",
            userSelect: "none",
          }}
        >
          {"{ }"}
        </span>
      </div>

      {/* 가독성용 오버레이 + 탭하면 재생/정지 토글 */}
      <div
        onClick={onTogglePlay}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          cursor: "pointer",
          background:
            "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 45%, rgba(0,0,0,0.3) 100%)",
        }}
      />

      {/* 캡션 블록 */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          padding: "0 88px 112px 24px",
          opacity: isActive ? 1 : 0.6,
          transform: isActive ? "translateY(0)" : "translateY(8px)",
          transition: "all 0.7s ease",
          pointerEvents: "none",
        }}
      >
        <h2
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: 28,
            letterSpacing: "-0.01em",
            color: TEXT_PRIMARY,
            margin: "0 0 8px 0",
          }}
        >
          {project.title}
        </h2>
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 14,
            lineHeight: 1.6,
            color: "rgba(245,243,240,0.9)",
            margin: "0 0 12px 0",
            maxWidth: 420,
          }}
        >
          {project.description}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {project.tags.map((tag) => (
            <span
              key={tag}
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                padding: "4px 10px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "rgba(245,243,240,0.9)",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* 우측 액션 레일 */}
      <div
        style={{
          position: "absolute",
          right: 12,
          bottom: 112,
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
        }}
      >
        <button
          className="spf-icon-btn"
          onClick={onTogglePlay}
          aria-label={isPlaying ? "일시정지" : "재생"}
        >
          {isPlaying ? (
            <Pause size={22} color="#ffffff" />
          ) : (
            <Play size={22} color="#ffffff" fill="#ffffff" />
          )}
        </button>
        <span
          style={{
            width: 18,
            height: 1,
            background: "rgba(255,255,255,0.2)",
          }}
        />
        <button
          className="spf-icon-btn"
          onClick={onToggleLike}
          aria-label="좋아요"
        >
          <Heart
            size={26}
            color={liked ? ACCENT : "#ffffff"}
            fill={liked ? ACCENT : "none"}
          />
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              color: "rgba(255,255,255,0.85)",
            }}
          >
            {project.likes + (liked ? 1 : 0)}
          </span>
        </button>
        <a
          className="spf-icon-btn"
          href={project.github}
          target="_blank"
          rel="noreferrer"
          aria-label="GitHub 코드 보기"
          onClick={(e) => e.stopPropagation()}
        >
          <Code2 size={24} color="#ffffff" />
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              color: "rgba(255,255,255,0.85)",
            }}
          >
            Code
          </span>
        </a>
        <a
          className="spf-icon-btn"
          href={project.demo}
          target="_blank"
          rel="noreferrer"
          aria-label="라이브 데모 보기"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink size={24} color="#ffffff" />
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              color: "rgba(255,255,255,0.85)",
            }}
          >
            Demo
          </span>
        </a>
      </div>
    </section>
  );
}

export default function ShortsPortfolio() {
  const [active, setActive] = useState(0);
  const [liked, setLiked] = useState({});
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progressMs, setProgressMs] = useState(0);
  const [flash, setFlash] = useState(null); // 'play' | 'pause' | null
  const slideRefs = useRef([]);
  const advancedRef = useRef(false);

  // 활성 슬라이드 감지
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            const idx = Number(entry.target.getAttribute("data-index"));
            setActive(idx);
          }
        });
      },
      { threshold: [0.5] },
    );
    slideRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // 슬라이드가 바뀌면 타이머 리셋 + 정지 상태였어도 자동재생 시작
  useEffect(() => {
    setProgressMs(0);
    advancedRef.current = false;
    setIsPlaying(true);
  }, [active]);

  // 재생 중일 때 5초 타이머 진행 + 자동 다음 이동
  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => {
      setProgressMs((prev) => {
        const next = prev + 100;
        if (next >= DURATION_MS) {
          if (!advancedRef.current) {
            advancedRef.current = true;
            if (active < PROJECTS.length - 1) {
              requestAnimationFrame(() => scrollTo(active + 1));
            }
          }
          return DURATION_MS;
        }
        return next;
      });
    }, 100);
    return () => clearInterval(id);
  }, [isPlaying, active]);

  // 키보드 위/아래 이동
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        scrollTo(Math.min(active + 1, PROJECTS.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        scrollTo(Math.max(active - 1, 0));
      } else if (e.key === " ") {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, isPlaying]);

  // 토글 플래시 아이콘 자동 숨김
  useEffect(() => {
    if (flash === null) return;
    const t = setTimeout(() => setFlash(null), 550);
    return () => clearTimeout(t);
  }, [flash]);

  const scrollTo = (idx) => {
    slideRefs.current[idx]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const toggleLike = (id) => {
    setLiked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const togglePlay = () => {
    setIsPlaying((prev) => {
      const next = !prev;
      setFlash(next ? "play" : "pause");
      return next;
    });
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        background: "#0a0a0c",
        color: TEXT_PRIMARY,
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <style>{STYLE_BLOCK}</style>

      <div
        className="spf-feed"
        onScroll={() => !hasScrolled && setHasScrolled(true)}
      >
        {PROJECTS.map((p, idx) => (
          <Slide
            key={p.id}
            project={p}
            index={idx}
            isActive={active === idx}
            liked={!!liked[p.id]}
            isPlaying={isPlaying}
            onToggleLike={() => toggleLike(p.id)}
            onTogglePlay={togglePlay}
            setRef={(el) => (slideRefs.current[idx] = el)}
          />
        ))}
      </div>

      {/* 상단 바 */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px",
          zIndex: 20,
          pointerEvents: "none",
        }}
      >
        <span
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 500,
            fontSize: 14,
            letterSpacing: "0.04em",
            color: "rgba(245,243,240,0.9)",
          }}
        >
          PORTFOLIO
        </span>
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12,
            color: TEXT_SECONDARY,
          }}
        >
          {String(active + 1).padStart(2, "0")} /{" "}
          {String(PROJECTS.length).padStart(2, "0")}
        </span>
      </div>

      {/* 유튜브 쇼츠 스타일 하단 가로 프로그레스바 - 활성 게시물의 5초 진행률 */}
      <div className="spf-progress-track">
        <div
          className="spf-progress-fill"
          style={{
            width: `${Math.min(100, (progressMs / DURATION_MS) * 100)}%`,
          }}
        />
      </div>

      {/* 재생/정지 토글 플래시 아이콘 */}
      {flash && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 30,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <div
            className="spf-flash"
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "rgba(0,0,0,0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {flash === "play" ? (
              <Play size={30} color="#ffffff" fill="#ffffff" />
            ) : (
              <Pause size={30} color="#ffffff" fill="#ffffff" />
            )}
          </div>
        </div>
      )}

      {/* 첫 진입 스크롤 힌트 */}
      {!hasScrolled && (
        <div
          style={{
            position: "absolute",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 20,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            pointerEvents: "none",
          }}
        >
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              color: TEXT_SECONDARY,
            }}
          >
            스크롤해서 더보기
          </span>
          <ChevronDown
            size={18}
            color={TEXT_SECONDARY}
            className="spf-bounce"
          />
        </div>
      )}
    </div>
  );
}
