import { useEffect, useRef, useState } from 'react';

const CircularSim = ({ hideResults = false }) => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const [radius, setRadius] = useState(20);
    const [velocity, setVelocity] = useState(5);
    const [mass, setMass] = useState(10);

    const [stats, setStats] = useState({ t: 0, a_c: 0, f_c: 0, period: 0 });
    const [isRunning, setIsRunning] = useState(false);

    const simState = useRef({
        time: 0,
        animationId: null,
        r: 20,
        v: 5,
        m: 10,
        scale: 6, // pixels per meter
        dt: 0.02
    });

    const drawFrame = (ctx, canvas, angle) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const { r, scale } = simState.current;
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;

        const scaledR = r * scale;

        // Draw central anchor
        ctx.beginPath();
        ctx.arc(cx, cy, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#9ca3af';
        ctx.fill();

        // Draw path (orbit)
        ctx.beginPath();
        ctx.arc(cx, cy, scaledR, 0, Math.PI * 2);
        ctx.strokeStyle = document.body.classList.contains('light-mode') ? '#d1d5db' : '#4b5563';
        ctx.lineWidth = 1;
        ctx.stroke();

        const bx = cx + scaledR * Math.cos(angle);
        const by = cy + scaledR * Math.sin(angle);

        // Draw string
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(bx, by);
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw moving mass
        ctx.beginPath();
        ctx.arc(bx, by, 8 + Math.sqrt(simState.current.m), 0, Math.PI * 2);
        ctx.fillStyle = '#ef4444';
        ctx.fill();

        // Draw velocity vector (tangential)
        if (velocity > 0) {
            const vLen = velocity * 4;
            ctx.beginPath();
            ctx.moveTo(bx, by);
            ctx.lineTo(bx - vLen * Math.sin(angle), by + vLen * Math.cos(angle));
            ctx.strokeStyle = '#3b82f6';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Draw arrow head for velocity
            ctx.beginPath();
            ctx.fillStyle = '#3b82f6';
            ctx.arc(bx - vLen * Math.sin(angle), by + vLen * Math.cos(angle), 3, 0, Math.PI * 2);
            ctx.fill();
        }
    };

    const animate = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const { v, r, m, dt } = simState.current;
        let { time } = simState.current;

        // angular velocity omega = v / r
        const omega = v / r;
        const angle = omega * time;

        const a_c = (v * v) / r; // centripetal acceleration
        const f_c = m * a_c; // centripetal force
        const period = (2 * Math.PI * r) / v;

        setStats({ t: time, a_c, f_c, period });

        drawFrame(ctx, canvas, angle);
        simState.current.time += dt;
        simState.current.animationId = requestAnimationFrame(animate);
    };

    const toggleSim = () => {
        if (isRunning) {
            setIsRunning(false);
            cancelAnimationFrame(simState.current.animationId);
        } else {
            simState.current.v = parseFloat(velocity);
            simState.current.r = parseFloat(radius);
            simState.current.m = parseFloat(mass);
            setIsRunning(true);
            animate();
        }
    };

    const resetSim = () => {
        setIsRunning(false);
        cancelAnimationFrame(simState.current.animationId);
        setStats({ t: 0, a_c: 0, f_c: 0, period: 0 });
        const canvas = canvasRef.current;
        if (canvas) {
            simState.current.r = parseFloat(radius);
            simState.current.v = parseFloat(velocity);
            simState.current.m = parseFloat(mass);
            simState.current.time = 0;
            drawFrame(canvas.getContext('2d'), canvas, 0);
        }
    };

    useEffect(() => {
        const handleResize = () => {
            const canvas = canvasRef.current;
            const container = containerRef.current;
            if (canvas && container) {
                canvas.width = container.offsetWidth;
                canvas.height = container.offsetHeight;
                if (!isRunning) drawFrame(canvas.getContext('2d'), canvas, 0);
            }
        };
        window.addEventListener('resize', handleResize);
        handleResize();
        const currentSimState = simState.current;
        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(currentSimState.animationId);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!isRunning) {
            resetSim();
        }
        // eslint-disable-next-line
    }, [radius, velocity, mass]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
            <div className="glass" style={{ padding: '1.5rem', borderRadius: '12px', display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '1rem', flex: 1, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '150px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Радиус (м): {radius}</label>
                        <input type="range" min="5" max="40" value={radius} onChange={e => setRadius(e.target.value)} style={{ width: '100%', accentColor: 'var(--primary)' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: '150px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Линейная Скорость (м/с): {velocity}</label>
                        <input type="range" min="1" max="50" value={velocity} onChange={e => setVelocity(e.target.value)} style={{ width: '100%', accentColor: 'var(--primary)' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: '150px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Масса (кг): {mass}</label>
                        <input type="range" min="1" max="100" value={mass} onChange={e => setMass(e.target.value)} style={{ width: '100%', accentColor: 'var(--primary)' }} />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn-primary" onClick={toggleSim} style={{ minWidth: '120px' }}>
                        {isRunning ? 'ПАУЗА' : 'ЗАПУСК'}
                    </button>
                    <button className="btn-secondary" onClick={resetSim}>
                        СБРОС
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', flex: 1, minHeight: '400px', flexWrap: 'wrap' }}>
                <div className="glass" ref={containerRef} style={{ flex: '3 1 400px', borderRadius: '12px', position: 'relative', overflow: 'hidden' }}>
                    <canvas ref={canvasRef} style={{ display: 'block' }}></canvas>
                </div>

                <div className="glass" style={{ flex: '1 1 250px', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <h3 style={{ margin: 0, borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>Телеметрия</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Ускорение ц/с (a):</span>
                        <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{hideResults ? '❓' : `${stats.a_c.toFixed(2)} м/с²`}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Сила натяжения (F):</span>
                        <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{hideResults ? '❓' : `${stats.f_c.toFixed(1)} Н`}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Период обр. (T):</span>
                        <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{hideResults ? '❓' : `${stats.period.toFixed(2)} с`}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Время (t):</span>
                        <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{hideResults ? '❓' : `${stats.t.toFixed(2)} с`}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CircularSim;
