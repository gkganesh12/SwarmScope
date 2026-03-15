import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const vertexShader = `
  uniform float uTime;
  uniform float uSpeed;
  uniform float uNoiseStrength;
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  varying float vDisplacement;
  varying vec3 vReflect;

  // Simplex 3D Noise
  vec4 permute(vec4 x){ return mod(((x*34.0)+1.0)*x, 289.0); }
  vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v){
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod(i, 289.0);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 1.0/7.0;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  void main() {
    float t = uTime * uSpeed;

    // Multi-octave noise — slow, organic mercury morphing
    float n1 = snoise(position * 0.8 + t * 0.15) * 0.6;
    float n2 = snoise(position * 1.6 + t * 0.25) * 0.3;
    float n3 = snoise(position * 3.2 + t * 0.4) * 0.1;
    float displacement = (n1 + n2 + n3) * uNoiseStrength;

    // Slow breathing
    displacement += sin(t * 0.25) * 0.06;

    vDisplacement = displacement;

    vec3 newPosition = position + normal * displacement;

    // Compute displaced normal via finite differences
    float eps = 0.001;
    vec3 tangent1 = normalize(cross(normal, vec3(0.0, 1.0, 0.0)));
    if (length(cross(normal, vec3(0.0, 1.0, 0.0))) < 0.001)
      tangent1 = normalize(cross(normal, vec3(1.0, 0.0, 0.0)));
    vec3 tangent2 = normalize(cross(normal, tangent1));

    vec3 nb1 = position + tangent1 * eps;
    vec3 nb2 = position + tangent2 * eps;

    float d1 = (snoise(nb1*0.8+t*0.15)*0.6 + snoise(nb1*1.6+t*0.25)*0.3 + snoise(nb1*3.2+t*0.4)*0.1) * uNoiseStrength + sin(t*0.25)*0.06;
    float d2 = (snoise(nb2*0.8+t*0.15)*0.6 + snoise(nb2*1.6+t*0.25)*0.3 + snoise(nb2*3.2+t*0.4)*0.1) * uNoiseStrength + sin(t*0.25)*0.06;

    vec3 newNb1 = nb1 + normal * d1;
    vec3 newNb2 = nb2 + normal * d2;
    vNormal = normalize(cross(newNb1 - newPosition, newNb2 - newPosition));

    vec4 worldPos = modelMatrix * vec4(newPosition, 1.0);
    vWorldPos = worldPos.xyz;

    // Reflection vector for environment mapping
    vec3 worldNormal = normalize(mat3(modelMatrix) * vNormal);
    vec3 viewDir = normalize(worldPos.xyz - cameraPosition);
    vReflect = reflect(viewDir, worldNormal);

    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform vec3 uColorDeep;
  uniform vec3 uColorMid;
  uniform vec3 uColorHighlight;
  uniform vec3 uColorRim;
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  varying float vDisplacement;
  varying vec3 vReflect;

  void main() {
    vec3 viewDir = normalize(cameraPosition - vWorldPos);

    // Fresnel — strong for mercury look
    float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 4.0);

    // Fake environment reflection using reflection vector
    float env = 0.0;
    env += sin(vReflect.x * 4.0 + uTime * 0.15) * 0.3;
    env += cos(vReflect.y * 3.0 - uTime * 0.1) * 0.3;
    env += sin(vReflect.z * 5.0 + uTime * 0.2) * 0.2;
    env = env * 0.5 + 0.5;

    // Base color: deep to mid based on displacement
    float t = smoothstep(-0.2, 0.25, vDisplacement);
    vec3 baseColor = mix(uColorDeep, uColorMid, t);

    // Add highlight color at high displacement peaks
    baseColor = mix(baseColor, uColorHighlight, smoothstep(0.15, 0.35, vDisplacement) * 0.4);

    // Multi-light setup
    vec3 L1 = normalize(vec3(3.0, 4.0, 5.0));
    vec3 L2 = normalize(vec3(-4.0, -2.0, 3.0));
    vec3 L3 = normalize(vec3(0.0, 5.0, -3.0));

    vec3 H1 = normalize(L1 + viewDir);
    vec3 H2 = normalize(L2 + viewDir);
    vec3 H3 = normalize(L3 + viewDir);

    // Specular — sharp for metallic feel
    float spec1 = pow(max(dot(vNormal, H1), 0.0), 120.0) * 1.5;
    float spec2 = pow(max(dot(vNormal, H2), 0.0), 80.0) * 0.8;
    float spec3 = pow(max(dot(vNormal, H3), 0.0), 60.0) * 0.6;

    // Diffuse
    float diff = max(dot(vNormal, L1), 0.0) * 0.5
               + max(dot(vNormal, L2), 0.0) * 0.25
               + max(dot(vNormal, L3), 0.0) * 0.15;

    // Ambient
    float ambient = 0.12;

    // Combine
    vec3 color = baseColor * (ambient + diff);

    // Environment reflection tint
    color += baseColor * env * 0.2;

    // Specular highlights — white-ish
    color += vec3(0.95, 0.97, 1.0) * spec1;
    color += uColorHighlight * spec2;
    color += uColorRim * spec3 * 0.5;

    // Rim glow
    color += uColorRim * fresnel * 0.6;

    // Subtle iridescent sheen
    float iri = sin(vDisplacement * 12.0 + uTime * 0.2) * 0.5 + 0.5;
    color += mix(uColorMid, uColorHighlight, iri) * fresnel * 0.15;

    // Very faint inner glow at the core
    float core = 1.0 - fresnel;
    color += uColorDeep * core * 0.05;

    gl_FragColor = vec4(color, 1.0);
  }
`;

