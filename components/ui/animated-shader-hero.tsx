"use client";

import React, { useRef, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { LocationIcon } from "@/components/ui/social-icons";
import { SocialRail } from "@/components/ui/social-rail";
import type { SocialLink } from "@/lib/profile";

interface HeroProps {
  /** Status dot + role, with an optional availability note after a hairline. */
  eyebrow?: {
    role: string;
    status?: string;
  };
  /** Rendered as the display headline, one line per word. */
  name: string;
  /** Inline rail under the name; one item highlights at a time. */
  specialties?: readonly string[];
  bio: string;
  location?: {
    place: string;
    note?: string;
  };
  /** Contact links rendered as the interactive chip row. */
  socials?: readonly SocialLink[];
  /** Right-hand column of the hero. Reserved for the "ask me anything" chatbot. */
  aside?: React.ReactNode;
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

const SPEC_DWELL_MS = 1900;

const Hero: React.FC<HeroProps> = ({
  eyebrow,
  name,
  specialties,
  bio,
  location,
  socials,
  aside,
  buttons,
  className = "",
}) => {
  const canvasRef = useShaderBackground();
  const nameLines = useMemo(() => name.split(/\s+/).filter(Boolean), [name]);

  // Walks the highlight along the specialty rail, echoing the shader's sweep.
  const [activeSpec, setActiveSpec] = useState(0);
  const specCount = specialties?.length ?? 0;

  useEffect(() => {
    if (specCount < 2) return;
    const id = setInterval(
      () => setActiveSpec((i) => (i + 1) % specCount),
      SPEC_DWELL_MS,
    );
    return () => clearInterval(id);
  }, [specCount]);

  return (
    <div className={`relative w-full min-h-screen overflow-hidden bg-black ${className}`}>
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

      <div className="relative z-10 flex min-h-screen items-center text-white">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-14 px-6 pt-24 pb-28 md:px-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:gap-16">
          {/* ---------- LEFT: identity ---------- */}
          <div className="relative">
            {eyebrow && (
              <div className="animate-fade-in-down hero-eyebrow mb-6">
                <span className="status-dot" aria-hidden />
                <span>{eyebrow.role}</span>
                {eyebrow.status && (
                  <>
                    <span className="hero-hairline" aria-hidden />
                    <span className="font-normal text-white/45">{eyebrow.status}</span>
                  </>
                )}
              </div>
            )}

            <div className="relative">
              <motion.span
                aria-hidden
                className="pointer-events-none absolute -top-6 -left-4 text-2xl md:text-3xl"
                style={{ color: "var(--color-lime)" }}
                animate={{ rotate: [0, 20, -20, 0], scale: [1, 1.3, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                &#10022;
              </motion.span>

              <h1 className="hero-name">
                {nameLines.map((line, i) => (
                  <span
                    key={line}
                    className="hero-name-line"
                    style={{
                      animationDelay: `${0.15 + i * 0.14}s`,
                      backgroundSize: `100% ${nameLines.length * 100}%`,
                      backgroundPositionY:
                        nameLines.length > 1
                          ? `${(i / (nameLines.length - 1)) * 100}%`
                          : "50%",
                    }}
                  >
                    {line}
                  </span>
                ))}
              </h1>

              <motion.span
                aria-hidden
                className="pointer-events-none absolute -right-1 -bottom-3 text-xl md:text-2xl"
                style={{ color: "var(--color-pink)" }}
                animate={{ rotate: [0, -30, 30, 0], scale: [1, 1.4, 1] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
              >
                &#10023;
              </motion.span>
            </div>

            {specialties && specialties.length > 0 && (
              <ul className="animate-fade-in-up animation-delay-400 spec-rail mt-6">
                {specialties.map((item, i) => (
                  <li
                    key={item}
                    className={`spec-item${i === activeSpec ? " is-active" : ""}`}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            )}

            <div className="animate-fade-in-up animation-delay-600 hero-rule mt-7 max-w-sm" />

            <p className="animate-fade-in-up animation-delay-600 mt-6 max-w-xl text-[15px] leading-[1.75] font-light tracking-wide text-white/72 md:text-base">
              {bio}
            </p>

            {location && (
              <div className="animate-fade-in-up animation-delay-600 hero-meta mt-5">
                <LocationIcon
                  className="h-3.5 w-3.5"
                  style={{ color: "var(--color-pink)" }}
                />
                <span>{location.place}</span>
                {location.note && (
                  <>
                    <span className="hero-meta-sep" aria-hidden>
                      &middot;
                    </span>
                    <span>{location.note}</span>
                  </>
                )}
              </div>
            )}

            {socials && socials.length > 0 && <SocialRail links={socials} className="mt-7" />}

            {buttons && (
              <div className="animate-fade-in-up animation-delay-800 mt-8 flex flex-col gap-4 sm:flex-row">
                {buttons.primary && (
                  <button
                    onClick={buttons.primary.onClick}
                    className="rounded-full px-8 py-3 text-sm font-black tracking-[0.15em] text-black uppercase transition-all duration-300 hover:scale-105 hover:shadow-xl"
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
                    className="rounded-full border px-8 py-3 text-sm font-black tracking-[0.15em] text-white uppercase backdrop-blur-sm transition-all duration-300 hover:scale-105"
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

          {/* ---------- RIGHT: reserved for the chatbot ---------- */}
          {aside && <div className="hidden lg:block">{aside}</div>}
        </div>
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-white/70"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
      >
        <span className="text-[10px] tracking-[0.3em] uppercase">Scroll</span>
        <motion.div
          className="h-10 w-[2px] rounded-full"
          style={{ background: "linear-gradient(to bottom, #cdfb52, transparent)" }}
          animate={{ scaleY: [0.3, 1, 0.3], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </div>
  );
};

export default Hero;
