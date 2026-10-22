import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';

interface Parti {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  rot: number;
  vr: number;
  c: string;
  heart: boolean;
}

interface Foto {
  src: string;
  pie: string;
}

@Component({
  selector: 'app-cumple',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cumple.component.html',
  styleUrl: './cumple.component.scss',
})
export class CumpleComponent implements AfterViewInit, OnDestroy {
  @ViewChild('confeti') confetiRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('ruta') rutaRef?: ElementRef<SVGPathElement>;
  @ViewChild('rutaViva') rutaVivaRef?: ElementRef<SVGPathElement>;
  @ViewChild('moto') motoRef?: ElementRef<SVGTextElement>;

  fotos: Foto[] = [
    { src: 'assets/fotos/empezo.jpg', pie: 'el día que todo empezó' },
    { src: 'assets/fotos/sonrisa.jpg', pie: 'tu sonrisa favorita' },
    { src: 'assets/fotos/nosotros.jpg', pie: 'nosotros dos' },
    { src: 'assets/fotos/faltan.jpg', pie: 'y los que faltan por vivir' },
  ];

  revelado = false;

  private reduce = false;
  private ctx: CanvasRenderingContext2D | null = null;
  private W = 0;
  private H = 0;
  private parts: Parti[] = [];
  private raf = 0;
  private drizzle = 0;
  private io?: IntersectionObserver;
  private onResize = () => this.sizeCanvas();

  private readonly colores = ['#1fb6a6', '#7fe3d6', '#a9d8f5', '#3c7fb1', '#ffffff'];

  constructor(private host: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    this.reduce =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.setupReveal();
    this.setupCanvas();
    this.bienvenida();
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.raf);
    clearInterval(this.drizzle);
    this.io?.disconnect();
    window.removeEventListener('resize', this.onResize);
  }

  /* ---- interacciones ---- */
  abrirRegalo(): void {
    this.revelado = true;
    this.burst();
    setTimeout(() => this.animarRuta(), 650);
  }

  /* ---- aparición al hacer scroll ---- */
  private setupReveal(): void {
    const items = this.host.nativeElement.querySelectorAll<HTMLElement>('.aparece');
    if ('IntersectionObserver' in window && !this.reduce) {
      this.io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add('visible');
              this.io?.unobserve(e.target);
            }
          });
        },
        { threshold: 0.15 }
      );
      items.forEach((el) => this.io!.observe(el));
    } else {
      items.forEach((el) => el.classList.add('visible'));
    }
  }

  /* ---- confeti ---- */
  private setupCanvas(): void {
    const canvas = this.confetiRef.nativeElement;
    this.ctx = canvas.getContext('2d');
    this.sizeCanvas();
    window.addEventListener('resize', this.onResize);
  }

  private sizeCanvas(): void {
    const canvas = this.confetiRef.nativeElement;
    this.W = canvas.width = window.innerWidth;
    this.H = canvas.height = window.innerHeight;
  }

  private add(n: number, x?: number, y?: number): void {
    for (let i = 0; i < n; i++) {
      this.parts.push({
        x: x == null ? Math.random() * this.W : x,
        y: y == null ? -20 : y,
        vx: (Math.random() - 0.5) * 3,
        vy: Math.random() * 2 + 1.5,
        r: Math.random() * 7 + 4,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.2,
        c: this.colores[(Math.random() * this.colores.length) | 0],
        heart: Math.random() > 0.5,
      });
    }
  }

  private heart(x: number, y: number, s: number, rot: number, color: string): void {
    const ctx = this.ctx!;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(s / 16, s / 16);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, 4);
    ctx.bezierCurveTo(0, 0, -8, 0, -8, -5);
    ctx.bezierCurveTo(-8, -10, 0, -11, 0, -5);
    ctx.bezierCurveTo(0, -11, 8, -10, 8, -5);
    ctx.bezierCurveTo(8, 0, 0, 0, 0, 4);
    ctx.fill();
    ctx.restore();
  }

  private frame = (): void => {
    const ctx = this.ctx;
    if (!ctx) {
      return;
    }
    ctx.clearRect(0, 0, this.W, this.H);
    for (let i = this.parts.length - 1; i >= 0; i--) {
      const p = this.parts[i];
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      p.vy += 0.03;
      if (p.y > this.H + 30) {
        this.parts.splice(i, 1);
        continue;
      }
      ctx.globalAlpha = Math.max(0, Math.min(1, (this.H - p.y) / this.H + 0.3));
      if (p.heart) {
        this.heart(p.x, p.y, p.r * 1.6, p.rot, p.c);
      } else {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r);
        ctx.restore();
      }
    }
    ctx.globalAlpha = 1;
    if (this.parts.length) {
      this.raf = requestAnimationFrame(this.frame);
    }
  };

  private burst(): void {
    if (this.reduce || !this.ctx) {
      return;
    }
    this.add(40, this.W / 2, this.H / 3);
    this.frame();
  }

  private bienvenida(): void {
    if (this.reduce || !this.ctx) {
      return;
    }
    this.add(60);
    this.frame();
    this.drizzle = window.setInterval(() => {
      if (this.parts.length < 40) {
        this.add(6);
      }
      if (this.parts.length) {
        this.frame();
      }
    }, 600);
    setTimeout(() => clearInterval(this.drizzle), 6000);
  }

  /* ---- animación de la motico por la ruta ---- */
  private animarRuta(): void {
    const ruta = this.rutaRef?.nativeElement;
    const viva = this.rutaVivaRef?.nativeElement;
    const moto = this.motoRef?.nativeElement;
    if (!ruta || !viva || !moto) {
      return;
    }
    const L = ruta.getTotalLength();
    viva.style.strokeDasharray = String(L);

    if (this.reduce) {
      viva.style.strokeDashoffset = '0';
      const end = ruta.getPointAtLength(L);
      moto.setAttribute('x', String(end.x));
      moto.setAttribute('y', String(end.y));
      return;
    }

    const run = () => {
      const dur = 3600;
      let t0: number | null = null;
      const step = (ts: number) => {
        if (t0 === null) {
          t0 = ts;
        }
        const k = Math.min(1, (ts - t0) / dur);
        const e = 1 - Math.pow(1 - k, 2);
        const pt = ruta.getPointAtLength(e * L);
        moto.setAttribute('x', String(pt.x));
        moto.setAttribute('y', String(pt.y));
        viva.style.strokeDashoffset = String(L * (1 - e));
        if (k < 1) {
          requestAnimationFrame(step);
        } else {
          this.burst();
          setTimeout(reset, 1600);
        }
      };
      requestAnimationFrame(step);
    };

    const reset = () => {
      viva.style.strokeDashoffset = String(L);
      const start = ruta.getPointAtLength(0);
      moto.setAttribute('x', String(start.x));
      moto.setAttribute('y', String(start.y));
      setTimeout(run, 400);
    };

    viva.style.strokeDashoffset = String(L);
    run();
  }
}