interface MercuryBlobProps {
  scale?: number;
}

export const MercuryBlob = ({ scale = 2.8 }: MercuryBlobProps) => {
  const meshRef = useRef<THREE.Mesh>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSpeed: { value: 0.6 },
      uNoiseStrength: { value: 0.35 },
      uColorDeep: { value: new THREE.Color('#060d1a') },
      uColorMid: { value: new THREE.Color('#0d3b2e') },
      uColorHighlight: { value: new THREE.Color('#10B981') },
      uColorRim: { value: new THREE.Color('#3B82F6') },
    }),
    []
  );

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    uniforms.uTime.value = time;

    if (meshRef.current) {
      meshRef.current.rotation.y = time * 0.04;
      meshRef.current.rotation.x = Math.sin(time * 0.025) * 0.08;
    }
  });

  return (
    <mesh ref={meshRef} scale={scale}>
      <icosahedronGeometry args={[1, 64]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
};

// Floating particles orbiting the blob
export const FloatingParticles = ({ count = 120 }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 3.5 + Math.random() * 3.5;
      const speed = 0.1 + Math.random() * 0.3;
      const size = 0.008 + Math.random() * 0.025;
      temp.push({ theta, phi, radius, speed, size });
    }
    return temp;
  }, [count]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    particles.forEach((p, i) => {
      const t = time * p.speed;
      const r = p.radius + Math.sin(t * 0.4) * 0.2;
      dummy.position.set(
        r * Math.sin(p.phi + t * 0.08) * Math.cos(p.theta + t * 0.12),
        r * Math.sin(p.phi + t * 0.08) * Math.sin(p.theta + t * 0.12),
        r * Math.cos(p.phi + t * 0.08)
      );
      const s = p.size * (0.7 + Math.sin(t * 1.5) * 0.3);
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      meshRef.current?.setMatrixAt(i, dummy.matrix);
    });

    if (meshRef.current) {
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial
        color="#10B981"
        transparent
        opacity={0.5}
        blending={THREE.AdditiveBlending}
      />
    </instancedMesh>
  );
};

// Thin orbital rings
export const OrbitalRing = ({
  radius = 4,
  speed = 0.3,
  tilt = 0,
  opacity = 0.12,
}: {
  radius?: number;
  speed?: number;
  tilt?: number;
  opacity?: number;
}) => {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (ringRef.current) {
      ringRef.current.rotation.z = tilt;
      ringRef.current.rotation.y = time * speed;
    }
  });

  return (
    <mesh ref={ringRef}>
      <torusGeometry args={[radius, 0.004, 8, 200]} />
      <meshBasicMaterial
        color="#10B981"
        transparent
        opacity={opacity}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
};
