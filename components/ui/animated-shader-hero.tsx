"use client";

import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Typewriter } from "@/components/ui/typewriter";

interface HeroProps {
  trustBadge?: {
    text: string;
    icons?: string[];
  };
  headline: {
    line1: string;
    line2: string | string[];
  };
  subtitle: string;
  buttons?: {
    primary?: {
      text: string;
      onClick?: () => void;
    };
    secondary?: {
      text: string;
      onClick?: () => void;
    };
  };
  className?: string;
}

const defaultShaderSource = `#version 300 es
/*********
* made by Matthias Hurrle (@atzedent)
*/
precision highp float;
out vec4 O;
uniform vec2 resolution;
uniform float time;
#define FC gl_FragCoord.xy
#define T time
#define R resolution
#define MN min(R.x,R.y)
float rnd(vec2 p) {
  p=fract(p*vec2(12.9898,78.233));
  p+=dot(p,p+34.56);
  return fract(p.x*p.y);
}
float noise(in vec2 p) {
  vec2 i=floor(p), f=fract(p), u=f*f*(3.-2.*f);
  float
  a=rnd(i),
  b=rnd(i+vec2(1,0)),
  c=rnd(i+vec2(0,1)),
  d=rnd(i+1.);
  return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);
}
float fbm(vec2 p) {
  float t=.0, a=1.; mat2 m=mat2(1.,-.5,.2,1.2);
  for (int i=0; i<5; i++) {
    t+=a*noise(p);
    p*=2.*m;
    a*=.5;
  }
  return t;
}
float clouds(vec2 p) {
  float d=1., t=.0;
  for (float i=.0; i<3.; i++) {
    float a=d*fbm(i*10.+p.x*.2+.2*(1.+i)*p.y+d+i*i+p);
    t=mix(t,d,a);
    d=a;
    p*=2./(i+1.);
  }
  return t;
}
// palette tuned to sit next to the crimson scan hero:
// crimson core -> magenta mid -> cold lime rim
#define EMBER vec3(1.00,.26,.22)
#define MAGENTA vec3(.97,.34,.64)
#define LIME vec3(.80,.98,.32)
void main(void) {
  vec2 uv=(FC-.5*R)/MN,st=uv*vec2(2,1);
  vec3 col=vec3(0);
  float bg=clouds(vec2(st.x+T*.5,-st.y));
  uv*=1.-.15*(sin(T*.2)*.5+.5);
  for (float i=1.; i<22.; i++) {
    uv+=.08*cos(i*vec2(.1+.01*i, .8)+i*i+T*.5+.1*uv.x);
    // scatter each comet across the full canvas
    vec2 offset=vec2(
      sin(i*2.3+T*.25)*1.6,
      cos(i*1.7+T*.3)*.95
    );
    vec2 p=uv-offset;
    // drift angle gives each comet a different tail direction
    float ang=i*.6+T*.08;
    mat2 rot=mat2(cos(ang),-sin(ang),sin(ang),cos(ang));
    vec2 rp=rot*p;
    // squish along tail axis -> comet streak
    vec2 streak=vec2(rp.x*.22, rp.y);
    float d=length(streak);
    // ramp each comet between ember and magenta instead of full-spectrum
    vec3 tint=mix(EMBER,MAGENTA,sin(i*.9)*.5+.5);
    col+=.0015/d*tint*1.6;
    float b=noise(i+p+bg*1.731);
    col+=.0018*b*mix(tint,LIME,.12)/length(max(p,vec2(b*p.x*.02,p.y)));
    // deep plum haze rather than the old blue-grey
    col=mix(col,vec3(bg*.13,bg*.05,bg*.12),d*.4);
  }
  // extra wide-roaming comets layered on top
  for (float j=0.; j<6.; j++) {
    float t2=T*(.3+j*.04);
    vec2 cpos=vec2(
      sin(j*4.1+t2)*1.8,
      cos(j*3.3+t2*.7)*1.1+sin(j*.7)*.3
    );
    vec2 p=uv-cpos;
    float ang=j*.9+t2*.25;
    mat2 rot=mat2(cos(ang),-sin(ang),sin(ang),cos(ang));
    p=rot*p;
    vec2 streak=vec2(p.x*(.1+.025*j), p.y);
    float d=length(streak);
    // every third streak goes lime so the accent colour still appears
    vec3 tint=mod(j,3.)<1. ? LIME : mix(EMBER,MAGENTA,fract(j*.37));
    col+=.0012/d*tint*1.5;
  }
  // settle the whole frame down onto near-black so page sections blend in
  col=max(col-.012,vec3(0));
  col*=.92;
  O=vec4(col,1);
}`;

