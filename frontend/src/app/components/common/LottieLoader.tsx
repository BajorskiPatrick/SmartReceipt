import React from 'react';
import { DotLottiePlayer } from '@dotlottie/react-player';
import '@dotlottie/react-player/dist/index.css'; // Styl domyślny (opcjonalnie, czasem wymagany)

interface LottieLoaderProps {
  size?: number;
}

export default function LottieLoader({ size = 200 }: LottieLoaderProps) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%' }}>
      <DotLottiePlayer
        src="/loader-cat.lottie" // To wskazuje na plik w folderze public
        autoplay
        loop
        style={{ height: size, width: size }}
      />
    </div>
  );
}