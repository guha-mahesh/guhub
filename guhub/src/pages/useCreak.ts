import { useEffect, useRef, useState } from "react";

/**
 * The machine's voice, synthesised rather than sampled: a low water rumble,
 * a hiss where the wheel meets the race, and a wooden groan on every quarter
 * turn. Nothing starts until the user asks for it, since browsers block audio
 * before a gesture anyway.
 */
export function useCreak() {
  const [on, setOn] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const stopRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!on) {
      stopRef.current?.();
      stopRef.current = null;
      return;
    }

    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = ctxRef.current ?? new Ctor();
    ctxRef.current = ctx;
    void ctx.resume();

    const master = ctx.createGain();
    master.gain.value = 0.0001;
    master.gain.exponentialRampToValueAtTime(0.5, ctx.currentTime + 1.6);
    master.connect(ctx.destination);

    // one noise buffer, reused for both the rumble and the hiss
    const len = ctx.sampleRate * 3;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    let brown = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      brown = (brown + 0.02 * white) / 1.02;
      data[i] = brown * 3.2;
    }

    const rumble = ctx.createBufferSource();
    rumble.buffer = buf;
    rumble.loop = true;
    const rumbleLp = ctx.createBiquadFilter();
    rumbleLp.type = "lowpass";
    rumbleLp.frequency.value = 140;
    const rumbleGain = ctx.createGain();
    rumbleGain.gain.value = 0.55;
    rumble.connect(rumbleLp).connect(rumbleGain).connect(master);
    rumble.start();

    const hiss = ctx.createBufferSource();
    hiss.buffer = buf;
    hiss.loop = true;
    const hissHp = ctx.createBiquadFilter();
    hissHp.type = "highpass";
    hissHp.frequency.value = 2600;
    const hissGain = ctx.createGain();
    hissGain.gain.value = 0.05;
    hiss.connect(hissHp).connect(hissGain).connect(master);
    hiss.start();

    // a groan of strained wood, pitch sagging as the load comes on
    const groan = (when: number) => {
      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      const f0 = 62 + Math.random() * 26;
      osc.frequency.setValueAtTime(f0, when);
      osc.frequency.exponentialRampToValueAtTime(f0 * 0.72, when + 0.42);

      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.setValueAtTime(300 + Math.random() * 260, when);
      bp.Q.value = 7 + Math.random() * 6;

      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, when);
      g.gain.exponentialRampToValueAtTime(0.16 + Math.random() * 0.1, when + 0.09);
      g.gain.exponentialRampToValueAtTime(0.0001, when + 0.55);

      osc.connect(bp).connect(g).connect(master);
      osc.start(when);
      osc.stop(when + 0.6);
    };

    // the wheel is 26s a turn; groan roughly every quarter of one
    let timer = 0;
    const schedule = () => {
      groan(ctx.currentTime + 0.05);
      timer = window.setTimeout(schedule, 4200 + Math.random() * 3400);
    };
    timer = window.setTimeout(schedule, 700);

    stopRef.current = () => {
      window.clearTimeout(timer);
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
      master.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
      window.setTimeout(() => {
        rumble.stop(); hiss.stop(); master.disconnect();
      }, 620);
    };

    return () => { stopRef.current?.(); stopRef.current = null; };
  }, [on]);

  useEffect(() => () => { void ctxRef.current?.close(); }, []);

  return [on, () => setOn((v) => !v)] as const;
}