class WebGLRenderer {
  private canvas: HTMLCanvasElement;
  private gl: WebGL2RenderingContext;
  private program: WebGLProgram | null = null;
  private vs: WebGLShader | null = null;
  private fs: WebGLShader | null = null;
  private buffer: WebGLBuffer | null = null;
  private scale: number;
  private shaderSource: string;
  private mouseMove: [number, number] = [0, 0];
  private mouseCoords: [number, number] = [0, 0];
  private pointerCoords: number[] = [0, 0];
  private nbrOfPointers = 0;

  private vertexSrc = `#version 300 es
precision highp float;
in vec4 position;
void main(){gl_Position=position;}`;

  private vertices = [-1, 1, -1, -1, 1, 1, 1, -1];

  constructor(canvas: HTMLCanvasElement, scale: number) {
    this.canvas = canvas;
    this.scale = scale;
    this.gl = canvas.getContext("webgl2")!;
    this.gl.viewport(0, 0, canvas.width * scale, canvas.height * scale);
    this.shaderSource = defaultShaderSource;
  }

  updateShader(source: string) {
    this.reset();
    this.shaderSource = source;
    this.setup();
    this.init();
  }

  updateMove(deltas: [number, number]) {
    this.mouseMove = deltas;
  }

  updateMouse(coords: [number, number]) {
    this.mouseCoords = coords;
  }

  updatePointerCoords(coords: number[]) {
    this.pointerCoords = coords;
  }

  updatePointerCount(nbr: number) {
    this.nbrOfPointers = nbr;
  }

  updateScale(scale: number) {
    this.scale = scale;
    this.gl.viewport(0, 0, this.canvas.width * scale, this.canvas.height * scale);
  }

  compile(shader: WebGLShader, source: string) {
    const gl = this.gl;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error("Shader compilation error:", gl.getShaderInfoLog(shader));
    }
  }

  test(source: string) {
    let result: string | null = null;
    const gl = this.gl;
    const shader = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      result = gl.getShaderInfoLog(shader);
    }
    gl.deleteShader(shader);
    return result;
  }

  reset() {
    const gl = this.gl;
    if (this.program && !gl.getProgramParameter(this.program, gl.DELETE_STATUS)) {
      if (this.vs) {
        gl.detachShader(this.program, this.vs);
        gl.deleteShader(this.vs);
      }
      if (this.fs) {
        gl.detachShader(this.program, this.fs);
        gl.deleteShader(this.fs);
      }
      gl.deleteProgram(this.program);
    }
  }

  setup() {
    const gl = this.gl;
    this.vs = gl.createShader(gl.VERTEX_SHADER)!;
    this.fs = gl.createShader(gl.FRAGMENT_SHADER)!;
    this.compile(this.vs, this.vertexSrc);
    this.compile(this.fs, this.shaderSource);
    this.program = gl.createProgram()!;
    gl.attachShader(this.program, this.vs);
    gl.attachShader(this.program, this.fs);
    gl.linkProgram(this.program);
    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(this.program));
    }
  }

  init() {
    const gl = this.gl;
    const program = this.program!;
    this.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);

    const position = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const p = program as WebGLProgram & Record<string, WebGLUniformLocation | null>;
    p.resolution = gl.getUniformLocation(program, "resolution");
    p.time = gl.getUniformLocation(program, "time");
    p.move = gl.getUniformLocation(program, "move");
    p.touch = gl.getUniformLocation(program, "touch");
    p.pointerCount = gl.getUniformLocation(program, "pointerCount");
    p.pointers = gl.getUniformLocation(program, "pointers");
  }

  render(now = 0) {
    const gl = this.gl;
    const program = this.program;
    if (!program || gl.getProgramParameter(program, gl.DELETE_STATUS)) return;

    const p = program as WebGLProgram & Record<string, WebGLUniformLocation | null>;

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.uniform2f(p.resolution, this.canvas.width, this.canvas.height);
    gl.uniform1f(p.time, now * 1e-3);
    gl.uniform2f(p.move, this.mouseMove[0], this.mouseMove[1]);
    gl.uniform2f(p.touch, this.mouseCoords[0], this.mouseCoords[1]);
    gl.uniform1i(p.pointerCount, this.nbrOfPointers);
    gl.uniform2fv(p.pointers, this.pointerCoords);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
}

