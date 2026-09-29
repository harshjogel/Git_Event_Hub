import React, { useRef, useEffect } from 'react';
import { Renderer, Program, Mesh, Triangle } from 'ogl';

interface LiquidChromeProps extends React.HTMLAttributes<HTMLDivElement> {
  baseColor?: [number, number, number];
  speed?: number;
  amplitude?: number;
  frequencyX?: number;
  frequencyY?: number;
  interactive?: boolean;
}

export const LiquidChrome: React.FC<LiquidChromeProps> = ({
  baseColor = [0.18, 0.2, 0.45],
  speed = 0.22,
  amplitude = 0.35,
  frequencyX = 2.8,
  frequencyY = 2.8,
  interactive = true,
  className = '',
  ...props
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    let renderer: Renderer | null = null;
    try {
      renderer = new Renderer({ antialias: true, alpha: true });
    } catch (e) {
      console.warn('WebGL not supported for LiquidChrome animation:', e);
      return;
    }

    const gl = renderer.gl;
    gl.clearColor(0.04, 0.04, 0.08, 0.95);

    const vertexShader = `
      attribute vec2 position;
      attribute vec2 uv;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const fragmentShader = `
      precision highp float;
      uniform float uTime;
      uniform vec3 uResolution;
      uniform vec3 uBaseColor;
      uniform float uAmplitude;
      uniform float uFrequencyX;
      uniform float uFrequencyY;
      uniform vec2 uMouse;
      varying vec2 vUv;

      vec4 renderImage(vec2 uvCoord) {
          vec2 fragCoord = uvCoord * uResolution.xy;
          vec2 uv = (2.0 * fragCoord - uResolution.xy) / min(uResolution.x, uResolution.y);

          for (float i = 1.0; i < 9.0; i++) {
              uv.x += (uAmplitude / i) * cos(i * uFrequencyX * uv.y + uTime + uMouse.x * 3.14159);
              uv.y += (uAmplitude / i) * cos(i * uFrequencyY * uv.x + uTime + uMouse.y * 3.14159);
          }

          vec2 diff = (uvCoord - uMouse);
          float dist = length(diff);
          float falloff = exp(-dist * 16.0);
          float ripple = sin(12.0 * dist - uTime * 2.5) * 0.035;
          uv += (diff / (dist + 0.0001)) * ripple * falloff;

          // Metallic liquid reflection formula
          vec3 color = uBaseColor / max(0.08, abs(sin(uTime - uv.y - uv.x)));
          // Add subtle cyan / purple iridescence highlight
          color += vec3(0.08, 0.16, 0.25) * sin(uv.x * 4.0 + uTime);
          return vec4(color, 1.0);
      }

      void main() {
          vec4 col = vec4(0.0);
          int samples = 0;
          for (int i = -1; i <= 1; i++) {
              for (int j = -1; j <= 1; j++) {
                  vec2 offset = vec2(float(i), float(j)) * (1.0 / min(uResolution.x, uResolution.y));
                  col += renderImage(vUv + offset);
                  samples++;
              }
          }
          gl_FragColor = col / float(samples);
      }
    `;

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uResolution: {
          value: new Float32Array([gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height])
        },
        uBaseColor: { value: new Float32Array(baseColor) },
        uAmplitude: { value: amplitude },
        uFrequencyX: { value: frequencyX },
        uFrequencyY: { value: frequencyY },
        uMouse: { value: new Float32Array([0.5, 0.5]) }
      }
    });
    const mesh = new Mesh(gl, { geometry, program });

    function resize() {
      if (!container || !renderer) return;
      const w = container.offsetWidth || window.innerWidth;
      const h = container.offsetHeight || 500;
      renderer.setSize(w, h);
      const resUniform = program.uniforms.uResolution.value as Float32Array;
      resUniform[0] = gl.canvas.width;
      resUniform[1] = gl.canvas.height;
      resUniform[2] = gl.canvas.width / (gl.canvas.height || 1);
    }

    window.addEventListener('resize', resize);
    resize();

    function handleMouseMove(event: MouseEvent) {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const x = (event.clientX - rect.left) / (rect.width || 1);
      const y = 1 - (event.clientY - rect.top) / (rect.height || 1);
      const mouseUniform = program.uniforms.uMouse.value as Float32Array;
      mouseUniform[0] = Math.max(0, Math.min(1, x));
      mouseUniform[1] = Math.max(0, Math.min(1, y));
    }

    function handleTouchMove(event: TouchEvent) {
      if (!container || event.touches.length === 0) return;
      const touch = event.touches[0];
      const rect = container.getBoundingClientRect();
      const x = (touch.clientX - rect.left) / (rect.width || 1);
      const y = 1 - (touch.clientY - rect.top) / (rect.height || 1);
      const mouseUniform = program.uniforms.uMouse.value as Float32Array;
      mouseUniform[0] = Math.max(0, Math.min(1, x));
      mouseUniform[1] = Math.max(0, Math.min(1, y));
    }

    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('touchmove', handleTouchMove);
    }

    let animationId: number;
    function update(t: number) {
      animationId = requestAnimationFrame(update);
      program.uniforms.uTime.value = t * 0.001 * speed;
      renderer?.render({ scene: mesh });
    }
    animationId = requestAnimationFrame(update);

    // Apply canvas styling
    gl.canvas.style.width = '100%';
    gl.canvas.style.height = '100%';
    gl.canvas.style.display = 'block';
    gl.canvas.style.position = 'absolute';
    gl.canvas.style.inset = '0';
    gl.canvas.style.pointerEvents = 'none';

    container.appendChild(gl.canvas);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
      if (interactive) {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('touchmove', handleTouchMove);
      }
      if (gl.canvas.parentElement) {
        gl.canvas.parentElement.removeChild(gl.canvas);
      }
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [baseColor, speed, amplitude, frequencyX, frequencyY, interactive]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      {...props}
    />
  );
};

export default LiquidChrome;
