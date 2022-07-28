import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import Heatmap3D from './heatmap';
import styles from './index.less';

export default function IndexPage() {
  return (
    <div className={styles.container}>
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 100]} />
        <OrbitControls />
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <pointLight position={[-10, -10, -10]} />
        <Heatmap3D />
      </Canvas>
    </div>
  )
}