class PointerHandler {
  private scale: number;
  private active = false;
  private pointers = new Map<number, [number, number]>();
  private lastCoords: [number, number] = [0, 0];
  private moves: [number, number] = [0, 0];

  constructor(element: HTMLCanvasElement, scale: number) {
    this.scale = scale;
    const map = (el: HTMLCanvasElement, s: number, x: number, y: number): [number, number] =>
      [x * s, el.height - y * s];

    element.addEventListener("pointerdown", (e) => {
      this.active = true;
      this.pointers.set(e.pointerId, map(element, this.scale, e.clientX, e.clientY));
    });
    element.addEventListener("pointerup", (e) => {
      if (this.count === 1) this.lastCoords = this.first;
      this.pointers.delete(e.pointerId);
      this.active = this.pointers.size > 0;
    });
    element.addEventListener("pointerleave", (e) => {
      if (this.count === 1) this.lastCoords = this.first;
      this.pointers.delete(e.pointerId);
      this.active = this.pointers.size > 0;
    });
    element.addEventListener("pointermove", (e) => {
      if (!this.active) return;
      this.lastCoords = [e.clientX, e.clientY];
      this.pointers.set(e.pointerId, map(element, this.scale, e.clientX, e.clientY));
      this.moves = [this.moves[0] + e.movementX, this.moves[1] + e.movementY];
    });
  }

  updateScale(scale: number) {
    this.scale = scale;
  }

  get count() {
    return this.pointers.size;
  }
  get move(): [number, number] {
    return this.moves;
  }
  get coords(): number[] {
    return this.pointers.size > 0 ? Array.from(this.pointers.values()).flat() : [0, 0];
  }
  get first(): [number, number] {
    return this.pointers.values().next().value || this.lastCoords;
  }
}

const useShaderBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const rendererRef = useRef<WebGLRenderer | null>(null);
  const pointersRef = useRef<PointerHandler | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;

    const resize = () => {
      const dpr = Math.max(1, 0.5 * window.devicePixelRatio);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      rendererRef.current?.updateScale(dpr);
      pointersRef.current?.updateScale(dpr);
    };

    const loop = (now: number) => {
      if (!rendererRef.current || !pointersRef.current) return;
      rendererRef.current.updateMouse(pointersRef.current.first);
      rendererRef.current.updatePointerCount(pointersRef.current.count);
      rendererRef.current.updatePointerCoords(pointersRef.current.coords);
      rendererRef.current.updateMove(pointersRef.current.move);
      rendererRef.current.render(now);
      animationFrameRef.current = requestAnimationFrame(loop);
    };

    const dpr = Math.max(1, 0.5 * window.devicePixelRatio);
    rendererRef.current = new WebGLRenderer(canvas, dpr);
    pointersRef.current = new PointerHandler(canvas, dpr);
    rendererRef.current.setup();
    rendererRef.current.init();
    resize();

    if (rendererRef.current.test(defaultShaderSource) === null) {
      rendererRef.current.updateShader(defaultShaderSource);
    }

    loop(0);
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      rendererRef.current?.reset();
    };
  }, []);

  return canvasRef;
};

