import { useCamera } from '../hooks/useCamera';

export const HomePage: React.FC = () => {
  const { videoRef } = useCamera();
  return (
    <div>
      <video autoPlay ref={videoRef} width="640" height="360" />
    </div>
  );
};
