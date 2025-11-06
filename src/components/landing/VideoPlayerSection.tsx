import React, { useState, useRef, useEffect } from "react";
import {
  FiPlay,
  FiPause,
  FiVolume2,
  FiVolumeX,
  FiMaximize,
  FiMoreVertical,
} from "react-icons/fi";
import "./VideoPlayerSection.css";

/**
 * YouTube video ID
 * 
 * Para usar seu próprio vídeo:
 * 1. Pegue o link do YouTube (ex: https://www.youtube.com/watch?v=ABC123xyz)
 * 2. O ID é a parte após "v=" (no exemplo seria "ABC123xyz")
 * 3. Substitua o valor abaixo pelo ID do seu vídeo
 */
const YOUTUBE_VIDEO_ID = "dQw4w9WgXcQ"; // Substitua pelo ID do seu vídeo

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export const VideoPlayerSection: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState("0:00");
  const [duration, setDuration] = useState("0:00");
  const [player, setPlayer] = useState<any>(null);
  const [isApiReady, setIsApiReady] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);

  // Carrega a API do YouTube
  useEffect(() => {
    // Verifica se a API já está carregada
    if (window.YT && window.YT.Player) {
      setIsApiReady(true);
      return;
    }

    // Cria o script da API do YouTube
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    // Callback quando a API estiver pronta
    window.onYouTubeIframeAPIReady = () => {
      setIsApiReady(true);
    };

    return () => {
      // Cleanup se necessário
    };
  }, []);

  // Inicializa o player quando a API estiver pronta
  useEffect(() => {
    if (!isApiReady || !playerRef.current || player) return;

    const newPlayer = new window.YT.Player(playerRef.current, {
      videoId: YOUTUBE_VIDEO_ID,
      width: "100%",
      height: "100%",
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        enablejsapi: 1,
        fs: 0,
        iv_load_policy: 3,
        modestbranding: 1,
        playsinline: 1,
        rel: 0,
      },
      events: {
        onReady: (event: any) => {
          const durationSeconds = event.target.getDuration();
          setDuration(formatTime(durationSeconds));
        },
        onStateChange: (event: any) => {
          // Estados: -1 (não iniciado), 0 (terminado), 1 (reproduzindo), 2 (pausado), 3 (buffering), 5 (cueado)
          if (event.data === window.YT.PlayerState.PLAYING) {
            setIsPlaying(true);
          } else {
            setIsPlaying(false);
          }

          // Atualiza o tempo decorrido
          if (event.data === window.YT.PlayerState.PLAYING) {
            updateTime(event.target);
          }
        },
      },
    });

    setPlayer(newPlayer);

    return () => {
      if (newPlayer && newPlayer.destroy) {
        newPlayer.destroy();
      }
    };
  }, [isApiReady]);

  // Atualiza o tempo decorrido periodicamente
  useEffect(() => {
    if (!player || !isPlaying) return;

    const interval = setInterval(() => {
      updateTime(player);
    }, 1000);

    return () => clearInterval(interval);
  }, [player, isPlaying]);

  const updateTime = (ytPlayer: any) => {
    try {
      const current = ytPlayer.getCurrentTime();
      setCurrentTime(formatTime(current));
    } catch (error) {
      console.error("Erro ao obter tempo do vídeo:", error);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handlePlayPause = () => {
    if (!player) return;

    try {
      if (isPlaying) {
        player.pauseVideo();
      } else {
        player.playVideo();
      }
    } catch (error) {
      console.error("Erro ao controlar reprodução:", error);
    }
  };

  const handleMute = () => {
    if (!player) return;

    try {
      if (isMuted) {
        player.unMute();
        setIsMuted(false);
      } else {
        player.mute();
        setIsMuted(true);
      }
    } catch (error) {
      console.error("Erro ao controlar áudio:", error);
    }
  };

  const handleFullscreen = () => {
    if (!player) return;

    try {
      player.getIframe().requestFullscreen?.();
    } catch (error) {
      console.error("Erro ao entrar em tela cheia:", error);
    }
  };

  return (
    <div className="video-player-section">
      <div className="video-player-container">
        {/* Top Text Section */}
        <div className="video-text-content">
          {/* Badge */}
          <div className="video-badge">
            <div className="badge-icon-circle">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="9" stroke="#60a5fa" strokeWidth="1.5" />
                <path
                  d="M6 10L9 13L14 7"
                  stroke="#60a5fa"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="badge-label">• REVOLUCIONAMOS MAIS UMA VEZ</span>
          </div>

          {/* Main Headline */}
          <h2 className="video-headline">
            Conheça a nova <span className="brand-name">Dolphinfast</span>
          </h2>

          {/* Description Paragraph */}
          <p className="video-description">
            Mais <strong>tecnológica</strong>, mais <strong>rápida</strong>, mais <strong>conectada</strong> e usando <strong>inteligência artificial</strong> pra entregar velocidade no seu negócio automotivo. Somos o primeiro sistema de gestão com IA do Brasil para estéticas automotivas, valets e estacionamentos.
          </p>
        </div>

          {/* Video Player Area */}
          <div className="video-player-wrapper">
          {/* YouTube Player IFrame */}
          <div
            ref={playerRef}
            className="video-element youtube-player"
            style={{ width: "100%", height: "100%" }}
          ></div>

          {/* Video Controls Bar */}
          <div className="video-controls-bar">
            <div className="controls-left">
              <button
                className="control-button play-button"
                onClick={handlePlayPause}
                aria-label={isPlaying ? "Pausar" : "Reproduzir"}
              >
                {isPlaying ? (
                  <FiPause size={18} />
                ) : (
                  <FiPlay size={18} />
                )}
              </button>
              <span className="time-display">
                {currentTime} / {duration}
              </span>
            </div>

            <div className="controls-right">
              <button
                className="control-button"
                onClick={handleMute}
                aria-label={isMuted ? "Ativar som" : "Desativar som"}
              >
                {isMuted ? (
                  <FiVolumeX size={18} />
                ) : (
                  <FiVolume2 size={18} />
                )}
              </button>
              <button
                className="control-button"
                onClick={handleFullscreen}
                aria-label="Tela cheia"
              >
                <FiMaximize size={18} />
              </button>
              <button
                className="control-button"
                aria-label="Mais opções"
              >
                <FiMoreVertical size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