const Hero: React.FC<HeroProps> = ({
  trustBadge,
  headline,
  subtitle,
  buttons,
  className = "",
}) => {
  const canvasRef = useShaderBackground();

  return (
    <div className={`relative w-full h-screen overflow-hidden bg-black ${className}`}>
      <style jsx>{`
        @keyframes fade-in-down {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-down { animation: fade-in-down 0.8s ease-out forwards; }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; opacity: 0; }
        .animation-delay-200 { animation-delay: 0.2s; }
        .animation-delay-400 { animation-delay: 0.4s; }
        .animation-delay-600 { animation-delay: 0.6s; }
        .animation-delay-800 { animation-delay: 0.8s; }
      `}</style>

      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover touch-none"
        style={{ background: "black" }}
      />

      {/* blend the shader down into the page background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 z-[5] edge-fade-bottom"
      />

      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-white">
        {trustBadge && (
          <div className="mb-8 animate-fade-in-down">
            <div
              className="flex items-center gap-2 px-6 py-2.5 backdrop-blur-md border rounded-full text-xs tracking-[0.2em] uppercase"
              style={{
                background: "rgba(247, 86, 163, 0.08)",
                borderColor: "rgba(247, 86, 163, 0.35)",
              }}
            >
              {trustBadge.icons && (
                <div className="flex gap-1">
                  {trustBadge.icons.map((icon, index) => (
                    <span key={index} style={{ color: "var(--color-lime)" }}>
                      {icon}
                    </span>
                  ))}
                </div>
              )}
              <span className="text-white/90">{trustBadge.text}</span>
            </div>
          </div>
        )}

        <div className="text-center space-y-4 max-w-5xl mx-auto px-4">
          <div className="space-y-1">
            <h1
              className="text-5xl md:text-7xl lg:text-8xl font-black uppercase bg-clip-text text-transparent animate-fade-in-up animation-delay-200"
              style={{
                fontFamily: "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif",
                letterSpacing: "0.02em",
                transform: "skewX(-4deg)",
                backgroundImage:
                  "linear-gradient(180deg, #ffffff 0%, #ffffff 55%, #f756a3 100%)",
              }}
            >
              {headline.line1}
            </h1>
            <h1
              className="relative text-5xl md:text-7xl lg:text-8xl font-black uppercase bg-clip-text text-transparent animate-fade-in-up animation-delay-400"
              style={{
                fontFamily: "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif",
                letterSpacing: "0.02em",
                transform: "skewX(-4deg)",
                backgroundImage:
                  "linear-gradient(180deg, #f756a3 0%, #ffffff 55%, #cdfb52 100%)",
              }}
            >
              {Array.isArray(headline.line2) ? (
                <Typewriter
                  text={headline.line2}
                  speed={85}
                  waitTime={1800}
                  deleteSpeed={45}
                  cursorChar="_"
                  cursorClassName="ml-3 inline-block text-[color:var(--color-lime)]"
                />
              ) : (
                headline.line2
              )}
              <motion.span
                aria-hidden
                className="absolute -top-6 -left-4 text-2xl md:text-3xl"
                style={{ color: "var(--color-lime)" }}
                animate={{ rotate: [0, 20, -20, 0], scale: [1, 1.3, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                ✦
              </motion.span>
              <motion.span
                aria-hidden
                className="absolute -bottom-2 -right-6 text-xl md:text-2xl"
                style={{ color: "#f756a3" }}
                animate={{ rotate: [0, -30, 30, 0], scale: [1, 1.4, 1] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
              >
                ✧
              </motion.span>
            </h1>
          </div>

          <div className="max-w-2xl mx-auto animate-fade-in-up animation-delay-600 pt-4">
            <p className="text-base md:text-lg text-white/75 font-light leading-relaxed tracking-wide">
              {subtitle}
            </p>
          </div>

          {buttons && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10 animate-fade-in-up animation-delay-800">
              {buttons.primary && (
                <button
                  onClick={buttons.primary.onClick}
                  className="px-8 py-3 text-black rounded-full font-black text-sm tracking-[0.15em] uppercase transition-all duration-300 hover:scale-105 hover:shadow-xl"
                  style={{
                    background: "var(--color-lime)",
                    boxShadow: "0 0 30px rgba(205, 251, 82, 0.25)",
                  }}
                >
                  {buttons.primary.text}
                </button>
              )}
              {buttons.secondary && (
                <button
                  onClick={buttons.secondary.onClick}
                  className="px-8 py-3 rounded-full font-black text-sm tracking-[0.15em] uppercase text-white transition-all duration-300 hover:scale-105 backdrop-blur-sm border"
                  style={{
                    background: "rgba(247, 86, 163, 0.12)",
                    borderColor: "rgba(247, 86, 163, 0.5)",
                  }}
                >
                  {buttons.secondary.text}
                </button>
              )}
            </div>
          )}
        </div>

        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/70"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          <span className="text-[10px] tracking-[0.3em] uppercase">Scroll</span>
          <motion.div
            className="w-[2px] h-10 rounded-full"
            style={{ background: "linear-gradient(to bottom, #cdfb52, transparent)" }}
            animate={{ scaleY: [0.3, 1, 0.3], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;
