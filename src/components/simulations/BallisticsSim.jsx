import { useEffect, useRef, useState, useCallback } from 'react';

const BallisticsSim = () => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const [velocity, setVelocity] = useState(25);
    const [angle, setAngle] = useState(45);
    const [gravity, setGravity] = useState(9.8);
    const [stats, setStats] = useState({ t: 0, x: 0, y: 0 });
    const [isRunning, setIsRunning] = useState(false);

    // Simulation state refs to avoid stale closures in requestAnimationFrame
    const simState = useRef({
        time: 0,
        trajectory: [],
        cameraX: 0,
        animationId: null,
        v0: 0,
        angleRad: 0,
        g: 0,
        startX: 50,
        startYOffset: 50,
        scale: 4,
        dt: 0.05
    });

    const drawFrame = (ctx, canvas, physX, physY, vx, vy) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const { startX, startYOffset, scale, cameraX, trajectory } = simState.current;

        const screenX = startX + (physX * scale) - cameraX;
        const screenY = (canvas.height - startYOffset) - (physY * scale);

        // Draw Ground
        ctx.beginPath();
        ctx.strokeStyle = document.body.classList.contains('light-mode') ? '#374151' : '#9ca3af';
        ctx.lineWidth = 2;
        ctx.moveTo(0, canvas.height - startYOffset);
        ctx.lineTo(canvas.width, canvas.height - startYOffset);
        ctx.stroke();

        // Draw distance markers (ticks)
        ctx.beginPath();
        ctx.strokeStyle = '#9ca3af';
        ctx.lineWidth = 1;
        ctx.textAlign = 'center';
        ctx.fillStyle = '#6b7280';
        ctx.font = '10px monospace';
        
        const tickSpacingPhys = 50; // Every 50 meters
        const firstVisibleTick = Math.floor(cameraX / (scale * tickSpacingPhys)) - 1;
        const lastVisibleTick = Math.ceil((cameraX + canvas.width) / (scale * tickSpacingPhys)) + 1;
        
        for (let i = firstVisibleTick; i <= lastVisibleTick; i++) {
            if (i < 0) continue;
            const tickPhysX = i * tickSpacingPhys;
            const tickScreenX = startX + (tickPhysX * scale) - cameraX;
            if (tickScreenX >= 0 && tickScreenX <= canvas.width) {
                ctx.moveTo(tickScreenX, canvas.height - startYOffset);
                ctx.lineTo(tickScreenX, canvas.height - startYOffset + 8);
                ctx.fillText(`${tickPhysX}м`, tickScreenX, canvas.height - startYOffset + 20);
            }
        }
        ctx.stroke();

        // Draw Trajectory
        ctx.beginPath();
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 2;
        trajectory.forEach((p, i) => {
            const sx = startX + (p.x * scale) - cameraX;
            const sy = (canvas.height - startYOffset) - (p.y * scale);
            if (i === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
        });
        ctx.stroke();

        // Draw Projectile
        ctx.beginPath();
        ctx.arc(screenX, screenY, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#ef4444';
        ctx.fill();

        // Draw Velocity Vectors
        const vScale = 1.5;
        const drawArrow = (x, y, dx, dy, color) => {
            ctx.beginPath(); ctx.strokeStyle = color; ctx.moveTo(x, y); ctx.lineTo(x + dx, y + dy); ctx.stroke();
        };
        drawArrow(screenX, screenY, vx * vScale, 0, '#3b82f6');
        drawArrow(screenX, screenY, 0, -vy * vScale, '#eab308');
    };

    const drawInitialState = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const v = parseFloat(velocity);
        const aRad = parseFloat(angle) * (Math.PI / 180);
        simState.current.cameraX = 0;
        simState.current.trajectory = [];
        drawFrame(ctx, canvas, 0, 0, v * Math.cos(aRad), v * Math.sin(aRad));
        setStats({ t: 0, x: 0, y: 0 });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [velocity, angle]);

    const animate = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const { v0, angleRad, g, startX, scale, dt } = simState.current;
        let { time, cameraX } = simState.current;

        const x = v0 * Math.cos(angleRad) * time;
        const y = (v0 * Math.sin(angleRad) * time) - (0.5 * g * time * time);
        const vx = v0 * Math.cos(angleRad);
        const vy = v0 * Math.sin(angleRad) - (g * time);

        if ((startX + x * scale) - cameraX > canvas.width * 0.5) {
            simState.current.cameraX = (startX + x * scale) - canvas.width * 0.5;
        }

        setStats({ t: time, x, y: Math.max(0, y) });

        simState.current.trajectory.push({ x, y: Math.max(0, y) });

        if (y < 0 && time > 0) {
            setIsRunning(false);
            drawFrame(ctx, canvas, x, 0, vx, vy);
            return;
        }

        drawFrame(ctx, canvas, x, y, vx, vy);
        simState.current.time += dt;
        simState.current.animationId = requestAnimationFrame(animate);
    };

    const launch = () => {
        if (isRunning) cancelAnimationFrame(simState.current.animationId);
        simState.current.time = 0;
        simState.current.trajectory = [];
        simState.current.cameraX = 0;
        simState.current.v0 = parseFloat(velocity);
        simState.current.angleRad = parseFloat(angle) * (Math.PI / 180);
        simState.current.g = parseFloat(gravity);
        setIsRunning(true);
        animate();
    };

    const resetSim = () => {
        setIsRunning(false);
        cancelAnimationFrame(simState.current.animationId);
        drawInitialState();
    };

    useEffect(() => {
        const handleResize = () => {
            const canvas = canvasRef.current;
            const container = containerRef.current;
            if (canvas && container) {
                canvas.width = container.offsetWidth;
                canvas.height = container.offsetHeight;
                if (!isRunning) drawInitialState();
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
            drawInitialState();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [velocity, angle, gravity]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>

            <div className="glass" style={{ padding: '1.5rem', borderRadius: '12px', display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '1rem', flex: 1 }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Скорость (м/с): {velocity}</label>
                        <input type="range" min="1" max="100" value={velocity} onChange={e => setVelocity(e.target.value)} style={{ width: '100%', accentColor: 'var(--primary)' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Угол (°): {angle}</label>
                        <input type="range" min="0" max="90" value={angle} onChange={e => setAngle(e.target.value)} style={{ width: '100%', accentColor: 'var(--primary)' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Гравитация (м/с²): {gravity}</label>
                        <input type="range" min="1" max="25" step="0.1" value={gravity} onChange={e => setGravity(e.target.value)} style={{ width: '100%', accentColor: 'var(--primary)' }} />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn-primary" onClick={launch} style={{ minWidth: '120px' }}>
                        {isRunning ? 'В полете...' : 'ЗАПУСК'}
                    </button>
                    <button className="btn-secondary" onClick={resetSim}>
                        СБРОС
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', flex: 1, minHeight: '400px' }}>

                <div className="glass" ref={containerRef} style={{ flex: 3, borderRadius: '12px', position: 'relative', overflow: 'hidden' }}>
                    <canvas ref={canvasRef} style={{ display: 'block' }}></canvas>
                </div>

                <div className="glass" style={{ flex: 1, borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <h3 style={{ margin: 0, borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>Телеметрия</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Время (t):</span>
                        <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{stats.t.toFixed(2)} с</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Дальность (x):</span>
                        <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{stats.x.toFixed(1)} м</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Высота (y):</span>
                        <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{stats.y.toFixed(1)} м</span>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default BallisticsSim;
